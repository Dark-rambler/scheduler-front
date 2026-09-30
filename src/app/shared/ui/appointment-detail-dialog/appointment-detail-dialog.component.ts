import { Component, computed, inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { BadgeComponent, BadgeTone } from '../badge/badge.component';
import { ALLOWED_TRANSITIONS, AppointmentStatus, BoardAppointment } from '../../../core/models/board.model';
import { formatDayLabel, formatTime } from '../../../core/utils/calendar.util';

const STATUS_TONE: Record<AppointmentStatus, BadgeTone> = {
  PENDING: 'tertiary',
  CONFIRMED: 'primary',
  CANCELLED: 'neutral'
};

export type AppointmentDetailAction = 'confirm' | 'cancel';

@Component({
  selector: 'app-appointment-detail-dialog',
  imports: [BadgeComponent],
  templateUrl: './appointment-detail-dialog.component.html'
})
export class AppointmentDetailDialogComponent {
  private readonly dialogRef = inject(DialogRef<AppointmentDetailAction | undefined>);
  protected readonly appointment = inject<BoardAppointment>(DIALOG_DATA);

  protected readonly statusTone = computed(() => STATUS_TONE[this.appointment.status]);
  protected readonly dayLabel = computed(() => formatDayLabel(this.appointment.appointmentDate));
  protected readonly endTimeLabel = computed(() => formatTime(this.appointment.endTime.slice(11, 16)));
  protected readonly allowedActions = computed(() => ALLOWED_TRANSITIONS[this.appointment.status]);

  protected close(action?: AppointmentDetailAction): void {
    this.dialogRef.close(action);
  }
}
