import { Component, computed, input, output, signal } from '@angular/core';
import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedPosition } from '@angular/cdk/overlay';
import { CalendarDay, buildMonthMatrix, formatMonthLabel, parseIso, toIso } from '../../../core/utils/calendar.util';

const POSITIONS: ConnectedPosition[] = [
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 6 },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -6 }
];

@Component({
  selector: 'app-date-field',
  imports: [CdkConnectedOverlay, CdkOverlayOrigin],
  templateUrl: './date-field.component.html',
  host: { class: 'block' }
})
export class DateFieldComponent {
  value = input.required<string>();
  min = input<string>();
  label = input('Date');
  valueChange = output<string>();

  protected readonly positions = POSITIONS;
  protected readonly weekdayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  protected readonly today = toIso(new Date());

  protected readonly isOpen = signal(false);
  private readonly viewDate = signal(new Date());

  protected readonly monthLabel = computed(() => formatMonthLabel(this.viewDate()));
  protected readonly weeks = computed(() => buildMonthMatrix(this.viewDate().getFullYear(), this.viewDate().getMonth()));
  protected readonly display = computed(() =>
    this.value() ? parseIso(this.value()).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Pick a date'
  );

  protected toggle(): void {
    if (this.isOpen()) return this.close();
    this.viewDate.set(this.value() ? parseIso(this.value()) : new Date());
    this.isOpen.set(true);
  }

  protected close(): void {
    this.isOpen.set(false);
  }

  protected previousMonth(): void {
    this.viewDate.update((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  protected nextMonth(): void {
    this.viewDate.update((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  protected isDisabled(day: CalendarDay): boolean {
    const min = this.min();
    return !!min && day.iso < min;
  }

  protected pick(day: CalendarDay): void {
    if (this.isDisabled(day)) return;
    this.valueChange.emit(day.iso);
    this.close();
  }
}
