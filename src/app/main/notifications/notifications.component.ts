import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../services/api.service';
import { LoadingComponent } from '../../layout/loading/loading.component';
import { AlertDialogComponent } from '../../layout/alert-dialog/alert-dialog.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatPaginatorModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    LoadingComponent,
    RouterModule
  ],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent implements OnInit {
  dataSource: any[] = [];
  paginatedData: any[] = [];
  isLoading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  pageSize = 10;
  currentPage = 0;

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading = true;
    const userId = localStorage.getItem('id');

    this.apiService.get<any>(`notifications/${userId}`).subscribe({
      next: (res) => {
        this.dataSource = res;
        this.updatePaginatedData();
        this.isLoading = false;
      },
      error: () => {
        this.dialog.open(AlertDialogComponent, {
          data: {
            icon: 'error',
            message: 'Error al cargar las notificaciones. Inténtalo más tarde.',
            showCancel: false,
            acceptText: 'Aceptar'
          }
        });
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.updatePaginatedData();
  }

  private updatePaginatedData(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedData = this.dataSource.slice(startIndex, endIndex);
  }
}
