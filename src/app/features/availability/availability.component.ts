import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { switchMap } from 'rxjs';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { AvailabilityService } from '../../core/services/availability.service';
import { BoardDevAuthService } from '../board/board-dev-auth.service';

type LoadState = 'loading' | 'ready' | 'error';

@Component({
  selector: 'app-availability',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, PageHeaderComponent],
  templateUrl: './availability.component.html',
  host: { class: 'flex min-h-0 flex-1 flex-col' }
})
export class AvailabilityComponent {
  private readonly availability = inject(AvailabilityService);
  private readonly devAuth = inject(BoardDevAuthService);

  protected readonly tabs = [
    { label: 'Weekly schedule', route: '.', exact: true },
    { label: 'Days off', route: 'days-off', exact: false },
    { label: 'Extra days', route: 'extra-days', exact: false }
  ];

  protected readonly loadState = signal<LoadState>('loading');

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loadState.set('loading');
    this.devAuth
      .ensureSession()
      .pipe(switchMap(() => this.availability.load()))
      .subscribe({
        next: () => this.loadState.set('ready'),
        error: () => this.loadState.set('error')
      });
  }
}
