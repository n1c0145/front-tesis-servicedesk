import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../services/api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { LoadingComponent } from '../../layout/loading/loading.component';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from '../../layout/alert-dialog/alert-dialog.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    LoadingComponent
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  constructor(private fb: FormBuilder, private router: Router, private apiService: ApiService, private dialog: MatDialog) {
    this.registerForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
        this.hasNonAscii
      ]],
      cedula: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      puesto: ['', Validators.required],
      password: ['', [Validators.required, this.passwordValidator]],
      repetirPassword: ['', Validators.required]
    }, { validators: this.passwordMatch });
  }

  get email() { return this.registerForm.get('email')!; }
  get cedula() { return this.registerForm.get('cedula')!; }
  get nombre() { return this.registerForm.get('nombre')!; }
  get apellido() { return this.registerForm.get('apellido')!; }
  get puesto() { return this.registerForm.get('puesto')!; }
  get password() { return this.registerForm.get('password')!; }
  get repetirPassword() { return this.registerForm.get('repetirPassword')!; }

  onlyNumbers(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '');
  }
 hasNonAscii(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (value && /[^\x20-\x7F]/.test(value)) {
    return { nonAscii: true }; 
  }
  return null; 
}

  // Validación de contraseña
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

  navigateTo(path: string) {
    this.router.navigate([path]);
  }


  save(): void {
    this.isLoading = true;
    const body = {
      correo: this.email.value,
      nombre: this.nombre.value,
      apellido: this.apellido.value,
      cedula: this.cedula.value,
      password: this.password.value,
      puesto: this.puesto.value
    };

    this.apiService.post<any>('register', body).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.dialog.open(AlertDialogComponent, {
          data: {
            icon: 'success',
            message: 'Usuario registrado correctamente. Por favor Inicia Sesión',
            showCancel: false,
            acceptText: 'Aceptar'
          }
        });
        this.router.navigate(['/login']);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        if (err.status === 422) {
          this.dialog.open(AlertDialogComponent, {
            data: {
              icon: 'error',
              message: 'El usuario ya se encuentra registrado',
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
}