import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../../services/api.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from '../../../layout/alert-dialog/alert-dialog.component';
import { LoadingComponent } from '../../../layout/loading/loading.component';

@Component({
  selector: 'app-projects-list',
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
  templateUrl: './projects-list.component.html',
  styleUrl: './projects-list.component.scss'
})
export class ProjectsListComponent {

  displayedColumns: string[] = ['nombre', 'descripcion', 'creadoPor', 'numUsuarios', 'acciones'];
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
    this.getProjects();
  }

  getProjects(): void {
    this.isLoading = true;
    const token = localStorage.getItem('accessToken') || undefined;

    this.apiService.get<any>('projects', token).subscribe({
      next: (res) => {
        // columna derivada: número de usuarios
        const projects = res.map((p: any) => ({
          ...p,
          numUsuarios: p.users ? p.users.length : 0
        }));

        this.dataSource.data = projects;
        this.isLoading = false;

        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;

          // sorting
          this.dataSource.sortingDataAccessor = (item, property) => {
            switch (property) {
              case 'fechaCreacion':
                return new Date(item.created_at);
              case 'numUsuarios':
                return item.numUsuarios;
              case 'creadoPor':
                return `${item.creator?.nombre ?? ''} ${item.creator?.apellido ?? ''}`.toLowerCase();
              default:
                return (item[property] ?? '').toString().toLowerCase();
            }
          };

          // Filtro 
          this.dataSource.filterPredicate = (data, filter) => {
            const normalizedFilter = filter.trim().toLowerCase();

            const nombre = data.nombre?.toLowerCase() || '';
            const descripcion = data.descripcion?.toLowerCase() || '';
            const fecha = data.created_at?.toLowerCase() || '';
            const numUsuarios = data.numUsuarios?.toString() || '';
            const creador = `${data.creator?.nombre ?? ''} ${data.creator?.apellido ?? ''}`.toLowerCase();

            return (
              nombre.includes(normalizedFilter) ||
              descripcion.includes(normalizedFilter) ||
              fecha.includes(normalizedFilter) ||
              numUsuarios.includes(normalizedFilter) ||
              creador.includes(normalizedFilter)
            );
          };
        });
      },
      error: () => {
        this.dialog.open(AlertDialogComponent, {
          data: {
            icon: 'error',
            message: 'Ha ocurrido un error al cargar los proyectos. Inténtalo más tarde.',
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

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  editProject(projectId: number): void {
    this.router.navigate(['/update-project', projectId]);
  }
}
