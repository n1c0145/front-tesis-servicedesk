import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { ApiService } from '../../services/api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoadingComponent } from '../../layout/loading/loading.component';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from '../../layout/alert-dialog/alert-dialog.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatStepperModule, LoadingComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  emailForm: FormGroup;
  resetForm: FormGroup;
  isLoading = false;
  constructor(private fb: FormBuilder, private apiService: ApiService, private router: Router, private dialog: MatDialog) {
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

  save(stepper: any): void {
    this.isLoading = true;
    const body = { correo: this.emailForm.get('email')?.value };

    this.apiService.post<any>('forgot-password-code', body).subscribe({
      next: (res) => {

        localStorage.setItem('forgotPasswordId', res.user.id.toString());
        this.isLoading = false;
        this.dialog.open(AlertDialogComponent, {
          data: {
            icon: 'success',
            message: res.message || 'Código enviado al correo.',
            showCancel: false,
            acceptText: 'Aceptar'
          }
        });
        stepper.next();
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        if (err.status === 422) {
          this.dialog.open(AlertDialogComponent, {
            data: {
              icon: 'error',
              message: 'El usuario no se encuentra registrado',
              showCancel: false,
              acceptText: 'Aceptar'
            }
          });
        } else {
          this.dialog.open(AlertDialogComponent, {
            data: {
              icon: 'error',
              message: 'Ha ocurrido un error, por favor inténtalo más tarde',
              showCancel: false,
              acceptText: 'Aceptar'
            }
          });
        }
      }
    });
  }
  save2(): void {
    this.isLoading = true;
    const userId = localStorage.getItem('forgotPasswordId');
    if (!userId) {
      alert('Ha ocurrido un problema, por favor inténtalo nuevamente.');
      return;
    }
    const body = {
      user_id: Number(userId),
      code: this.resetForm.get('codigo')?.value,
      new_password: this.resetForm.get('password')?.value
    };

    this.apiService.post<any>('reset-password', body).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.dialog.open(AlertDialogComponent, {
          data: {
            icon: 'success',
            message: 'Contraseña actualizada correctamente. Por favor inicia sesión.',
            showCancel: false,
            acceptText: 'Aceptar'
          }
        });
        localStorage.removeItem('forgotPasswordId');
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        this.isLoading = false;
        if (err.status === 400) {
          this.dialog.open(AlertDialogComponent, {
            data: {
              icon: 'error',
              message: 'Código inválido, ingresa nuevamente.',
              showCancel: false,
              acceptText: 'Aceptar'
            }
          });
        } else {
          this.dialog.open(AlertDialogComponent, {
            data: {
              icon: 'error',
              message: 'Ha ocurrido un problema, por favor inténtalo nuevamente.',
              showCancel: false,
              acceptText: 'Aceptar'
            }
          });
        }
      }
    });
  }
}