import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { LoadingComponent } from '../../layout/loading/loading.component';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from '../../layout/alert-dialog/alert-dialog.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule, LoadingComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  isLoading = false;
  profileForm!: FormGroup;
  roleName: string = '';
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apiService: ApiService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.profileForm = this.fb.group({
      correo: [{ value: '', disabled: true }],
      cedula: [{ value: '', disabled: true }],
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      puesto: ['', Validators.required],
    });

    this.loadProfile();
  }

  loadProfile(): void {
    const id = localStorage.getItem('id');
    const token = localStorage.getItem('accessToken') || undefined;


    this.apiService.get<any>(`get-profile/${id}`, token).subscribe({
      next: (res) => {
        this.roleName = res.role?.nombre || '';

        this.profileForm.patchValue({
          correo: res.correo,
          cedula: res.cedula,
          nombre: res.nombre,
          apellido: res.apellido,
          puesto: res.puesto,
        });
        this.isLoading = false;
      },
      error: (err) => {
        this.dialog.open(AlertDialogComponent, {
          data: {
            icon: 'error',
            message: 'Ha ocurrido un error, por favor inténtalo más tarde',
            showCancel: false,
            acceptText: 'Aceptar'
          }
        });
      }
    });
  }

  save(): void {
    this.isLoading = true;
    const id = localStorage.getItem('id');
    const token = localStorage.getItem('accessToken') || undefined;

    const body = {
      nombre: this.profileForm.get('nombre')?.value,
      apellido: this.profileForm.get('apellido')?.value,
      puesto: this.profileForm.get('puesto')?.value,
    };

    this.apiService.patch<any>(`update-profile/${id}`, body, token).subscribe({
      next: () => {
        this.isLoading = false;
         this.dialog.open(AlertDialogComponent, {
          data: {
            icon: 'success',
            message: 'Perfil actualizado con éxito',
            showCancel: false,
            acceptText: 'Aceptar'
          }
        });
      },
      error: () => {
        this.isLoading = false;
        this.dialog.open(AlertDialogComponent, {
          data: {
            icon: 'error',
            message: 'Ha ocurrido un error, por favor inténtalo más tarde',
            showCancel: false,
            acceptText: 'Aceptar'
          }
        });
      }
    });
  }


  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}