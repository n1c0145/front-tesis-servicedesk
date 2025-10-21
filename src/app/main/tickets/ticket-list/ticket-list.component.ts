import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { ApiService } from '../../../services/api.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from '../../../layout/alert-dialog/alert-dialog.component';
import { LoadingComponent } from '../../../layout/loading/loading.component';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatExpansionModule,
    LoadingComponent
  ],
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.scss']
})
export class TicketListComponent implements OnInit {
  displayedColumns: string[] = [
    'ticket_number',
    'titulo',
    'prioridad',
    'estado',
    'created_by',
    'created_at'
  ];
  dataSource = new MatTableDataSource<any>([]);
  isLoading = false;

  projects: any[] = [];
  users: any[] = [];
  selectedProjectId: number | null = null;
  selectedUserId: number | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.isLoading = true;
    const token = localStorage.getItem('accessToken') || undefined;

    Promise.all([
      this.apiService.post<any>('tickets', {}, token).toPromise(),
      this.apiService.get<any>('tickets-listprojects', token).toPromise(),
      this.apiService.get<any>('tickets-listusers', token).toPromise()
    ])
      .then(([tickets, projects, users]) => {
  
        this.dataSource.data = tickets || [];
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;

          // filtro general 
          this.dataSource.filterPredicate = (data, filter: string) => {
            const normalized = filter.trim().toLowerCase();
            return (
              data.ticket_number?.toString().toLowerCase().includes(normalized) ||
              data.titulo?.toLowerCase().includes(normalized) ||
              data.prioridad?.toLowerCase().includes(normalized) ||
              data.estado?.toLowerCase().includes(normalized) ||
              data.created_by?.toLowerCase().includes(normalized) ||
              data.created_at?.toString().toLowerCase().includes(normalized)
            );
          };
        });

        // Cargar filtros
        this.projects = projects || [];
        this.users = users || [];
      })
      .catch(() => {
        this.dialog.open(AlertDialogComponent, {
          data: {
            icon: 'error',
            message: 'Error al cargar los datos. intentalo mas tarde',
            showCancel: false,
            acceptText: 'Aceptar'
          }
        });
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  applyFilters(): void {
    const filters: any = {};
    if (this.selectedProjectId) filters.project_id = this.selectedProjectId;
    if (this.selectedUserId) filters.created_by = this.selectedUserId;
    this.getTickets(filters);
  }

  getTickets(filters: any = {}): void {
    this.isLoading = true;
    const token = localStorage.getItem('accessToken') || undefined;

    this.apiService.post<any>('tickets', filters, token).subscribe({
      next: (res) => {
        this.dataSource.data = res;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.dialog.open(AlertDialogComponent, {
          data: {
            icon: 'error',
            message: 'Error al cargar tickets',
            showCancel: false,
            acceptText: 'Aceptar'
          }
        });
      }
    });
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
