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
  selector: 'app-ticket-list',
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
  templateUrl: './ticket-list.component.html',
  styleUrl: './ticket-list.component.scss'
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

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getTickets();
  }

  getTickets(): void {
    this.isLoading = true;
    const token = localStorage.getItem('accessToken') || undefined;

    this.apiService.post<any>('tickets', {}, token).subscribe({
      next: (res) => {
        this.dataSource.data = res;
        this.isLoading = false;

        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;

          // Sorting
          this.dataSource.sortingDataAccessor = (item, property) => {
            switch (property) {
              case 'created_at':
                return new Date(item.created_at);
              default:
                return (item[property] ?? '').toString().toLowerCase();
            }
          };

          // Filtro
          this.dataSource.filterPredicate = (data, filter) => {
            const normalizedFilter = filter.trim().toLowerCase();

            return (
              data.ticket_number?.toString().toLowerCase().includes(normalizedFilter) ||
              data.titulo?.toLowerCase().includes(normalizedFilter) ||
              data.prioridad?.toLowerCase().includes(normalizedFilter) ||
              data.estado?.toLowerCase().includes(normalizedFilter) ||
              data.created_by?.toLowerCase().includes(normalizedFilter) ||
              data.created_at?.toLowerCase().includes(normalizedFilter)
            );
          };
        });
      },
      error: () => {
        this.dialog.open(AlertDialogComponent, {
          data: {
            icon: 'error',
            message: 'Ha ocurrido un error al cargar los tickets. Inténtalo más tarde.',
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
}
