import { Component, computed, inject, signal } from '@angular/core';
import { ToggleComponent } from '../../../shared/ui/toggle/toggle.component';
import { TimeFieldComponent } from '../../../shared/ui/time-field/time-field.component';
import { NotificationService } from '../../../shared/services/notification.service';
import { AvailabilityService } from '../../../core/services/availability.service';
import { WeeklyRule } from '../../../core/models/schedule.model';
import { toMinutes } from '../../../core/utils/availability.util';
import { addDays, formatDayLabel, formatTime, toIso } from '../../../core/utils/calendar.util';
import { AvailabilityActions } from '../availability-actions.service';

interface DayRow {
  weekday: number;
  label: string;
  enabled: boolean;
  start: string;
  end: string;
}

const WEEKDAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const UPCOMING_DAYS = 14;

@Component({
  selector: 'app-weekly-schedule',
  imports: [ToggleComponent, TimeFieldComponent],
  templateUrl: './weekly-schedule.component.html',
  host: { class: 'flex min-h-0 flex-1 gap-5' }
})
export class WeeklyScheduleComponent {
  private readonly availability = inject(AvailabilityService);
  private readonly actions = inject(AvailabilityActions);
  private readonly notifications = inject(NotificationService);

  protected readonly inputClass =
    'w-full rounded-2xl border border-gray-900/10 bg-gray-900/[0.04] px-3 py-2 text-sm text-gray-700 shadow-[inset_0_1px_3px_rgba(0,0,0,0.08)] transition-colors focus:border-primary/40 focus:bg-white focus:shadow-none focus:outline-none focus:ring-2 focus:ring-primary/30';

  protected readonly slotOptions = [15, 20, 30, 45, 60];
  protected readonly horizonOptions = [2, 4, 8, 12];
  protected readonly saving = this.actions.saving;

  private readonly initial = this.availability.config();
  protected readonly days = signal<DayRow[]>(this.rowsFromRules(this.initial.rules));
  protected readonly slotMinutes = signal(this.initial.slotMinutes);
  protected readonly horizonWeeks = signal(this.initial.horizonWeeks);

  private readonly upcomingSlots = computed(() => {
    const limit = toIso(addDays(new Date(), UPCOMING_DAYS - 1));
    return this.availability.slots().filter((s) => s.date <= limit);
  });

  protected readonly upcoming = computed(() => {
    const byDate = new Map<string, { time: string; booked: boolean }[]>();

    for (const slot of this.upcomingSlots()) {
      const list = byDate.get(slot.date) ?? [];
      list.push({ time: formatTime(slot.start), booked: slot.status === 'BOOKED' });
      byDate.set(slot.date, list);
    }

    return [...byDate.entries()].map(([date, slots]) => ({ date, label: formatDayLabel(date), slots }));
  });

  protected readonly totals = computed(() => {
    const slots = this.upcomingSlots();
    const booked = slots.filter((s) => s.status === 'BOOKED').length;
    return { available: slots.length - booked, booked };
  });

  protected valueOf(event: Event): string {
    return (event.target as HTMLSelectElement).value;
  }

  protected patchDay(weekday: number, patch: Partial<DayRow>): void {
    this.days.update((rows) => rows.map((r) => (r.weekday === weekday ? { ...r, ...patch } : r)));
  }

  protected preset(weekdays: number[]): void {
    this.days.update((rows) => rows.map((r) => ({ ...r, enabled: weekdays.includes(r.weekday) })));
  }

  protected save(): void {
    const rows = this.days().filter((r) => r.enabled);
    if (rows.some((r) => toMinutes(r.start) + this.slotMinutes() > toMinutes(r.end))) {
      this.notifications.error('Each working day needs an end time at least one slot after its start.');
      return;
    }

    const rules: WeeklyRule[] = rows.map((r) => ({ weekday: r.weekday, start: r.start, end: r.end }));
    this.actions.run(this.availability.saveWeekly(rules, this.slotMinutes(), this.horizonWeeks()), 'Weekly schedule saved.');
  }

  private rowsFromRules(rules: WeeklyRule[]): DayRow[] {
    return WEEKDAY_LABELS.map((label, weekday) => {
      const rule = rules.find((r) => r.weekday === weekday);
      return { weekday, label, enabled: !!rule, start: rule?.start ?? '09:00', end: rule?.end ?? '17:00' };
    });
  }
}
