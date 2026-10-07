import { Component, computed, input, output, signal } from '@angular/core';
import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedPosition } from '@angular/cdk/overlay';
import { formatTime } from '../../../core/utils/calendar.util';

const POSITIONS: ConnectedPosition[] = [
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 6 },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -6 }
];

const STEP_MINUTES = 15;
const OPTIONS = Array.from({ length: (24 * 60) / STEP_MINUTES }, (_, i) => {
  const total = i * STEP_MINUTES;
  const value = `${Math.floor(total / 60).toString().padStart(2, '0')}:${(total % 60).toString().padStart(2, '0')}`;
  return { value, label: formatTime(value) };
});

@Component({
  selector: 'app-time-field',
  imports: [CdkConnectedOverlay, CdkOverlayOrigin],
  templateUrl: './time-field.component.html',
  host: { class: 'block' }
})
export class TimeFieldComponent {
  value = input.required<string>();
  label = input('Time');
  disabled = input(false);
  valueChange = output<string>();

  protected readonly positions = POSITIONS;
  protected readonly options = OPTIONS;
  protected readonly isOpen = signal(false);
  protected readonly display = computed(() => (this.value() ? formatTime(this.value()) : '--:--'));

  protected toggle(): void {
    this.isOpen.update((open) => !open);
  }

  protected close(): void {
    this.isOpen.set(false);
  }

  protected pick(value: string): void {
    this.valueChange.emit(value);
    this.close();
  }

  // bring the selected option into view once the overlay content is rendered
  protected revealSelected(): void {
    setTimeout(() => document.querySelector('.cdk-overlay-container [data-selected]')?.scrollIntoView({ block: 'center' }));
  }
}
