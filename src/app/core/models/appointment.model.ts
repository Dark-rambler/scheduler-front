export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Appointment {
  id: string;
  patientName: string;
  reason: string;
  priority: Priority;
  time?: string;
  doctor?: string;
  waitMinutes?: number;
  date?: string;
  durationMinutes?: number;
}
