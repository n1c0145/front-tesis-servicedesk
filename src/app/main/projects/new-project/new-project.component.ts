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
import { Router } from '@angular/router';
import { Observable, map, startWith } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { LoadingComponent } from '../../../layout/loading/loading.component';
import { AlertDialogComponent } from '../../../layout/alert-dialog/alert-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';


interface User {
  id: number;
  nombre: string;
  apellido: string;
  puesto: string;
  estado: number;
}

@Component({
  selector: 'app-new-project',
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
    MatTooltipModule,
    RouterModule
  ],
  templateUrl: './new-project.component.html',
  styleUrl: './new-project.component.scss'
})
export class NewProjectComponent implements OnInit {
  form: FormGroup;
  isLoading = false;

  allUsers: User[] = [];
  filteredUsers!: Observable<User[]>;
  selectedUsers: User[] = [];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private dialog: MatDialog,
    private router: Router
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
    this.loadUsers();
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
        control?.setValue(null);
      }
      control?.updateValueAndValidity();
    });

    configGroup.get('maxResolutionEnabled')?.valueChanges.subscribe(enabled => {
      const control = configGroup.get('maxresolution');
      if (enabled) {
        control?.setValidators([Validators.required, Validators.min(1)]);
      } else {
        control?.clearValidators();
        control?.setValue(null);
      }
      control?.updateValueAndValidity();
    });

    configGroup.get('effectiveTimeEnabled')?.valueChanges.subscribe(enabled => {
      const control = configGroup.get('effectivetime');
      if (enabled) {
        control?.setValidators([Validators.required, Validators.min(1)]);
      } else {
        control?.clearValidators();
        control?.setValue(null);
      }
      control?.updateValueAndValidity();
    });

    configGroup.get('hoursBankEnabled')?.valueChanges.subscribe(enabled => {
      const control = configGroup.get('hoursbank');
      if (enabled) {
        control?.setValidators([Validators.required, Validators.min(1)]);
      } else {
        control?.clearValidators();
        control?.setValue(null);
      }
      control?.updateValueAndValidity();
    });
  }

  isConfigValid(): boolean {
    const configGroup = this.form.get('configuraciones');
    return configGroup ? configGroup.valid : true;
  }

  // cargar usuarios
  loadUsers(): void {
    this.apiService.get<User[]>('profiles').subscribe({
      next: (users) => {
        this.allUsers = users.filter(u => u.estado === 1);
      },
      error: () => {
        this.dialog.open(AlertDialogComponent, {
          data: {
            icon: 'error',
            message: 'Error al cargar los usuarios disponibles',
            showCancel: false,
            acceptText: 'Aceptar'
          }
        });
      }
    });
  }

  // filtro
  private filterUsers(value: any): User[] {
    const filterValue = (typeof value === 'string' ? value : '').toLowerCase();
    return this.allUsers
      .filter(user =>
        `${user.nombre} ${user.apellido} - ${user.puesto}`
          .toLowerCase()
          .includes(filterValue)
      )
      .filter(u => !this.selectedUsers.some(s => s.id === u.id));
  }

  // añadir usuario al chip
  addUser(user: User): void {
    if (!this.selectedUsers.some(u => u.id === user.id)) {
      this.selectedUsers.push(user);
      this.form.get('userSearch')!.setValue('');
    }
  }

  // eliminar chip
  removeUser(user: User): void {
    const index = this.selectedUsers.findIndex(u => u.id === user.id);
    if (index >= 0) this.selectedUsers.splice(index, 1);
  }

  save(): void {
    this.isLoading = true;

    const userId = localStorage.getItem('id');
    const config = this.form.get('configuraciones')?.value;

    const body: any = {
      nombre: this.form.get('nombre')!.value,
      descripcion: this.form.get('descripcion')!.value,
      user_ids: this.selectedUsers.map(u => u.id),
      created_by: userId
    };

    if (config.firstResponseEnabled && config.firstresponse) {
      body.firstresponse = config.firstresponse;
    }
    if (config.maxResolutionEnabled && config.maxresolution) {
      body.maxresolution = config.maxresolution;
    }
    if (config.effectiveTimeEnabled && config.effectivetime) {
      body.effectivetime = config.effectivetime;
    }
    if (config.hoursBankEnabled && config.hoursbank) {
      body.hoursbank = config.hoursbank;
    }

    this.apiService.post<any>('create-projects', body).subscribe({
      next: () => {
        this.isLoading = false;
        this.dialog.open(AlertDialogComponent, {
          data: {
            icon: 'success',
            message: 'Proyecto creado correctamente',
            showCancel: false,
            acceptText: 'Aceptar'
          }
        });
        this.router.navigate(['/projects-list']);
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

}