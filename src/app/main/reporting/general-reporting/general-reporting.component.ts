import { Component, OnInit, HostListener } from '@angular/core';
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
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

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
    MatButtonModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './general-reporting.component.html'
})
export class GeneralReportingComponent implements OnInit {
  isLoading = true;
  areFiltersReady = false;
  chartColors = 'ocean';

  reportData: any = null;
  projects: any[] = [];
  selectedProjectId: number | null = null;

  dateRange = {
    start: null as Date | null,
    end: null as Date | null
  };

  kpis: any[] = [];
  chartView: [number, number] = [400, 250]; 
  constructor(
    private apiService: ApiService,
    private dialog: MatDialog
  ) { }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.updateChartView();
  }

  ngOnInit(): void {
    this.updateChartView();
    this.loadReport();
    this.loadProjects();
  }

  updateChartView(): void {
    const width = window.innerWidth;

    if (width < 640) { 
      this.chartView = [width - 48, 250]; 
    } else if (width < 768) { 
      this.chartView = [width * 0.9, 250];
    } else if (width < 1024) { 
      this.chartView = [350, 250];
    } else { 
      this.chartView = [400, 250];
    }
  }

  loadReport(payload: any = {}): void {
    this.isLoading = true;

    this.apiService.post<any>('general-report', payload).subscribe({
      next: res => {
        this.reportData = res.data;
        this.buildKpis();
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

  loadProjects(): void {
    this.apiService.get<any>('tickets-listprojects').subscribe({
      next: res => {
        this.projects = res;
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

  buildKpis(): void {
    const d = this.reportData;

    this.kpis = [
      { label: 'Total tickets', value: d.tickets_summary.total_tickets },
      { label: 'Abiertos', value: d.tickets_summary.tickets_open },
      { label: 'Cerrados', value: d.tickets_summary.tickets_resolved },
      { label: 'Con SLA', value: d.tickets_summary.tickets_with_sla },
      { label: 'Tiempo promedio de resolución', value: d.resolution_metrics.average_resolution_formatted },
      { label: 'Tiempo registrado promedio', value: `${Math.round(d.resolution_metrics.average_time_minutes)} min` },
      { label: 'Actualizaciones', value: d.updates_summary.total_updates },
      { label: 'Públicas', value: d.updates_summary.public_updates },
      { label: 'Privadas', value: d.updates_summary.private_updates },
      { label: 'Tiempo total', value: this.formatMinutes(d.time_metrics.total_history_time) }
    ];
  }

  getKpiIcon(label: string): string {
    const iconMap: { [key: string]: string } = {
      'Total tickets': 'receipt',
      'Abiertos': 'folder_open',
      'Cerrados': 'check_circle',
      'Con SLA': 'verified',
      'Tiempo promedio de resolución': 'schedule',
      'Promedio (min)': 'timer',
      'Actualizaciones': 'update',
      'Públicas': 'public',
      'Privadas': 'lock',
      'Tiempo total': 'access_time'
    };
    return iconMap[label] || 'assessment';
  }

  getKpiColorClass(label: string): string {
    const colorMap: { [key: string]: string } = {
      'Total tickets': 'bg-blue-100',
      'Abiertos': 'bg-yellow-100',
      'Cerrados': 'bg-green-100',
      'Con SLA': 'bg-purple-100',
      'Tiempo promedio de resolución': 'bg-orange-100',
      'Promedio (min)': 'bg-red-100',
      'Actualizaciones': 'bg-indigo-100',
      'Públicas': 'bg-teal-100',
      'Privadas': 'bg-gray-100',
      'Tiempo total': 'bg-cyan-100'
    };
    return colorMap[label] || 'bg-blue-100';
  }

  getKpiIconColorClass(label: string): string {
    const colorMap: { [key: string]: string } = {
      'Total tickets': 'text-blue-600',
      'Abiertos': 'text-yellow-600',
      'Cerrados': 'text-green-600',
      'Con SLA': 'text-purple-600',
      'Tiempo promedio de resolución': 'text-orange-600',
      'Promedio (min)': 'text-red-600',
      'Actualizaciones': 'text-indigo-600',
      'Públicas': 'text-teal-600',
      'Privadas': 'text-gray-600',
      'Tiempo total': 'text-cyan-600'
    };
    return colorMap[label] || 'text-blue-600';
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