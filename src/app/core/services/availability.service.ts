import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, forkJoin, from, map, mergeMap, of, switchMap, tap, throwError, toArray } from 'rxjs';
import { AuthService } from '../../shared/services/auth.service';
import { AvailabilityConfig, DEFAULT_AVAILABILITY, DateException, Schedule } from '../models/schedule.model';
import { buildMissingSlots, isDayOff, weekdayOf } from '../utils/availability.util';
import { toIso } from '../utils/calendar.util';
import { AvailabilityRepository } from './availability.repository';
import { SchedulesService } from './schedules.service';

const DELETE_CONCURRENCY = 4;

export interface ApplyResult {
  created: number;
  removed: number;
  // booked slots inside a day-off range: left untouched, their appointments must be cancelled first
  booked: number;
  // available slots the backend refused to delete
  failed: number;
}

interface SlotClear {
  exception: DateException;
  mode: 'off' | 'extra';
}

const EMPTY_RESULT: ApplyResult = { created: 0, removed: 0, booked: 0, failed: 0 };

@Injectable({ providedIn: 'root' })
export class AvailabilityService {
  private readonly auth = inject(AuthService);
  private readonly repository = inject(AvailabilityRepository);
  private readonly schedules = inject(SchedulesService);

  private readonly _config = signal<AvailabilityConfig>(DEFAULT_AVAILABILITY);
  private readonly _slots = signal<Schedule[]>([]);
  readonly config = this._config.asReadonly();
  readonly slots = this._slots.asReadonly();

  load(): Observable<void> {
    return this.withDoctor((doctorId) =>
      forkJoin([this.repository.load(doctorId), this.fetchUpcoming(doctorId)]).pipe(
        tap(([config, slots]) => {
          this._config.set(config);
          this._slots.set(slots);
        }),
        map(() => void 0)
      )
    );
  }

  /** Saves the weekly template and creates whatever slots are missing for the horizon. */
  saveWeekly(rules: AvailabilityConfig['rules'], slotMinutes: number, horizonWeeks: number): Observable<ApplyResult> {
    return this.persistAndApply({ ...this._config(), rules, slotMinutes, horizonWeeks });
  }

  addException(exception: DateException): Observable<ApplyResult> {
    const config = { ...this._config(), exceptions: [...this._config().exceptions, exception] };
    return this.persistAndApply(config, exception.type === 'off' ? { exception, mode: 'off' } : undefined);
  }

  removeException(id: string): Observable<ApplyResult> {
    const removed = this._config().exceptions.find((e) => e.id === id);
    const config = { ...this._config(), exceptions: this._config().exceptions.filter((e) => e.id !== id) };
    return this.persistAndApply(config, removed?.type === 'extra' ? { exception: removed, mode: 'extra' } : undefined);
  }

  /** Slots a day-off range would affect, used to warn before applying it. */
  slotsInRange(from: string, to: string): Schedule[] {
    return this._slots().filter((s) => s.date >= from && s.date <= to);
  }

  private persistAndApply(config: AvailabilityConfig, clear?: SlotClear): Observable<ApplyResult> {
    return this.withDoctor((doctorId) =>
      this.repository.save(doctorId, config).pipe(
        tap(() => this._config.set(config)),
        switchMap(() => this.fetchUpcoming(doctorId)),
        switchMap((existing) => (clear ? this.clearSlots(this.slotsToClear(clear, config, existing)) : of({ ...EMPTY_RESULT, removedIds: new Set<number>() })).pipe(
          switchMap(({ removedIds, ...cleared }) => {
            const remaining = existing.filter((s) => !removedIds.has(s.id));
            return this.schedules.createBatch(buildMissingSlots(config, remaining, new Date())).pipe(map((created) => ({ ...cleared, created })));
          })
        )),
        switchMap((result) => this.fetchUpcoming(doctorId).pipe(tap((slots) => this._slots.set(slots)), map(() => result)))
      )
    );
  }

  // slots a day off or a removed extra day should take away; the weekly rules keep the slots they still cover
  private slotsToClear({ exception, mode }: SlotClear, config: AvailabilityConfig, existing: Schedule[]): Schedule[] {
    if (mode === 'off') return existing.filter((s) => s.date >= exception.from && s.date <= exception.to);

    const weekdayRules = config.rules.filter((r) => r.weekday === weekdayOf(exception.from));
    const coveredByRule = (s: Schedule) =>
      !isDayOff(s.date, config.exceptions) && weekdayRules.some((r) => s.start >= r.start && s.end <= r.end);

    return existing.filter((s) => s.date === exception.from && s.start >= exception.start! && s.end <= exception.end! && !coveredByRule(s));
  }

  private clearSlots(inRange: Schedule[]): Observable<ApplyResult & { removedIds: Set<number> }> {
    const booked = inRange.filter((s) => s.status === 'BOOKED').length;
    const available = inRange.filter((s) => s.status === 'AVAILABLE');

    return from(available).pipe(
      mergeMap(
        (slot) =>
          this.schedules.remove(slot.id).pipe(
            map(() => ({ id: slot.id, ok: true })),
            catchError(() => of({ id: slot.id, ok: false }))
          ),
        DELETE_CONCURRENCY
      ),
      toArray(),
      map((outcomes) => {
        const removedIds = new Set(outcomes.filter((o) => o.ok).map((o) => o.id));
        return { created: 0, removed: removedIds.size, booked, failed: outcomes.length - removedIds.size, removedIds };
      })
    );
  }

  private fetchUpcoming(doctorId: number): Observable<Schedule[]> {
    const now = new Date();
    return this.schedules
      .listByDoctor(doctorId, `${toIso(now)}T00:00:00`)
      .pipe(map((slots) => slots.filter((s) => s.date > toIso(now) || s.end > nowTime(now))));
  }

  private withDoctor<T>(run: (doctorId: number) => Observable<T>): Observable<T> {
    const doctorId = this.auth.getUserId();
    return doctorId === null ? throwError(() => new Error('No doctor session')) : run(doctorId);
  }
}

function nowTime(now: Date): string {
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}
