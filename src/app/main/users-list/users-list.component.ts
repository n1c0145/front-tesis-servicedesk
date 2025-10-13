import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { LoadingComponent } from '../../layout/loading/loading.component';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from '../../layout/alert-dialog/alert-dialog.component';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    LoadingComponent
  ],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss'
})
export class UsersListComponent implements OnInit {
  displayedColumns: string[] = ['nombre', 'correo', 'puesto', 'rol', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<any>([]);
  isLoading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers(): void {
    this.isLoading = true;
    const token = localStorage.getItem('accessToken') || undefined;

    this.apiService.get<any>('profiles', token).subscribe({
      next: (res) => {
        this.dataSource.data = res;
        this.isLoading = false;

        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;

          this.dataSource.sortingDataAccessor = (item, property) => {
            switch (property) {
              case 'rol':
                return item.role?.nombre?.toLowerCase() || '';
              case 'estado':
                return item.estado === 1 ? 'Activo' : 'Bloqueado';
              default:
                return (item[property] ?? '').toString().toLowerCase();
            }
          };
          this.dataSource.filterPredicate = (data, filter) => {
            const normalizedFilter = filter.trim().toLowerCase();

            const nombre = data.nombre?.toLowerCase() || '';
            const correo = data.correo?.toLowerCase() || '';
            const puesto = data.puesto?.toLowerCase() || '';
            const rol = data.role?.nombre?.toLowerCase() || '';
            const estado = data.estado === 1 ? 'activo' : 'bloqueado';

            return (
              nombre.includes(normalizedFilter) ||
              correo.includes(normalizedFilter) ||
              puesto.includes(normalizedFilter) ||
              rol.includes(normalizedFilter) ||
              estado.includes(normalizedFilter)
            );
          };
        });
      },
      error: () => {
        this.dialog.open(AlertDialogComponent, {
          data: {
            icon: 'error',
            message: 'Ha ocurrido un error, por favor inténtalo más tarde',
            showCancel: false,
            acceptText: 'Aceptar'
          }
        });
        this.isLoading = false;
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  editUser(userId: number): void {
    this.router.navigate(['/manage-profile', userId]);
  }
}
