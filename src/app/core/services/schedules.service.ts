import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { EMPTY, Observable, concatMap, expand, from, map, reduce, toArray } from 'rxjs';
import { Page } from '../models/board.model';
import { Schedule, ScheduleRequest, ScheduleResponse, ScheduleStatus } from '../models/schedule.model';

const PAGE_SIZE = 100;
const BATCH_SIZE = 100;

// backend sends display labels, not enum names
const STATUS_BY_LABEL: Record<string, ScheduleStatus> = {
  Disponible: 'AVAILABLE',
  Reservado: 'BOOKED',
  AVAILABLE: 'AVAILABLE',
  BOOKED: 'BOOKED'
};

function toSchedule(r: ScheduleResponse): Schedule {
  return {
    id: r.id,
    date: r.startTime.slice(0, 10),
    start: r.startTime.slice(11, 16),
    end: r.endTime.slice(11, 16),
    // unknown label: treat as booked so we never try to delete it
    status: STATUS_BY_LABEL[r.status] ?? 'BOOKED'
  };
}

@Injectable({ providedIn: 'root' })
export class SchedulesService {
  private readonly http = inject(HttpClient);

  listByDoctor(doctorId: number, after?: string): Observable<Schedule[]> {
    const fetchPage = (page: number) =>
      this.http.get<Page<ScheduleResponse>>('schedules', {
        params: { doctorId, page, size: PAGE_SIZE, ...(after ? { after } : {}) }
      });

    return fetchPage(0).pipe(
      expand((res) => (res.page.number + 1 < res.page.totalPages ? fetchPage(res.page.number + 1) : EMPTY)),
      reduce<Page<ScheduleResponse>, ScheduleResponse[]>((all, res) => [...all, ...res.content], []),
      map((items) => items.map(toSchedule).sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start)))
    );
  }

  createBatch(slots: ScheduleRequest[]): Observable<number> {
    const chunks: ScheduleRequest[][] = [];
    for (let i = 0; i < slots.length; i += BATCH_SIZE) chunks.push(slots.slice(i, i + BATCH_SIZE));

    return from(chunks).pipe(
      concatMap((chunk) => this.http.post<ScheduleResponse[]>('schedules/batch', chunk)),
      toArray(),
      map((responses) => responses.reduce((total, r) => total + r.length, 0))
    );
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`schedules/${id}`);
  }
}
