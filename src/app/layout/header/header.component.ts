import { Component, ViewChild, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

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
    RouterOutlet
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  title = 'Service Desk';
  userName = '';
  userInitial = '';
  @ViewChild('sidenav') sidenav!: MatSidenav;

  constructor(private router: Router) { }

  ngOnInit(): void {
    const storedName = localStorage.getItem('nombre') || 'Usuario';
    this.userName = storedName;
    this.userInitial = storedName.charAt(0).toUpperCase();
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
