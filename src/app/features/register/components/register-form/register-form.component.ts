import { Component, inject } from '@angular/core';
import { InputComponentComponent } from '../../../../shared/components/input-component/input-component.component';
import { SelectComponentComponent } from '../../../../shared/components/select-component/select-component.component';
import { ButtonComponentComponent } from '../../../../shared/components/button-component/button-component.component';
import { InputType } from '../../../../shared/components/input-component/enums/input-type.enum';
import { ClickRegisterDirective } from "./directives/click-register.directive";
import { ɵInternalFormsSharedModule, ReactiveFormsModule, FormBuilder } from "@angular/forms";
import { REGISTER_FORM } from './constants/register-form.constants';

@Component({
  selector: 'app-register-form',
  imports: [InputComponentComponent, ButtonComponentComponent, ClickRegisterDirective, ɵInternalFormsSharedModule, ReactiveFormsModule],
  templateUrl: './register-form.component.html',
})
export class RegisterFormComponent {
  protected inputType = InputType;
  private readonly _formBuilder = inject(FormBuilder)
  protected formGroup = this._formBuilder.group(REGISTER_FORM)
  protected rolesData = [
    { label: 'Doctor', value: 1 },
    { label: 'Nurse', value: 2 },
    { label: 'Patient', value: 3 },
  ];
  protected specialityData = [
    { label: 'Cardiology', value: 1 },
    { label: 'Dermatology', value: 2 },
    { label: 'Neurology', value: 3 },
    { label: 'Pediatrics', value: 4 },
    { label: 'Psychiatry', value: 5 },
    { label: 'Radiology', value: 6 },
    { label: 'Surgery', value: 7 },
  ];
}
