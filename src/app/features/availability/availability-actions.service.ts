import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ApplyResult } from '../../core/services/availability.service';
import { NotificationService } from '../../shared/services/notification.service';

@Injectable({ providedIn: 'root' })
export class AvailabilityActions {
  private readonly notifications = inject(NotificationService);

  readonly saving = signal(false);

  run(request$: Observable<ApplyResult>, successMessage: string, onSuccess?: () => void): void {
    this.saving.set(true);
    request$.subscribe({
      next: (result) => {
        this.saving.set(false);
        this.notifications.success(`${successMessage}${this.summarize(result)}`);
        if (result.booked) this.notifications.error(`${result.booked} booked slot(s) were kept. Cancel those appointments first.`);
        if (result.failed) this.notifications.error(`${result.failed} slot(s) could not be removed (they have appointment history).`);
        onSuccess?.();
      },
      error: (err) => {
        this.saving.set(false);
        this.notifications.error(err?.error?.message ?? 'Could not update the schedule.');
      }
    });
  }

  private summarize(result: ApplyResult): string {
    const parts = [];
    if (result.created) parts.push(`${result.created} slots created`);
    if (result.removed) parts.push(`${result.removed} removed`);
    return parts.length ? ` ${parts.join(', ')}.` : '';
  }
}
