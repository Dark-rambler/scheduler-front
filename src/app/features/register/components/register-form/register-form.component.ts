import { Component } from '@angular/core';
import { InputComponentComponent } from "../../../../shared/input-component/input-component.component";
import { InputType } from '../../../../shared/input-component/enums/input-type.enum';
import { SelectComponentComponent } from "../../../../shared/select-component/select-component.component";
import { ButtonComponentComponent } from "../../../../shared/button-component/button-component.component";

@Component({
  selector: 'app-register-form',
  imports: [InputComponentComponent, SelectComponentComponent, ButtonComponentComponent],
  templateUrl: './register-form.component.html',
})
export class RegisterFormComponent {
  protected inputType = InputType;
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
