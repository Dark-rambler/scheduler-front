import { Component, input } from '@angular/core';
import { BadgeComponent } from '../badge/badge.component';
import { Appointment } from '../../../core/models/appointment.model';
import { PRIORITY_LABEL, PRIORITY_TONE, PRIORITY_VARIANT } from '../../../core/models/priority.util';

@Component({
  selector: 'app-board-card',
  imports: [BadgeComponent],
  templateUrl: './board-card.component.html',
  host: { class: 'block' }
})
export class BoardCardComponent {
  appointment = input.required<Appointment>();

  protected readonly priorityLabel = PRIORITY_LABEL;
  protected readonly priorityTone = PRIORITY_TONE;
  protected readonly priorityVariant = PRIORITY_VARIANT;
}
