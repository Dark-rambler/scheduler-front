import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './shell.component.html'
})
export class ShellComponent {
  protected navItems: NavItem[] = [
    { label: 'Board', route: '/board', icon: 'board' },
    { label: 'Calendar', route: '/calendar', icon: 'calendar' },
    { label: 'Patients', route: '/patients', icon: 'patients' },
    { label: 'Analytics', route: '/analytics', icon: 'analytics' }
  ];
}
