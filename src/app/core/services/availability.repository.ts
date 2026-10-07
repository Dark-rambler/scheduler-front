import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AvailabilityConfig, DEFAULT_AVAILABILITY } from '../models/schedule.model';

/**
 * Where the doctor's weekly template + exceptions live. The backend has no model for them yet,
 * so the default implementation is browser-local. Swap the provider in app.config.ts for an
 * HTTP implementation once the backend adds the endpoints; nothing else needs to change.
 */
export abstract class AvailabilityRepository {
  abstract load(doctorId: number): Observable<AvailabilityConfig>;
  abstract save(doctorId: number, config: AvailabilityConfig): Observable<void>;
}

@Injectable()
export class LocalAvailabilityRepository extends AvailabilityRepository {
  private key(doctorId: number): string {
    return `availability:${doctorId}`;
  }

  load(doctorId: number): Observable<AvailabilityConfig> {
    try {
      const raw = localStorage.getItem(this.key(doctorId));
      return of(raw ? { ...DEFAULT_AVAILABILITY, ...JSON.parse(raw) } : DEFAULT_AVAILABILITY);
    } catch {
      return of(DEFAULT_AVAILABILITY);
    }
  }

  save(doctorId: number, config: AvailabilityConfig): Observable<void> {
    localStorage.setItem(this.key(doctorId), JSON.stringify(config));
    return of(void 0);
  }
}
