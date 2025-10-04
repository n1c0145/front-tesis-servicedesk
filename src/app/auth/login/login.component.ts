import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { ApiService } from '../../services/api.service';
import { HttpClientModule } from '@angular/common/http';
import { LoadingComponent } from '../../layout/loading/loading.component';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent, AlertDialogData } from '../../layout/alert-dialog/alert-dialog.component';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    HttpClientModule,
    LoadingComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  constructor(private fb: FormBuilder, private router: Router, private apiService: ApiService, private dialog: MatDialog) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)]],
      password: ['', Validators.required]
    });
  }

  get email() {
    return this.loginForm.get('email')!;
  }

  get password() {
    return this.loginForm.get('password')!;
  }

  navigateTo(path: string) {
    this.router.navigate([path]);

  }

  save(): void {
    this.isLoading = true;
    const body = {
      correo: this.email.value,
      password: this.password.value
    };

    this.apiService.post('login', body).subscribe({
      next: (res: any) => {

        const expiresAt = new Date().getTime() + 59 * 60 * 1000;
        localStorage.setItem('accessToken', res.tokens.AuthenticationResult.AccessToken);
        localStorage.setItem('id', res.user.id.toString());
        localStorage.setItem('roleId', res.user.role_id.toString());
        localStorage.setItem('tokenExpiresAt', expiresAt.toString());

        this.router.navigate(['/home']);
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.dialog.open(AlertDialogComponent, {
          data: {
            icon: 'error',
            message: 'Usuario o contraseña incorrectos',
            showCancel: false,
            acceptText: 'Aceptar'
          }
        });

      }
    });
  }
}