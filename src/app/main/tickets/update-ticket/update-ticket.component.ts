import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { NgxFileDropModule, NgxFileDropEntry, FileSystemFileEntry } from 'ngx-file-drop';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { AlertDialogComponent } from '../../../layout/alert-dialog/alert-dialog.component';
import { LoadingComponent } from '../../../layout/loading/loading.component';

@Component({
  selector: 'app-update-ticket',
  standalone: true,
  templateUrl: './update-ticket.component.html',
  styleUrls: ['./update-ticket.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    NgxFileDropModule,
    LoadingComponent,
  ],
})
export class UpdateTicketComponent implements OnInit {
  form!: FormGroup;
  archivos: File[] = [];
  isLoading = false;
  usuariosProyecto: any[] = [];
  roleId = Number(localStorage.getItem('roleId'));
  ticket: any;

  // Opciones para los dropdowns
  prioridades = [
    { id: 1, nombre: 'Baja' },
    { id: 2, nombre: 'Media' },
    { id: 3, nombre: 'Alta' },
    { id: 4, nombre: 'Sin asignar' }
  ];

  estados = [
    { id: 1, nombre: 'Abierto' },
    { id: 3, nombre: 'Se necesita más información' },
    { id: 4, nombre: 'En progreso' },
    { id: 5, nombre: 'En espera' },
    { id: 6, nombre: 'Resuelto' },
    { id: 7, nombre: 'Cerrado' }
  ];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<UpdateTicketComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.ticket = data.ticket;
  }

  ngOnInit(): void {
    this.initForm();
    this.getUsuariosProyecto();
  }

  initForm(): void {
    this.form = this.fb.group({
      mensaje: ['', Validators.required],
      private: [false],
      time: [null],
      priority_id: [this.ticket?.priority_id ?? null],
      status_id: [this.ticket?.status_id ?? null],
      assigned_to: [this.ticket?.assigned_to ?? 0],
    });
  }

  getUsuariosProyecto(): void {
    this.isLoading = true;

    this.apiService
      .post<any>('users-byproject', { project_id: this.ticket?.project_id })
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          if (Array.isArray(res)) {
            this.usuariosProyecto = res;
          } else if (res && Array.isArray(res.data)) {
            this.usuariosProyecto = res.data;
          } else {
            this.usuariosProyecto = [];
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.dialog.open(AlertDialogComponent, {
            data: {
              icon: 'error',
              message: 'Ha ocurrido un error inténtalo más tarde',
              showCancel: false,
              acceptText: 'Aceptar',
            },
          });

          this.usuariosProyecto = [];
        },
      });
  }
  // Helpers
  getPrioridadNombre(id: number): string {
    const prioridad = this.prioridades.find(p => p.id === id);
    return prioridad ? prioridad.nombre : 'Sin asignar';
  }


  getEstadoNombre(id: number): string {
    const estado = this.estados.find(e => e.id === id);
    return estado ? estado.nombre : 'Desconocido';
  }

  getPrioridadesFiltradas() {
    return this.prioridades.filter(p => p.id !== this.ticket?.priority_id);
  }

  getEstadosFiltrados() {
    return this.estados.filter(e => e.id !== this.ticket?.status_id);
  }

  getOpcionesAsignado() {
    const opciones = [];

    opciones.push({ id: 0, user_name: 'Bandeja general del proyecto' });

    opciones.push(...this.usuariosProyecto);

    return opciones;
  }

  esOpcionActual(id: number): boolean {
    return id === (this.ticket?.assigned_to ?? 0);
  }

  onFileDrop(files: NgxFileDropEntry[]): void {
    for (const droppedFile of files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => this.archivos.push(file));
      }
    }
  }

  onFileBrowse(event: any): void {
    const files = event.target.files;
    for (let i = 0; i < files.length; i++) {
      this.archivos.push(files[i]);
    }
  }

  eliminarArchivo(nombre: string): void {
    this.archivos = this.archivos.filter((f) => f.name !== nombre);
  }

  onSave(): void {

    this.isLoading = true;
    const user_id = localStorage.getItem('id') || '';

    const formData = new FormData();
    formData.append('ticket_id', String(this.ticket?.id));
    formData.append('user_id', String(user_id));
    formData.append('mensaje', this.form.value.mensaje);
    formData.append('private', this.form.value.private ? '1' : '0');

    const fieldsToCheck = ['status_id', 'priority_id', 'assigned_to'];
    fieldsToCheck.forEach((key) => {
      const newVal = this.form.value[key];
      const oldVal = this.ticket?.[key] ?? null;
      if (String(newVal) !== String(oldVal) && newVal !== null) {
        formData.append(key, String(newVal));
      }
    });

    const timeVal = this.form.value.time;
    if (timeVal !== null && timeVal !== '' && !isNaN(Number(timeVal))) {
      formData.append('tiempo', String(Math.floor(Number(timeVal))));
    }

    this.archivos.forEach((file) => formData.append('archivos[]', file, file.name));

    this.apiService.post<any>('new-thread', formData).subscribe({
      next: (res) => {
        this.isLoading = false;
        const dialogRef = this.dialog.open(AlertDialogComponent, {
          data: {
            icon: 'success',
            message: 'Hilo creado correctamente',
            showCancel: false,
            acceptText: 'Aceptar',
          },
        });
        dialogRef.afterClosed().subscribe(() => {
          this.dialogRef.close({ saved: true, response: res });
          location.reload();
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.dialog.open(AlertDialogComponent, {
          data: {
            icon: 'error',
            message: 'Ha ocurrido un error al crear el hilo, inténtalo más tarde',
            showCancel: false,
            acceptText: 'Aceptar',
          },
        });
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}