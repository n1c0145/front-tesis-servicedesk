import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AlertDialogComponent } from '../../layout/alert-dialog/alert-dialog.component';
import { LoadingComponent } from '../../layout/loading/loading.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NgxChartsModule,
    LoadingComponent,
    CommonModule,
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatListModule
  ],
  templateUrl: './home.component.html'
})

export class HomeComponent implements OnInit {
  isLoading = true;
  homeData: any = null;
  topProjectsData: any[] = [];
  topTicketsData: any[] = [];
  userInitial: string = '';
  displayedColumns: string[] = ['ticket_number', 'titulo', 'status', 'priority'];

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit() {
    const userId = localStorage.getItem('id');
    if (userId !== null) {
      this.loadHomeData(parseInt(userId, 10));
    } else {
      this.isLoading = false;
      this.showError('Usuario no autenticado');
    }
  }

  loadHomeData(userId: number): void {
    this.apiService.post<any>('home', { user_id: userId }).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.homeData = response.data;
        this.topProjectsData = response.data.charts?.top_projects || [];
        this.topTicketsData = response.data.charts?.top_tickets || [];
        const fullName = response.data.user.nombre_completo;
        this.userInitial = fullName.charAt(0).toUpperCase();
      },
      error: (error) => {
        this.isLoading = false;
        this.showError('Ha ocurrido un error inténtalo más tarde');
      }
    });
  }

  irAMiBandeja(): void {
    const id = localStorage.getItem('id');
    const nombre = localStorage.getItem('nombre');
    const apellido = localStorage.getItem('apellido');

    this.router.navigate(['/ticket-list'], {
      queryParams: {
        assigned_to: id,
        assignedName: `${nombre} ${apellido}`
      }
    });
  }

  openTicket(ticketId: number): void {
    this.router.navigate(['/tickets', ticketId]);
  }

  goToTickets(project: any): void {
    this.router.navigate(['/ticket-list'], {
      queryParams: {
        projectId: project.id,
        projectName: project.nombre
      }
    });
  }

  formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  getPriorityColor(priority: string): string {
    switch (priority?.toLowerCase()) {
      case 'alta': return '#f44336';
      case 'media': return '#ff9800';
      case 'baja': return '#4caf50';
      default: return '#757575';
    }
  }

  private showError(message: string): void {
    this.dialog.open(AlertDialogComponent, {
      data: {
        icon: 'error',
        message: message,
        showCancel: false,
        acceptText: 'Aceptar'
      }
    });
  }
  onMouseEnter(event: any) {
    event.currentTarget.style.backgroundColor = '#f5f5f5';
  }

  onMouseLeave(event: any) {
    event.currentTarget.style.backgroundColor = '';
  }
}