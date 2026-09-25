import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';

/**
 * TEMPORARY: real login now requires picking a clinic (clinicId in the login body),
 * which another dev is wiring into the login screen separately. Until that ships,
 * this logs the board in as a seeded backend user so /board can be exercised against
 * real data. Delete once real login + clinic picker lands — see the
 * board-backend-integration-blockers memory for the full backend context.
 */
const DEV_LOGIN = { email: 'ana.garcia@clinic.com', password: 'password123', clinicId: 1 };

@Injectable({ providedIn: 'root' })
export class BoardDevAuthService {
  private readonly http = inject(HttpClient);

  ensureSession(): Observable<void> {
    if (localStorage.getItem('token')) return of(void 0);

    return this.http.post<{ token: string }>('auth/login', DEV_LOGIN).pipe(
      switchMap(({ token }) => {
        localStorage.setItem('token', token);
        return of(void 0);
      })
    );
  }
}
