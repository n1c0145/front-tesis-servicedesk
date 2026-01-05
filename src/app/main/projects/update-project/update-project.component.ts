import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, map, startWith } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { LoadingComponent } from '../../../layout/loading/loading.component';
import { AlertDialogComponent } from '../../../layout/alert-dialog/alert-dialog.component'
import { MatTooltipModule } from '@angular/material/tooltip';

interface User {
  id: number;
  nombre: string;
  apellido: string;
  puesto: string;
  estado: number;
}

@Component({
  selector: 'app-update-project',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatAutocompleteModule,
    MatSlideToggleModule,
    LoadingComponent,
    MatTooltipModule
  ],
  templateUrl: './update-project.component.html',
  styleUrl: './update-project.component.scss'
})
export class UpdateProjectComponent {
  form: FormGroup;
  isLoading = false;

  allUsers: User[] = [];
  filteredUsers!: Observable<User[]>;
  selectedUsers: User[] = [];
  projectId!: string | null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      userSearch: [''],
      configuraciones: this.fb.group({
        firstResponseEnabled: [false],
        maxResolutionEnabled: [false],
        effectiveTimeEnabled: [false],
        hoursBankEnabled: [false],

        firstresponse: [null],
        maxresolution: [null],
        effectivetime: [null],
        hoursbank: [null]
      })
    });

    this.setupToggleListeners();
  }

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id');
    this.loadUsers();
    if (this.projectId) {
      this.loadProject(this.projectId);
    }

    this.filteredUsers = this.form.get('userSearch')!.valueChanges.pipe(
      startWith(''),
      map(value => this.filterUsers(value || ''))
    );
  }

  private setupToggleListeners(): void {
    const configGroup = this.form.get('configuraciones');
    if (!configGroup) return;


    configGroup.get('firstResponseEnabled')?.valueChanges.subscribe(enabled => {
      const control = configGroup.get('firstresponse');
      if (enabled) {
        control?.setValidators([Validators.required, Validators.min(1)]);
      } else {
        control?.clearValidators();

      }
      control?.updateValueAndValidity();
    });

    configGroup.get('maxResolutionEnabled')?.valueChanges.subscribe(enabled => {
      const control = configGroup.get('maxresolution');
      if (enabled) {
        control?.setValidators([Validators.required, Validators.min(1)]);
      } else {
        control?.clearValidators();
      }
      control?.updateValueAndValidity();
    });

    configGroup.get('effectiveTimeEnabled')?.valueChanges.subscribe(enabled => {
      const control = configGroup.get('effectivetime');
      if (enabled) {
        control?.setValidators([Validators.required, Validators.min(1)]);
      } else {
        control?.clearValidators();
      }
      control?.updateValueAndValidity();
    });

    configGroup.get('hoursBankEnabled')?.valueChanges.subscribe(enabled => {
      const control = configGroup.get('hoursbank');
      if (enabled) {
        control?.setValidators([Validators.required, Validators.min(1)]);
      } else {
        control?.clearValidators();
      }
      control?.updateValueAndValidity();
    });
  }

  isConfigValid(): boolean {
    const configGroup = this.form.get('configuraciones');
    return configGroup ? configGroup.valid : true;
  }

  loadUsers(): void {
    this.apiService.get<User[]>('profiles').subscribe({
      next: (users) => {
        this.allUsers = users.filter(u => u.estado === 1);
      },
      error: () => {
        this.dialog.open(AlertDialogComponent, {
          data: { icon: 'error', message: 'Error al cargar los usuarios', showCancel: false, acceptText: 'Aceptar' }
        });
      }
    });
  }

  // Cargar proyecto 
  loadProject(id: string): void {
    this.isLoading = true;
    this.apiService.get<any>(`projects/${id}`).subscribe({
      next: (project) => {
        this.isLoading = false;

        this.form.patchValue({
          nombre: project.nombre,
          descripcion: project.descripcion
        });

        const config = {
          firstResponseEnabled: project.firstresponse !== null,
          maxResolutionEnabled: project.maxresolution !== null,
          effectiveTimeEnabled: project.effectivetime !== null,
          hoursBankEnabled: project.hoursbank !== null,

          firstresponse: project.firstresponse,
          maxresolution: project.maxresolution,
          effectivetime: project.effectivetime,
          hoursbank: project.hoursbank
        };

        this.form.get('configuraciones')?.patchValue(config);

        setTimeout(() => {
          const configGroup = this.form.get('configuraciones');
          if (configGroup) {
            configGroup.get('firstresponse')?.updateValueAndValidity();
            configGroup.get('maxresolution')?.updateValueAndValidity();
            configGroup.get('effectivetime')?.updateValueAndValidity();
            configGroup.get('hoursbank')?.updateValueAndValidity();
          }
        });

        // Cargar usuarios asignados como chips
        this.selectedUsers = project.users.filter((u: User) => u.estado === 1).map((u: any) => ({
          id: u.id,
          nombre: u.nombre,
          apellido: u.apellido,
          puesto: u.puesto,
          estado: u.estado
        }));
      },
      error: () => {
        this.isLoading = false;
        this.dialog.open(AlertDialogComponent, {
          data: { icon: 'error', message: 'No se pudo cargar el proyecto', showCancel: false, acceptText: 'Aceptar' }
        });
      }
    });
  }

  // Filtrar usuarios para autocomplete
  private filterUsers(value: any): User[] {
    const filterValue = (typeof value === 'string' ? value : '').toLowerCase();
    return this.allUsers
      .filter(u => `${u.nombre} ${u.apellido} - ${u.puesto}`.toLowerCase().includes(filterValue))
      .filter(u => !this.selectedUsers.some(s => s.id === u.id));
  }

  // Añadir usuario al chip
  addUser(user: User): void {
    if (!this.selectedUsers.some(u => u.id === user.id)) {
      this.selectedUsers.push(user);
      this.form.get('userSearch')!.setValue('');
    }
  }

  // Eliminar chip
  removeUser(user: User): void {
    const index = this.selectedUsers.findIndex(u => u.id === user.id);
    if (index >= 0) this.selectedUsers.splice(index, 1);
  }

  save(): void {
    this.isLoading = true;

    const config = this.form.get('configuraciones')?.value;
    const body: any = {
      nombre: this.form.get('nombre')!.value,
      descripcion: this.form.get('descripcion')!.value,
      user_ids: this.selectedUsers.map(u => u.id),
      firstresponse: config.firstResponseEnabled ? config.firstresponse : null,
      maxresolution: config.maxResolutionEnabled ? config.maxresolution : null,
      effectivetime: config.effectiveTimeEnabled ? config.effectivetime : null,
      hoursbank: config.hoursBankEnabled ? config.hoursbank : null
    };

    this.apiService.patch<any>(`update-project/${this.projectId}`, body).subscribe({
      next: () => {
        this.isLoading = false;
        this.dialog.open(AlertDialogComponent, {
          data: { icon: 'success', message: 'Proyecto actualizado correctamente', showCancel: false, acceptText: 'Aceptar' }
        }).afterClosed().subscribe(() => {
          this.router.navigate(['/projects-list']);
        });
      },
      error: (err: HttpErrorResponse) => {
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

  // Eliminar proyecto
  deleteProject(): void {
    const confirmDialog = this.dialog.open(AlertDialogComponent, {
      data: {
        icon: 'info',
        message: '¿Deseas eliminar este proyecto?',
        showCancel: true,
        acceptText: 'Aceptar',
        cancelText: 'Cancelar'
      }
    });

    confirmDialog.afterClosed().subscribe(result => {
      if (result) {
        if (!this.projectId) return;
        this.isLoading = true;
        this.apiService.patch(`delete-project/${this.projectId}`, null).subscribe({
          next: () => {
            this.isLoading = false;
            this.dialog.open(AlertDialogComponent, {
              data: { icon: 'success', message: 'Proyecto eliminado correctamente', showCancel: false, acceptText: 'Aceptar' }
            }).afterClosed().subscribe(() => {
              this.router.navigate(['/projects-list']);
            });
          },
          error: () => {
            this.isLoading = false;
            this.dialog.open(AlertDialogComponent, {
              data: { icon: 'error', message: 'Ocurrio un error, por favor intentalo más tarde', showCancel: false, acceptText: 'Aceptar' }
            });
          }
        });
      }
    });
  }
}