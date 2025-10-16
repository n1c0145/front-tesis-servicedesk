import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [],
  templateUrl: './ticket-list.component.html',
  styleUrl: './ticket-list.component.scss'
})
export class TicketListComponent {
  constructor(

    private router: Router,

  ) { }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
