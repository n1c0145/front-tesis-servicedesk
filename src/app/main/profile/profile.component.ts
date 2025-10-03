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

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  profileForm!: FormGroup;
  roleName: string = '';
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
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
    const token = localStorage.getItem('accessToken');

    if (!id || !token) {
      console.error('ID o token no encontrados en localStorage');
      return;
    }

    this.apiService.get<any>(`get-profile/${id}`, token).subscribe({
      next: (res) => {
        console.log('Perfil cargado:', res);
        this.roleName = res.role?.nombre || '';

        this.profileForm.patchValue({
          correo: res.correo,
          cedula: res.cedula,
          nombre: res.nombre,
          apellido: res.apellido,
          puesto: res.puesto,
        });
      },
      error: (err) => {
        alert("Ha ocurrido un error, por favor intentalo mas tarde");
      }
    });
  }

  save(): void {
    const id = localStorage.getItem('id');
    const token = localStorage.getItem('accessToken') || undefined;

    const body = {
      nombre: this.profileForm.get('nombre')?.value,
      apellido: this.profileForm.get('apellido')?.value,
      puesto: this.profileForm.get('puesto')?.value,
    };

    this.apiService.patch<any>(`update-profile/${id}`, body, token).subscribe({
      next: () => {
        alert('Perfil actualizado con éxito');
        window.location.reload(); 
      },
      error: () => {
        alert('Ha ocurrido un error, por favor intentalo más tarde');
      }
    });
  }


  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}