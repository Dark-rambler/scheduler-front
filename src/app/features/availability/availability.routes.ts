import { Routes } from '@angular/router';

export const AVAILABILITY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./availability.component').then((m) => m.AvailabilityComponent),
    children: [
      { path: '', loadComponent: () => import('./weekly/weekly-schedule.component').then((m) => m.WeeklyScheduleComponent) },
      { path: 'days-off', loadComponent: () => import('./days-off/days-off.component').then((m) => m.DaysOffComponent) },
      { path: 'extra-days', loadComponent: () => import('./extra-days/extra-days.component').then((m) => m.ExtraDaysComponent) }
    ]
  }
];
