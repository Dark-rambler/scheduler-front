import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { EMPTY, Observable, expand, map, reduce } from 'rxjs';
import { AppointmentResponse, AppointmentStatus, BoardAppointment, Page } from '../models/board.model';
import { formatTime } from '../utils/calendar.util';

const PAGE_SIZE = 100;

/** AppointmentMapper serializes status via AppointmentStatus.getDisplayName() — Spanish labels, not the enum name. */
const STATUS_BY_LABEL: Record<string, AppointmentStatus> = {
  Pendiente: 'PENDING',
  Confirmado: 'CONFIRMED',
  Cancelado: 'CANCELLED'
};

function toBoardAppointment(r: AppointmentResponse): BoardAppointment {
  return {
    id: r.id,
    status: STATUS_BY_LABEL[r.status] ?? (r.status as AppointmentStatus),
    clientName: r.clientName,
    clientEmail: r.clientEmail,
    doctorName: r.doctorName,
    doctorEmail: r.doctorEmail,
    doctorSpecialty: r.doctorSpecialty,
    appointmentDate: r.scheduleStart.slice(0, 10),
    appointmentTime: formatTime(r.scheduleStart.slice(11, 16)),
    endTime: r.scheduleEnd,
    createdAt: r.createdAt
  };
}

@Injectable({ providedIn: 'root' })
export class AppointmentsService {
  private readonly http = inject(HttpClient);

  /** GET /api/appointments, paginated — has no date filter, so every page is fetched and merged. */
  getAll(): Observable<BoardAppointment[]> {
    return this.http.get<Page<AppointmentResponse>>('appointments', { params: { page: 0, size: PAGE_SIZE } }).pipe(
      expand((page) =>
        page.page.number + 1 < page.page.totalPages
          ? this.http.get<Page<AppointmentResponse>>('appointments', { params: { page: page.page.number + 1, size: PAGE_SIZE } })
          : EMPTY
      ),
      reduce<Page<AppointmentResponse>, AppointmentResponse[]>((all, page) => [...all, ...page.content], []),
      map((items) => items.map(toBoardAppointment))
    );
  }

  /** PATCH /api/appointments/{id}/confirm — only valid from PENDING. */
  confirm(id: number): Observable<BoardAppointment> {
    return this.http.patch<AppointmentResponse>(`appointments/${id}/confirm`, {}).pipe(map(toBoardAppointment));
  }

  /** PATCH /api/appointments/{id}/cancel — valid from PENDING or CONFIRMED, releases the schedule slot. */
  cancel(id: number): Observable<BoardAppointment> {
    return this.http.patch<AppointmentResponse>(`appointments/${id}/cancel`, {}).pipe(map(toBoardAppointment));
  }
}
