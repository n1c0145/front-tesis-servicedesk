import { Component, ViewChild, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { AlertDialogComponent } from '../../layout/alert-dialog/alert-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatMenuModule,
    RouterModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  title = 'Service Desk';
  userName = '';
  userInitial = '';
  unreadCount = 0;
  unreadNotifications: any[] = [];
  @ViewChild('sidenav') sidenav!: MatSidenav;

  constructor(private router: Router, private apiService: ApiService, private dialog: MatDialog) { }

  ngOnInit(): void {
    const storedName = localStorage.getItem('nombre') || 'Usuario';
    this.userName = storedName;
    this.userInitial = storedName.charAt(0).toUpperCase();

    this.loadNotifications();
  }

  loadNotifications(): void {
    const id = localStorage.getItem('id');
    const token = localStorage.getItem('accessToken');
    if (!id || !token) return;

    this.apiService.get<any>(`notifications-unread/${id}`, token).subscribe({
      next: (res) => {
        console.log('Notificaciones:', res);
        this.unreadCount = res.unread_count || 0;
        this.unreadNotifications = res.unread_notifications || [];
      },
      error: (err) => this.dialog.open(AlertDialogComponent, {
        data: {
          icon: 'error',
          message: 'Ha ocurrido un error. Inténtalo más tarde.',
          showCancel: false,
          acceptText: 'Aceptar'
        }
      })
    });
  }

  markAsRead(notificationId: string, event?: Event): void {
    event?.stopPropagation();

    const index = this.unreadNotifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      this.unreadNotifications.splice(index, 1);
      this.unreadNotifications = [...this.unreadNotifications];
      if (this.unreadCount > 0) this.unreadCount--;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    this.apiService.post<any>(`mark-read/${notificationId}`, {}, token).subscribe({
      next: () => {
        console.log(`Notificación ${notificationId} marcada como leída`);
      },
      error: (err) => {
        this.dialog.open(AlertDialogComponent, {
          data: {
            icon: 'error',
            message: 'Ha ocurrido un error. Inténtalo más tarde.',
            showCancel: false,
            acceptText: 'Aceptar'
          }
        });
        this.unreadCount++;
        this.loadNotifications();
      }
    });
  }

  toggleSidenav(): void {
    this.sidenav.toggle();
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
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
}
