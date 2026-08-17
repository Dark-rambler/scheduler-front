import { Component } from '@angular/core';
import { InputType } from '../../shared/input-component/enums/input-type.enum';
import { RegisterFormComponent } from "./components/register-form/register-form.component";
import { BannerComponent } from "./components/banner/banner.component";
import { SelectComponentComponent } from '../../shared/select-component/select-component.component';

@Component({
  selector: 'app-register',
  imports: [ RegisterFormComponent, BannerComponent],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  protected inputType = InputType;
}
