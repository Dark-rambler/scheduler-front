import { AvailabilityConfig, DateException, Schedule, ScheduleRequest } from '../models/schedule.model';
import { addDays, parseIso, toIso } from './calendar.util';

export function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function fromMinutes(total: number): string {
  const hours = Math.floor(total / 60).toString().padStart(2, '0');
  const minutes = (total % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function weekdayOf(iso: string): number {
  return (parseIso(iso).getDay() + 6) % 7;
}

export function isDayOff(iso: string, exceptions: DateException[]): boolean {
  return exceptions.some((e) => e.type === 'off' && iso >= e.from && iso <= e.to);
}

// backend takes local date-times without offset
function toLocalDateTime(iso: string, time: string): string {
  return `${iso}T${time}:00`;
}

function windowsFor(iso: string, config: AvailabilityConfig): { start: string; end: string }[] {
  if (isDayOff(iso, config.exceptions)) return [];

  const weekday = weekdayOf(iso);
  const fromRules = config.rules.filter((r) => r.weekday === weekday);
  const fromExtras = config.exceptions.filter((e) => e.type === 'extra' && e.from === iso && e.start && e.end);

  return [
    ...fromRules.map((r) => ({ start: r.start, end: r.end })),
    ...fromExtras.map((e) => ({ start: e.start!, end: e.end! }))
  ];
}

/**
 * Expands the weekly rules + exceptions into the concrete slots missing from the backend.
 * Skips past slots and anything overlapping an existing slot (the backend accepts overlaps, so we must not).
 */
export function buildMissingSlots(config: AvailabilityConfig, existing: Schedule[], now: Date): ScheduleRequest[] {
  const taken = new Map<string, { start: number; end: number }[]>();
  for (const slot of existing) {
    const list = taken.get(slot.date) ?? [];
    list.push({ start: toMinutes(slot.start), end: toMinutes(slot.end) });
    taken.set(slot.date, list);
  }

  const nowIso = toIso(now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const result: ScheduleRequest[] = [];

  for (let offset = 0; offset < config.horizonWeeks * 7; offset++) {
    const iso = toIso(addDays(now, offset));
    const busy = taken.get(iso) ?? [];

    for (const window of windowsFor(iso, config)) {
      const windowEnd = toMinutes(window.end);

      for (let start = toMinutes(window.start); start + config.slotMinutes <= windowEnd; start += config.slotMinutes) {
        const end = start + config.slotMinutes;
        if (iso === nowIso && start <= nowMinutes) continue;
        if (busy.some((b) => start < b.end && b.start < end)) continue;

        busy.push({ start, end });
        result.push({ startTime: toLocalDateTime(iso, fromMinutes(start)), endTime: toLocalDateTime(iso, fromMinutes(end)) });
      }
    }
  }

  return result;
}
