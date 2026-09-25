/** Matches the backend AppointmentStatus enum. */
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

/** Shape returned by GET /api/appointments and PATCH /api/appointments/{id}/confirm|cancel. */
export interface AppointmentResponse {
  id: number;
  status: string;
  clientId: number;
  clientName: string;
  clientEmail: string;
  doctorId: number;
  doctorName: string;
  doctorEmail: string;
  doctorSpecialty: string;
  scheduleId: number;
  /** LocalDateTime without zone, e.g. "2026-09-26T09:00:00". */
  scheduleStart: string;
  scheduleEnd: string;
  createdAt: string;
}

export interface Page<T> {
  content: T[];
  page: { size: number; number: number; totalElements: number; totalPages: number };
}

export interface BoardAppointment {
  id: number;
  status: AppointmentStatus;
  clientName: string;
  clientEmail: string;
  doctorName: string;
  doctorEmail: string;
  doctorSpecialty: string;
  /** ISO yyyy-mm-dd */
  appointmentDate: string;
  /** Display time, e.g. "9:00 AM". */
  appointmentTime: string;
  endTime: string;
  createdAt: string;
}

/** One Kanban column. The board only ever has the 3 backend statuses. */
export interface BoardColumn {
  id: AppointmentStatus;
  title: string;
  accentClass: string;
  appointments: BoardAppointment[];
}

/** Mirrors AppointmentServiceImpl: confirm only from PENDING, cancel from PENDING/CONFIRMED, nothing back to PENDING. */
export const ALLOWED_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['CANCELLED'],
  CANCELLED: []
};
