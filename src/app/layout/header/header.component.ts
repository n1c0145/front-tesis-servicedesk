import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

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
    MatSnackBarModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  title = 'Service Desk';
  userName = '';
  userInitial = '';
  unreadCount = 0;
  unreadNotifications: any[] = [];
  @ViewChild('sidenav') sidenav!: MatSidenav;
  private pollInterval: any;
  isAdmin = false;

  constructor(private router: Router, private apiService: ApiService, private dialog: MatDialog, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    const storedName = localStorage.getItem('nombre') || 'Usuario';
    this.userName = storedName;
    this.userInitial = storedName.charAt(0).toUpperCase();

    const roleId = Number(localStorage.getItem('roleId'));
    this.isAdmin = roleId === 1;

    this.loadNotifications();
    this.startPolling();
  }
  ngOnDestroy(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  loadNotifications(): void {
    const id = localStorage.getItem('id');
    if (!id) return;

    this.apiService.get<any>(`notifications-unread/${id}`).subscribe({
      next: (res) => {
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

  startPolling(): void {
    const id = localStorage.getItem('id');
    if (!id) return;

    this.pollInterval = setInterval(() => {
      this.apiService.get<any>(`notifications-poll/${id}`).subscribe({
        next: (res) => {
          const newCount = res.unread_count || 0;
          if (newCount > this.unreadCount) {
            this.loadNotifications();
            this.showSnackBar();
          }
          this.unreadCount = newCount;
        },
      });
    }, 20000);
  }
  private showSnackBar(): void {
    this.snackBar.open('Tienes notificaciones nuevas', '', {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      panelClass: ['snackbar-notification']
    })
  }
  markAsRead(notificationId: string, event?: Event): void {
    event?.stopPropagation();

    const index = this.unreadNotifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      this.unreadNotifications.splice(index, 1);
      this.unreadNotifications = [...this.unreadNotifications];
      if (this.unreadCount > 0) this.unreadCount--;
    }

    this.apiService.post<any>(`mark-read/${notificationId}`, {}).subscribe({
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
