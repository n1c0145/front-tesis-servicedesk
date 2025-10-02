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
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, private apiService: ApiService) {
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
      },
      error: (err) => {
        alert('Usuario o contraseña incorrectos');

      }
    });
  }
}