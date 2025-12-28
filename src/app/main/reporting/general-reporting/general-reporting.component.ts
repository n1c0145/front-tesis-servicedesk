import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from '../../../layout/alert-dialog/alert-dialog.component';
import { LoadingComponent } from '../../../layout/loading/loading.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-general-reporting',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoadingComponent,
    NgxChartsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatExpansionModule,
    MatDividerModule,
    MatProgressBarModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: './general-reporting.component.html'
})
export class GeneralReportingComponent implements OnInit {

  isLoading = true;
  areFiltersReady = false;

  reportData: any = null;
  projects: any[] = [];
  selectedProjectId: number | null = null;

  dateRange = {
    start: null as Date | null,
    end: null as Date | null
  };

  kpis: any[] = [];

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadReport();
    this.loadProjects();
  }

  loadReport(payload: any = {}): void {
    this.isLoading = true;
    this.areFiltersReady = false;

    this.apiService.post<any>('general-report', payload).subscribe({
      next: res => {
        this.reportData = res.data;
        this.buildKpis();
        this.isLoading = false;
        this.areFiltersReady = true;

      },
      error: () => this.dialog.open(AlertDialogComponent, {
        data: {
          icon: 'error',
          message: 'Ha ocurrido un error, inténtalo más tarde',
          showCancel: false,
          acceptText: 'Aceptar'
        }
      })
    });
  }

  loadProjects(): void {
    this.apiService.get<any>('tickets-listprojects').subscribe({
      next: res => {
        this.projects = res;
        this.areFiltersReady = true;
        this.isLoading = false;
      },
      error: () => this.dialog.open(AlertDialogComponent, {
        data: {
          icon: 'error',
          message: 'Ha ocurrido un error, inténtalo más tarde',
          showCancel: false,
          acceptText: 'Aceptar'
        }
      })
    });
  }

  buildKpis(): void {
    const d = this.reportData;

    this.kpis = [
      { label: 'Total tickets', value: d.tickets_summary.total_tickets },
      { label: 'Abiertos', value: d.tickets_summary.tickets_open },
      { label: 'Cerrados', value: d.tickets_summary.tickets_resolved },
      { label: 'Con SLA', value: d.tickets_summary.tickets_with_sla },
      { label: 'Tiempo promedio', value: d.resolution_metrics.average_resolution_formatted },
      { label: 'Promedio (min)', value: `${d.resolution_metrics.average_time_minutes} min` },
      { label: 'Actualizaciones', value: d.updates_summary.total_updates },
      { label: 'Públicas', value: d.updates_summary.public_updates },
      { label: 'Privadas', value: d.updates_summary.private_updates },
      { label: 'Tiempo total', value: this.formatMinutes(d.time_metrics.total_history_time) }
    ];
  }

  applyFilters(): void {
    if ((this.dateRange.start && !this.dateRange.end) ||
      (!this.dateRange.start && this.dateRange.end)) {
      this.dialog.open(AlertDialogComponent, {
        data: {
          icon: 'info',
          message: 'Debes seleccionar ambas fechas',
          showCancel: false,
          acceptText: 'Aceptar'
        }
      });
      return;
    }

    const payload: any = {};

    if (this.selectedProjectId) payload.project_id = this.selectedProjectId;
    if (this.dateRange.start && this.dateRange.end) {
      payload.date_from = this.formatDate(this.dateRange.start);
      payload.date_to = this.formatDate(this.dateRange.end);
    }

    this.loadReport(payload);
  }

  clearFilters(): void {
    this.selectedProjectId = null;
    this.dateRange = { start: null, end: null };
    this.loadReport();
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatMinutes(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  }
}