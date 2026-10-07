export type ScheduleStatus = 'AVAILABLE' | 'BOOKED';

export interface ScheduleResponse {
  id: number;
  doctorId: number;
  doctorName: string;
  doctorSpecialty: string;
  doctorEmail: string;
  startTime: string;
  endTime: string;
  status: string;
}

export interface ScheduleRequest {
  startTime: string;
  endTime: string;
}

export interface Schedule {
  id: number;
  date: string;
  start: string;
  end: string;
  status: ScheduleStatus;
}

// weekday: 0 = Monday ... 6 = Sunday
export interface WeeklyRule {
  weekday: number;
  start: string;
  end: string;
}

export type DateExceptionType = 'off' | 'extra';

// 'off': no slots from `from` to `to` (inclusive). 'extra': one-day window `start`-`end` on `from`.
export interface DateException {
  id: string;
  type: DateExceptionType;
  from: string;
  to: string;
  start?: string;
  end?: string;
  reason: string;
}

export interface AvailabilityConfig {
  rules: WeeklyRule[];
  slotMinutes: number;
  horizonWeeks: number;
  exceptions: DateException[];
}

export const DEFAULT_AVAILABILITY: AvailabilityConfig = {
  rules: [],
  slotMinutes: 30,
  horizonWeeks: 4,
  exceptions: []
};
