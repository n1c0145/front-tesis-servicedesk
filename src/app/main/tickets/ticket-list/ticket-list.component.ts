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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ApiService } from '../../../services/api.service';
import { Router, ActivatedRoute } from '@angular/router';
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
    MatDatepickerModule,
    MatNativeDateModule,
    LoadingComponent
  ],
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.scss']
})
export class TicketListComponent implements OnInit {
  displayedColumns: string[] = ['ticket_number', 'titulo', 'prioridad', 'estado', 'created_by', 'created_at'];
  dataSource = new MatTableDataSource<any>([]);
  isLoading = false;

  projects: any[] = [];
  users: any[] = [];
  selectedProjectId: number | null = null;
  selectedUserId: number | null = null;
  selectedCreatedById: number | null = null;
  selectedStatusId: number | null = null;
  selectedPriorityId: number | null = null;
  dateRange: { start: Date | null; end: Date | null } = { start: null, end: null };

  statuses = [
    { id: 1, nombre: 'Abierto' },
    { id: 2, nombre: 'Primera respuesta' },
    { id: 3, nombre: 'Se necesita más información' },
    { id: 4, nombre: 'En progreso' },
    { id: 5, nombre: 'En espera' },
    { id: 6, nombre: 'Resuelto' },
    { id: 7, nombre: 'Cerrado' }
  ];

  priorities = [
    { id: 1, nombre: 'Baja' },
    { id: 2, nombre: 'Media' },
    { id: 3, nombre: 'Alta' },
    { id: 4, nombre: 'Sin asignar' }
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private dialog: MatDialog,
    private route: ActivatedRoute
  ) { }

  async ngOnInit(): Promise<void> {
    await this.loadAllData();

    this.route.queryParams.subscribe(params => {
      const projectId = params['projectId'];
      const assignedTo = params['assigned_to'];

      if (projectId) {
        this.selectedProjectId = +projectId;
        this.getTickets({ project_id: this.selectedProjectId });
      } else if (assignedTo) {
        this.selectedUserId = +assignedTo;
        this.getTickets({ assigned_to: this.selectedUserId });
      } else {
        this.getTickets();
      }
    });
  }

  async loadAllData(): Promise<void> {
    this.isLoading = true;

    try {
      const [projects, users] = await Promise.all([
        this.apiService.get<any>('tickets-listprojects').toPromise(),
        this.apiService.get<any>('tickets-listusers').toPromise()
      ]);

      this.projects = projects || [];
      this.users = users || [];

      setTimeout(() => {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.dataSource.filterPredicate = (data, filter: string) => {
          const normalized = filter.trim().toLowerCase();
          return (
            data.ticket_number?.toString().toLowerCase().includes(normalized) ||
            data.titulo?.toLowerCase().includes(normalized) ||
            data.prioridad?.toLowerCase().includes(normalized) ||
            data.estado?.toLowerCase().includes(normalized) ||
            data.created_by?.toLowerCase().includes(normalized)
          );
        };
      });
    } catch {
      this.dialog.open(AlertDialogComponent, {
        data: { icon: 'error', message: 'Error al cargar los datos iniciales.', showCancel: false, acceptText: 'Aceptar' }
      });
    } finally {
      this.isLoading = false;
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  applyFilters(): void {
    if ((this.dateRange.start && !this.dateRange.end) || (!this.dateRange.start && this.dateRange.end)) {
      this.dialog.open(AlertDialogComponent, {
        data: {
          icon: 'info',
          message: 'Se debe seleccionar 2 fechas válidas para aplicar el filtro por rango de fechas',
          showCancel: false,
          acceptText: 'Aceptar'
        }
      });
      return;
    }

    const filters: any = {};
    if (this.selectedProjectId) filters.project_id = this.selectedProjectId;
    if (this.selectedUserId) filters.assigned_to = this.selectedUserId;
    if (this.selectedCreatedById) filters.created_by = this.selectedCreatedById;
    if (this.selectedStatusId) filters.status_id = this.selectedStatusId;
    if (this.selectedPriorityId) filters.priority_id = this.selectedPriorityId;
    if (this.dateRange.start && this.dateRange.end) {
      filters.date_from = this.dateRange.start.toISOString().split('T')[0];
      filters.date_to = this.dateRange.end.toISOString().split('T')[0];
    }
    this.getTickets(filters);
  }

  clearFilters(): void {
    this.selectedProjectId = null;
    this.selectedUserId = null;
    this.selectedCreatedById = null;
    this.selectedStatusId = null;
    this.selectedPriorityId = null;
    this.dateRange = { start: null, end: null };
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true,
    });
    this.getTickets();
  }

  getTickets(filters: any = {}): void {
    this.isLoading = true;
    this.dataSource.data = [];
    this.apiService.post<any>('tickets', filters).subscribe({
      next: res => {
        this.dataSource.data = res;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.dialog.open(AlertDialogComponent, {
          data: { icon: 'error', message: 'Error al cargar tickets', showCancel: false, acceptText: 'Aceptar' }
        });
      }
    });
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  filterByAssigned(userId: number, userName: string): void {
    this.router.navigate(['/ticket-list'], { queryParams: { assigned_to: userId, assignedName: userName } });
  }
  openTicket(ticketId: number): void {
  this.router.navigate(['/tickets', ticketId]);
}
}
