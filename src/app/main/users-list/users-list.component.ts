import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
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
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, LoadingComponent],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss'
})
export class UsersListComponent implements OnInit {
  displayedColumns: string[] = ['nombre', 'correo', 'puesto', 'rol', 'estado', 'acciones'];
  users: any[] = [];
  isLoading = false;

  constructor(private apiService: ApiService, private router: Router, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers(): void {
    this.isLoading = true;
    const token = localStorage.getItem('accessToken') || undefined;

    this.apiService.get<any>('profiles', token).subscribe({
      next: (res) => {
        this.users = res;
        this.isLoading = false;
      },
      error: (err) => {

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

  editUser(userId: number): void {
    this.router.navigate(['/manage-profile', userId]);

  }
}