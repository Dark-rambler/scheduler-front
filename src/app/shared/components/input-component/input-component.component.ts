import { Component, input } from '@angular/core';
import { InputType } from './enums/input-type.enum';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-input-component',
  imports: [NgClass],
  templateUrl: './input-component.component.html',
  styleUrl: './input-component.component.scss'
})
export class InputComponentComponent {
  label = input.required<string>();
  placeholder =input<string>();
  isRequired = input<boolean>(false);
  type = input<InputType>(InputType.TEXT);

}
