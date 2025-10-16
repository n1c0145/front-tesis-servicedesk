import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
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

@Component({
  selector: 'app-new-ticket',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatListModule,
    NgxFileDropModule
  ],
  templateUrl: './new-ticket.component.html',
  styleUrl: './new-ticket.component.scss'
})
export class NewTicketComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;


  proyectos: any[] = [];
  archivos: File[] = [];
  form!: FormGroup;

  constructor(private fb: FormBuilder, private apiService: ApiService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      titulo: [''],
      descripcion: [''],
      project_id: [''],
      sla: [false],
      mensaje_inicial: ['']
    });

    this.cargarProyectos();
  }

  cargarProyectos(): void {
    const token = localStorage.getItem('accessToken') || undefined;
    const user_id = localStorage.getItem('id');

    this.apiService.post<any>('projects-byuser', { user_id }, token).subscribe(res => {
      this.proyectos = res;
    });
  }

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
    input.value = ''; // permite volver a seleccionar el mismo archivo si se elimina
  }

  validarYAgregarArchivo(file: File): void {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const validExt = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'];
    const maxSize = 10 * 1024 * 1024;

    if (
      !validExt.includes(ext || '') ||
      file.size > maxSize ||
      this.archivos.some(f => f.name === file.name)
    ) return;

    this.archivos.push(file);
  }

  eliminarArchivo(nombre: string): void {
    this.archivos = this.archivos.filter(f => f.name !== nombre);
  }

  guardar(): void {
    const token = localStorage.getItem('accessToken') || undefined;
    const created_by = localStorage.getItem('id');

    const formData = new FormData();
    formData.append('titulo', this.form.value.titulo);
    formData.append('descripcion', this.form.value.descripcion);
    formData.append('project_id', this.form.value.project_id);
    formData.append('created_by', created_by || '');
    formData.append('sla', this.form.value.sla ? '1' : '0');
    formData.append('mensaje_inicial', this.form.value.mensaje_inicial);

    this.archivos.forEach(file => {
      formData.append('archivos[]', file, file.name);
    });

    this.apiService.post<any>('create-ticket', formData, token).subscribe(res => {
      console.log('Ticket creado:', res);
      this.form.reset();
      this.archivos = [];
    });
  }
}
