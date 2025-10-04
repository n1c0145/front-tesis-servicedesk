import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { LoadingComponent } from '../../layout/loading/loading.component';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from '../../layout/alert-dialog/alert-dialog.component';

@Component({
  selector: 'app-update-password',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule, LoadingComponent],
  templateUrl: './update-password.component.html',
  styleUrl: './update-password.component.scss'
})
export class UpdatePasswordComponent {
  passwordForm: FormGroup;
  isLoading = false;
  constructor(private fb: FormBuilder, private apiService: ApiService, private router: Router, private dialog: MatDialog) {
    this.passwordForm = this.fb.group({
      old_password: ['', Validators.required],
      new_password: ['', [Validators.required, this.passwordValidator]],
      repeat_new_password: ['', Validators.required]
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

  // Validación de coincidencia de contraseña
  passwordMatch(group: AbstractControl): ValidationErrors | null {
    const newPass = group.get('new_password')?.value;
    const repeat = group.get('repeat_new_password')?.value;
    if (newPass && repeat && newPass !== repeat) {
      group.get('repeat_new_password')?.setErrors({ mismatch: true });
      return { mismatch: true };
    } else {
      const repeatControl = group.get('repeat_new_password');
      if (repeatControl?.hasError('mismatch')) {
        repeatControl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
      }
      return null;
    }
  }

  updatePassword(): void {
    this.isLoading = true;
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const token = localStorage.getItem('accessToken') || undefined;

    const body = {
      old_password: this.passwordForm.get('old_password')?.value,
      new_password: this.passwordForm.get('new_password')?.value
    };

    this.apiService.post<any>('change-password', body, token).subscribe({
      next: () => {
        this.isLoading = false;
        this.dialog.open(AlertDialogComponent, {
          data: {
            icon: 'success',
            message: 'Contraseña actualizada con éxito',
            showCancel: false,
            acceptText: 'Aceptar'
          }
        });
        this.router.navigate(['/profile']);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        if (err.status === 500) {
          this.dialog.open(AlertDialogComponent, {
            data: {
              icon: 'error',
              message: 'La contraseña antigua es incorrecta',
              showCancel: false,
              acceptText: 'Aceptar'
            }
          });
        } else {
          this.dialog.open(AlertDialogComponent, {
            data: {
              icon: 'error',
              message: 'Ha ocurrido un error, por favor intentalo más tarde',
              showCancel: false,
              acceptText: 'Aceptar'
            }
          });
        }
      }
    });
  }
}
