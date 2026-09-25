import { Component, computed, inject, signal } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { switchMap } from 'rxjs';
import { BoardColumnComponent } from '../../shared/ui/board-column/board-column.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { DateRange, DateRangePickerComponent } from '../../shared/ui/date-range-picker/date-range-picker.component';
import { AppointmentsService } from '../../core/services/appointments.service';
import { ALLOWED_TRANSITIONS, AppointmentStatus, BoardAppointment, BoardColumn } from '../../core/models/board.model';
import { toIso } from '../../core/utils/calendar.util';
import { NotificationService } from '../../shared/services/notification.service';
import { BoardDevAuthService } from './board-dev-auth.service';
import { ConfirmDialogComponent } from '../../shared/ui/confirm-dialog/confirm-dialog.component';
import { AppointmentDetailAction, AppointmentDetailDialogComponent } from '../../shared/ui/appointment-detail-dialog/appointment-detail-dialog.component';

/** The board only ever has these 3 columns — they mirror the backend AppointmentStatus enum. */
const COLUMN_DEFS: { id: AppointmentStatus; title: string; accentClass: string }[] = [
  { id: 'PENDING', title: 'Pending', accentClass: 'bg-tertiary' },
  { id: 'CONFIRMED', title: 'Confirmed', accentClass: 'bg-primary' },
  { id: 'CANCELLED', title: 'Cancelled', accentClass: 'bg-gray-400' }
];

type LoadState = 'loading' | 'ready' | 'error';

@Component({
  selector: 'app-board',
  imports: [CdkDropListGroup, BoardColumnComponent, PageHeaderComponent, DateRangePickerComponent],
  templateUrl: './board.component.html',
  host: { class: 'flex min-h-0 flex-1 flex-col' }
})
export class BoardComponent {
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly devAuth = inject(BoardDevAuthService);
  private readonly notifications = inject(NotificationService);
  private readonly dialog = inject(Dialog);

  protected readonly dateFrom = signal(toIso(new Date()));
  protected readonly dateTo = signal(toIso(new Date()));
  protected readonly loadState = signal<LoadState>('loading');
  private readonly appointments = signal<BoardAppointment[]>([]);

  protected readonly columns = computed<BoardColumn[]>(() => {
    const from = this.dateFrom();
    const to = this.dateTo();
    const inRange = this.appointments().filter((a) => a.appointmentDate >= from && a.appointmentDate <= to);

    return COLUMN_DEFS.map((def) => ({
      ...def,
      appointments: inRange.filter((a) => a.status === def.id)
    }));
  });

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loadState.set('loading');
    this.devAuth
      .ensureSession()
      .pipe(switchMap(() => this.appointmentsService.getAll()))
      .subscribe({
        next: (appointments) => {
          this.appointments.set(appointments);
          this.loadState.set('ready');
        },
        error: () => this.loadState.set('error')
      });
  }

  protected setDateRange(range: DateRange): void {
    this.dateFrom.set(range.from);
    this.dateTo.set(range.to);
  }

  protected canEnter = (drag: CdkDrag<BoardAppointment>, drop: CdkDropList<BoardAppointment[]>): boolean => {
    const targetStatus = drop.id as AppointmentStatus;
    return ALLOWED_TRANSITIONS[drag.data.status].includes(targetStatus);
  };

  protected drop(event: CdkDragDrop<BoardAppointment[]>): void {
    if (event.previousContainer === event.container) return;

    const appointment = event.item.data as BoardAppointment;
    const targetStatus = event.container.id as AppointmentStatus;
    this.changeStatus(appointment, targetStatus);
  }

  protected openDetail(appointment: BoardAppointment): void {
    this.dialog
      .open<AppointmentDetailAction | undefined>(AppointmentDetailDialogComponent, {
        data: appointment,
        backdropClass: 'glass-backdrop'
      })
      .closed.subscribe((action) => {
        if (!action) return;
        this.changeStatus(appointment, action === 'confirm' ? 'CONFIRMED' : 'CANCELLED');
      });
  }

  private changeStatus(appointment: BoardAppointment, target: AppointmentStatus): void {
    if (target === 'CANCELLED') {
      this.dialog
        .open<boolean>(ConfirmDialogComponent, {
          data: {
            title: 'Cancel appointment',
            message: `Cancel ${appointment.clientName}'s appointment? This releases the time slot and can't be undone.`,
            confirmLabel: 'Cancel appointment'
          },
          backdropClass: 'glass-backdrop'
        })
        .closed.subscribe((confirmed) => {
          if (confirmed) this.persistStatus(appointment, target);
        });
      return;
    }

    this.persistStatus(appointment, target);
  }

  private persistStatus(appointment: BoardAppointment, target: AppointmentStatus): void {
    const previousStatus = appointment.status;
    this.appointments.update((list) => list.map((a) => (a.id === appointment.id ? { ...a, status: target } : a)));

    const request$ = target === 'CONFIRMED' ? this.appointmentsService.confirm(appointment.id) : this.appointmentsService.cancel(appointment.id);

    request$.subscribe({
      next: (updated) => {
        this.appointments.update((list) => list.map((a) => (a.id === updated.id ? updated : a)));
        this.notifications.success(target === 'CONFIRMED' ? 'Appointment confirmed.' : 'Appointment cancelled.');
      },
      error: (err) => {
        this.appointments.update((list) => list.map((a) => (a.id === appointment.id ? { ...a, status: previousStatus } : a)));
        this.notifications.error(err?.error?.message ?? 'No se pudo actualizar la cita.');
      }
    });
  }
}
