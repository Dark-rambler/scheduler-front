import { Component, computed, inject, signal } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { DateFieldComponent } from '../../../shared/ui/date-field/date-field.component';
import { NotificationService } from '../../../shared/services/notification.service';
import { AvailabilityService } from '../../../core/services/availability.service';
import { DateException } from '../../../core/models/schedule.model';
import { addDays, formatShortDate, toIso } from '../../../core/utils/calendar.util';
import { AvailabilityActions } from '../availability-actions.service';

@Component({
  selector: 'app-days-off',
  imports: [DateFieldComponent],
  templateUrl: './days-off.component.html',
  host: { class: 'flex min-h-0 flex-1 gap-5' }
})
export class DaysOffComponent {
  private readonly availability = inject(AvailabilityService);
  private readonly actions = inject(AvailabilityActions);
  private readonly notifications = inject(NotificationService);
  private readonly dialog = inject(Dialog);

  protected readonly inputClass =
    'w-full rounded-2xl border border-gray-900/10 bg-gray-900/[0.04] px-3 py-2 text-sm text-gray-700 shadow-[inset_0_1px_3px_rgba(0,0,0,0.08)] transition-colors placeholder:text-gray-400 focus:border-primary/40 focus:bg-white focus:shadow-none focus:outline-none focus:ring-2 focus:ring-primary/30';

  protected readonly today = toIso(new Date());
  protected readonly saving = this.actions.saving;

  protected readonly from = signal(toIso(addDays(new Date(), 1)));
  protected readonly to = signal(toIso(addDays(new Date(), 1)));
  protected readonly reason = signal('');

  protected readonly daysOff = computed(() =>
    this.availability
      .config()
      .exceptions.filter((e) => e.type === 'off')
      .sort((a, b) => a.from.localeCompare(b.from))
  );

  // what the range being typed would touch, shown before the doctor commits
  protected readonly impact = computed(() => {
    const affected = this.availability.slots().filter((s) => s.date >= this.from() && s.date <= this.to());
    const booked = affected.filter((s) => s.status === 'BOOKED').length;
    return { available: affected.length - booked, booked };
  });

  protected setFrom(iso: string): void {
    this.from.set(iso);
    if (this.to() < iso) this.to.set(iso);
  }

  protected valueOf(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  protected rangeLabel(e: DateException): string {
    return e.from === e.to ? formatShortDate(e.from) : `${formatShortDate(e.from)} – ${formatShortDate(e.to)}`;
  }

  protected add(): void {
    if (this.from() < this.today) {
      this.notifications.error('Pick a date from today onwards.');
      return;
    }

    const exception: DateException = {
      id: crypto.randomUUID(),
      type: 'off',
      from: this.from(),
      to: this.to(),
      reason: this.reason().trim()
    };
    const { available, booked } = this.impact();
    const commit = () => this.actions.run(this.availability.addException(exception), 'Day off added.', () => this.reason.set(''));

    if (!available && !booked) return commit();

    this.dialog
      .open<boolean>(ConfirmDialogComponent, {
        data: {
          title: 'Add day off',
          message:
            `This removes ${available} available slot(s) in that range.` +
            (booked ? ` ${booked} booked slot(s) stay: cancel those appointments on the Board first.` : ''),
          confirmLabel: 'Add day off'
        },
        backdropClass: 'glass-backdrop'
      })
      .closed.subscribe((confirmed) => {
        if (confirmed) commit();
      });
  }

  protected remove(exception: DateException): void {
    this.actions.run(this.availability.removeException(exception.id), 'Day off removed.');
  }
}
