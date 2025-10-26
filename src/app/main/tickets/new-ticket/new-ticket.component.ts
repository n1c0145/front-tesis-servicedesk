import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { NgxFileDropEntry, FileSystemFileEntry, NgxFileDropModule } from 'ngx-file-drop';
import { ApiService } from '../../../services/api.service';
import { LoadingComponent } from '../../../layout/loading/loading.component';
import { AlertDialogComponent } from '../../../layout/alert-dialog/alert-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-ticket',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatListModule,
    NgxFileDropModule,
    LoadingComponent,
    ReactiveFormsModule,
    MatExpansionModule
  ],
  templateUrl: './new-ticket.component.html',
  styleUrl: './new-ticket.component.scss'
})
export class NewTicketComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  form!: FormGroup;
  proyectos: any[] = [];
  archivos: File[] = [];
  usuariosProyecto: any[] = [];
  isLoading = false;
  roleId!: number;

  prioridades = [
    { id: 1, nombre: 'Baja' },
    { id: 2, nombre: 'Media' },
    { id: 3, nombre: 'Alta' }
  ];

  constructor(private fb: FormBuilder, private apiService: ApiService, private dialog: MatDialog, private router: Router) { }

  ngOnInit(): void {
    this.roleId = Number(localStorage.getItem('roleId'));

    this.form = this.fb.group({
      titulo: ['', Validators.required],
      descripcion: [''],
      project_id: ['', Validators.required],
      sla: [false],
      prioridad: [this.roleId !== 4 ? '' : null, this.roleId !== 4 ? Validators.required : []],
      mensaje_inicial: ['', Validators.required],
      asignarBandeja: [true],
      asignarUsuario: [false],
      usuarioAsignado: ['']
    });

    this.cargarProyectos();
  }

  cargarProyectos(): void {
    this.isLoading = true;
    const token = localStorage.getItem('accessToken') || undefined;
    const user_id = localStorage.getItem('id');

    this.apiService.post<any>('projects-byuser', { user_id }, token).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.proyectos = res;
      },
      error: () => {
        this.isLoading = false;
        this.dialog.open(AlertDialogComponent, {
          data: {
            icon: 'error',
            message: 'Ha ocurrido un error, inténtalo más tarde',
            showCancel: false,
            acceptText: 'Aceptar'
          }
        });
      }
    });
  }

  onProjectChange(): void {
    if (this.form.get('asignarUsuario')?.value) {
      this.cargarUsuariosProyecto();
    }
  }

  onCheckBandeja(): void {
    if (this.form.get('asignarBandeja')?.value) {
      this.form.get('asignarUsuario')?.setValue(false);
      this.usuariosProyecto = [];
      this.form.get('usuarioAsignado')?.setValue('');
    }
  }

  onCheckUsuario(): void {
    if (this.form.get('asignarUsuario')?.value) {
      this.form.get('asignarBandeja')?.setValue(false);
      this.cargarUsuariosProyecto();
    } else {
      this.usuariosProyecto = [];
      this.form.get('usuarioAsignado')?.setValue('');
    }
  }

  cargarUsuariosProyecto(): void {
    const projectId = this.form.get('project_id')?.value;
    if (!projectId) {
      this.dialog.open(AlertDialogComponent, {
        data: {
          icon: 'info',
          message: 'Debes seleccionar un proyecto antes de asignar un usuario',
          showCancel: false,
          acceptText: 'Aceptar'
        }
      });
      return;
    }

    this.isLoading = true;
    const token = localStorage.getItem('accessToken') || undefined;

    this.apiService.post<any>('users-byproject', { project_id: projectId }, token).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.usuariosProyecto = res;
      },
      error: () => {
        this.isLoading = false;
        this.dialog.open(AlertDialogComponent, {
          data: {
            icon: 'error',
            message: 'Ha ocurrido un error al cargar los usuarios del proyecto',
            showCancel: false,
            acceptText: 'Aceptar'
          }
        });
      }
    });
  }

  // Manejo de archivos
  onFileDrop(files: NgxFileDropEntry[]): void {
    for (const droppedFile of files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => this.validarYAgregarArchivo(file));
      }
    }
  }

  onFileBrowse(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    Array.from(input.files).forEach(file => this.validarYAgregarArchivo(file));
    input.value = '';
  }

  validarYAgregarArchivo(file: File): void {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const validExt = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'];
    const maxSize = 10 * 1024 * 1024;

    if (!validExt.includes(ext || '') || file.size > maxSize) {
      this.dialog.open(AlertDialogComponent, {
        data: {
          icon: 'error',
          message: 'Solo se permiten archivos jpg, jpeg, png, pdf, doc, docx y máximo 10 MB',
          showCancel: false,
          acceptText: 'Aceptar'
        }
      });
      return;
    }

    if (this.archivos.some(f => f.name === file.name)) {
      this.dialog.open(AlertDialogComponent, {
        data: {
          icon: 'info',
          message: 'El archivo ya ha sido agregado',
          showCancel: false,
          acceptText: 'Aceptar'
        }
      });
      return;
    }

    this.archivos.push(file);
  }

  eliminarArchivo(nombre: string): void {
    this.archivos = this.archivos.filter(f => f.name !== nombre);
  }

  // Guardar ticket
  guardar(): void {
    if (this.form.invalid) return;

    this.isLoading = true;
    const token = localStorage.getItem('accessToken') || undefined;
    const created_by = localStorage.getItem('id');

    const formData = new FormData();
    formData.append('titulo', this.form.value.titulo);
    formData.append('descripcion', this.form.value.descripcion);
    formData.append('project_id', this.form.value.project_id);
    formData.append('created_by', created_by || '');
    formData.append('mensaje_inicial', this.form.value.mensaje_inicial);

    // Control de prioridad y SLA según el rol
    if (this.roleId === 4) {
      formData.append('sla', this.form.value.sla ? '1' : '0');
      formData.append('priority_id', '4');
    } else {
      formData.append('priority_id', this.form.value.prioridad);
      formData.append('sla', '0');
    }

    if (this.form.get('asignarUsuario')?.value) {
      formData.append('assigned_to', this.form.get('usuarioAsignado')?.value);
    }

    this.archivos.forEach(file => formData.append('archivos[]', file, file.name));

    this.apiService.post<any>('create-ticket', formData, token).subscribe({
      next: res => {
        this.isLoading = false;
        this.form.reset({ asignarBandeja: true, asignarUsuario: false });
        this.archivos = [];
        this.usuariosProyecto = [];

        const dialogRef = this.dialog.open(AlertDialogComponent, {
          data: { icon: 'success', message: 'Ticket creado correctamente', showCancel: false, acceptText: 'Aceptar' }
        });
        dialogRef.afterClosed().subscribe(() => {
          this.router.navigate(['/ticket-list']);  
        });
      },
      error: err => {
        this.isLoading = false;
        this.dialog.open(AlertDialogComponent, {
          data: { icon: 'error', message: 'Ha ocurrido un error, inténtalo más tarde', showCancel: false, acceptText: 'Aceptar' }
        });
      }
    });
  }
}
