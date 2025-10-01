import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [  CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatStepperModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  emailForm: FormGroup;
  resetForm: FormGroup;

  constructor(private fb: FormBuilder) {
    // Paso 1: correo
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)]]
    });

    // Paso 2: código + nueva contraseña
    this.resetForm = this.fb.group({
      codigo: ['', Validators.required],
      password: ['', [Validators.required, this.passwordValidator]],
      repetirPassword: ['', Validators.required]
    }, { validators: this.passwordMatch });
  }

  // Validación individual de contraseña
  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value || '';
    const errors: any = {};
    if (!value) return { required: true };
    if (value.length < 8) errors.minlength = true;
    if (!/[A-Z]/.test(value)) errors.uppercase = true;
    if (!/\d/.test(value)) errors.number = true;
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) errors.special = true;
    return Object.keys(errors).length ? errors : null;
  }

  // Validación para que repetirPassword
  passwordMatch(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const repetir = group.get('repetirPassword')?.value;
    if (password && repetir && password !== repetir) {
      group.get('repetirPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    } else {
      const repetirControl = group.get('repetirPassword');
      if (repetirControl?.hasError('mismatch')) {
        repetirControl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
      }
      return null;
    }
  }
}