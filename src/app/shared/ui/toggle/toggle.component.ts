import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-toggle',
  template: `
    <button
      type="button"
      role="switch"
      [attr.aria-checked]="checked()"
      [attr.aria-label]="label()"
      [disabled]="disabled()"
      (click)="checkedChange.emit(!checked())"
      class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-gray-900/5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-40 {{
        checked() ? 'bg-primary shadow-[0_0_0_3px_rgb(0_86_179/0.12)]' : 'bg-gray-900/15 shadow-[inset_0_1px_3px_rgba(0,0,0,0.15)]'
      }}"
    >
      <span
        class="inline-block h-[18px] w-[18px] rounded-full bg-white shadow-md transition-transform duration-200 {{
          checked() ? 'translate-x-[22px]' : 'translate-x-[3px]'
        }}"
      ></span>
    </button>
  `,
  host: { class: 'inline-flex' }
})
export class ToggleComponent {
  checked = input.required<boolean>();
  label = input<string>('');
  disabled = input(false);
  checkedChange = output<boolean>();
}
