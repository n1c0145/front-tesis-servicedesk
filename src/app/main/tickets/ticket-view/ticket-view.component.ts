import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule, MatExpansionPanel } from '@angular/material/expansion';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { LoadingComponent } from '../../../layout/loading/loading.component';
import { AlertDialogComponent } from '../../../layout/alert-dialog/alert-dialog.component';


@Component({
  selector: 'app-ticket-view',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatDialogModule,
    LoadingComponent,

  ],
  templateUrl: './ticket-view.component.html',
  styleUrls: ['./ticket-view.component.scss']
})
export class TicketViewComponent implements OnInit {
  @ViewChildren(MatExpansionPanel) panels!: QueryList<MatExpansionPanel>;

  ticket: any = null;
  isLoading = false;
  isExpandedAll = false;
  ticketId: string | number | null = null;

  constructor(private route: ActivatedRoute, private apiService: ApiService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.ticketId = id;
        this.loadTicket(id);
      }
    });
  }

  loadTicket(id: string | number): void {
    this.isLoading = true;
    const token = localStorage.getItem('accessToken') || undefined;
    const endpoint = `ticket/${id}`;

    this.apiService.get<any>(endpoint, token).subscribe({
      next: res => {
        this.ticket = res;
        this.isLoading = false;
      },
      error: err => {
        this.isLoading = false;
        this.dialog.open(AlertDialogComponent, {
          data: { icon: 'error', message: 'Error al cargar el ticket.', showCancel: false, acceptText: 'Aceptar' }
        });
      }
    });
  }

  onActualizar(): void {
    this.dialog.open(AlertDialogComponent, {
      data: { icon: 'info', message: 'Acción para modificar el ticket.', showCancel: false, acceptText: 'Aceptar' }
    });
  }

  openAttachment(url: string | null | undefined): void {
    if (url) window.open(url, '_blank', 'noopener');
  }

  toggleAllPanels(): void {
    this.isExpandedAll = !this.isExpandedAll;
    this.panels.forEach(panel => {
      if (this.isExpandedAll) {
        panel.open();
      } else {
        panel.close();
      }
    });
  }
}
