export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

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
  appointmentDate: string;
  appointmentTime: string;
  endTime: string;
  createdAt: string;
}

export interface BoardColumn {
  id: AppointmentStatus;
  title: string;
  accentClass: string;
  appointments: BoardAppointment[];
}

export const ALLOWED_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['CANCELLED'],
  CANCELLED: []
};
