import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BoardDevAuthService {
  private readonly http = inject(HttpClient);

  ensureSession(): Observable<void> {
    const devLogin = environment.devAutoLogin;
    if (environment.production || !devLogin || localStorage.getItem('token')) return of(void 0);

    return this.http.post<{ token: string }>('auth/login', devLogin).pipe(
      map(({ token }) => localStorage.setItem('token', token))
    );
  }
}
