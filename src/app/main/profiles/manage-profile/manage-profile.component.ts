import { Component } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { LoadingComponent } from '../../../layout/loading/loading.component';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from '../../../layout/alert-dialog/alert-dialog.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-manage-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    LoadingComponent
  ],
  templateUrl: './manage-profile.component.html',
  styleUrl: './manage-profile.component.scss'
})
export class ManageProfileComponent {
  isLoading = false;
  profileForm!: FormGroup;
  user: any;
  roles = [
    { id: 1, nombre: 'Admin' },
    { id: 2, nombre: 'Project Manager' },
    { id: 3, nombre: 'Usuario' },
    { id: 4, nombre: 'Cliente' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apiService: ApiService,
    private dialog: MatDialog,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      correo: [{ value: '', disabled: true }],
      cedula: [{ value: '', disabled: true }],
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      puesto: ['', Validators.required],
      role_id: ['', Validators.required],
    });

    this.loadUser();
  }

  loadUser(): void {
    this.isLoading = true;
    const id = this.route.snapshot.paramMap.get('id');
    const token = localStorage.getItem('accessToken') || undefined;

    this.apiService.get<any>(`get-profile/${id}`, token).subscribe({
      next: (res) => {
        this.user = res;

        this.profileForm.patchValue({
          correo: res.correo,
          cedula: res.cedula,
          nombre: res.nombre,
          apellido: res.apellido,
          puesto: res.puesto,
          role_id: res.role?.id,
        });

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.dialog.open(AlertDialogComponent, {
          data: { icon: 'error', message: 'Ha ocurrido un error, por favor intentalo mas tarde', showCancel: false, acceptText: 'Aceptar' }
        });
      }
    });
  }

  save(): void {
    this.isLoading = true;
    const id = this.user.id;
    const token = localStorage.getItem('accessToken') || undefined;

    const body = {
      nombre: this.profileForm.get('nombre')?.value,
      apellido: this.profileForm.get('apellido')?.value,
      puesto: this.profileForm.get('puesto')?.value,
      role_id: this.profileForm.get('role_id')?.value,
    };

    this.apiService.patch<any>(`update-profile/${id}`, body, token).subscribe({
      next: () => {
        this.isLoading = false;
        this.dialog.open(AlertDialogComponent, {
          data: { icon: 'success', message: 'Usuario actualizado con éxito', showCancel: false, acceptText: 'Aceptar' }
        });
        this.router.navigate(['/users-list']);
      },
      error: () => {
        this.isLoading = false;
        this.dialog.open(AlertDialogComponent, {
          data: { icon: 'error', message: 'Ha ocurrido un error, por favor intentalo mas tarde', showCancel: false, acceptText: 'Aceptar' }
        });
      }
    });
  }

  changeStatus(): void {
    const id = this.route.snapshot.paramMap.get('id');

    const action = this.user?.estado === 1 ? 'Bloquear' : 'Desbloquear';

    const confirmDialog = this.dialog.open(AlertDialogComponent, {
      data: {
        icon: 'info',
        message: `¿Deseas ${action} este usuario?`,
        showCancel: true,
        acceptText: 'Aceptar',
        cancelText: 'Cancelar'
      }
    });

    confirmDialog.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        const token = localStorage.getItem('accessToken') || undefined;

        this.apiService.patch<any>(`users/disable/${id}`, {}, token).subscribe({
          next: (res) => {
            this.isLoading = false;
            this.user.estado = res.user.estado;
            this.dialog.open(AlertDialogComponent, {
              data: {
                icon: 'success',
                message: `Usuario ${this.user.estado === 1 ? 'desbloqueado' : 'bloqueado'} con éxito`,
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
    });
  }
}