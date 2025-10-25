import { Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterOutlet, Router } from '@angular/router';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule, RouterOutlet],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  title = 'Service Desk';
  @ViewChild('sidenav') sidenav!: MatSidenav;

  constructor(private router: Router) { }

  toggleSidenav() {
    this.sidenav.toggle();
  }
  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
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

