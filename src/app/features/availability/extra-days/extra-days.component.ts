import { Component, computed, inject, signal } from '@angular/core';
import { DateFieldComponent } from '../../../shared/ui/date-field/date-field.component';
import { TimeFieldComponent } from '../../../shared/ui/time-field/time-field.component';
import { NotificationService } from '../../../shared/services/notification.service';
import { AvailabilityService } from '../../../core/services/availability.service';
import { DateException } from '../../../core/models/schedule.model';
import { toMinutes } from '../../../core/utils/availability.util';
import { addDays, formatDayLabel, formatTime, toIso } from '../../../core/utils/calendar.util';
import { AvailabilityActions } from '../availability-actions.service';

@Component({
  selector: 'app-extra-days',
  imports: [DateFieldComponent, TimeFieldComponent],
  templateUrl: './extra-days.component.html',
  host: { class: 'flex min-h-0 flex-1 gap-5' }
})
export class ExtraDaysComponent {
  private readonly availability = inject(AvailabilityService);
  private readonly actions = inject(AvailabilityActions);
  private readonly notifications = inject(NotificationService);

  protected readonly inputClass =
    'w-full rounded-2xl border border-gray-900/10 bg-gray-900/[0.04] px-3 py-2 text-sm text-gray-700 shadow-[inset_0_1px_3px_rgba(0,0,0,0.08)] transition-colors placeholder:text-gray-400 focus:border-primary/40 focus:bg-white focus:shadow-none focus:outline-none focus:ring-2 focus:ring-primary/30';

  protected readonly today = toIso(new Date());
  protected readonly saving = this.actions.saving;

  protected readonly date = signal(toIso(addDays(new Date(), 1)));
  protected readonly start = signal('09:00');
  protected readonly end = signal('13:00');
  protected readonly reason = signal('');

  protected readonly extraDays = computed(() =>
    this.availability
      .config()
      .exceptions.filter((e) => e.type === 'extra')
      .sort((a, b) => a.from.localeCompare(b.from))
  );

  protected valueOf(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  protected dayLabel(e: DateException): string {
    return formatDayLabel(e.from);
  }

  protected timeLabel(e: DateException): string {
    return `${formatTime(e.start!)} – ${formatTime(e.end!)}`;
  }

  protected add(): void {
    if (this.date() < this.today) {
      this.notifications.error('Pick a date from today onwards.');
      return;
    }
    if (toMinutes(this.start()) >= toMinutes(this.end())) {
      this.notifications.error('The end time must be after the start time.');
      return;
    }

    const exception: DateException = {
      id: crypto.randomUUID(),
      type: 'extra',
      from: this.date(),
      to: this.date(),
      start: this.start(),
      end: this.end(),
      reason: this.reason().trim()
    };
    this.actions.run(this.availability.addException(exception), 'Extra day added.', () => this.reason.set(''));
  }

  protected remove(exception: DateException): void {
    this.actions.run(this.availability.removeException(exception.id), 'Extra day removed.');
  }
}
