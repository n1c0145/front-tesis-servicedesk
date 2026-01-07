import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ApiService } from '../../../services/api.service';
import { AlertDialogComponent } from '../../../layout/alert-dialog/alert-dialog.component';
import { LoadingComponent } from '../../../layout/loading/loading.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sla-reporting',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    LoadingComponent,
    MatDatepickerModule,
    MatNativeDateModule,
    MatExpansionModule,
    MatDividerModule,
    MatProgressBarModule,
    RouterModule,
    MatIconModule
  ],
  templateUrl: './sla-reporting.component.html'
})
export class SlaReportingComponent implements OnInit {
  isLoading = true;
  isLoadingReport = false;
  projects: any[] = [];
  selectedProjectId: number | null = null;
  reportData: any = null;

  dateRange = {
    start: null as Date | null,
    end: null as Date | null
  };

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.apiService.get<any>('tickets-listprojects').subscribe({
      next: (response) => {
        this.isLoading = false;
        this.projects = response;
      },
      error: (error) => {
        this.isLoading = false;
        this.dialog.open(AlertDialogComponent, {
          data: {
            icon: 'error',
            message: "Ha ocurrido un error, por favor inténtalo más tarde",
            showCancel: false,
            acceptText: 'Aceptar'
          }
        });
      }
    });
  }

  onProjectSelect(): void {
    if (this.selectedProjectId) {
      this.loadSlaReport(this.selectedProjectId);
    } else {
      this.dateRange = { start: null, end: null };
      this.reportData = null;
    }
  }

  loadSlaReport(projectId: number, dateFrom?: string, dateTo?: string): void {
    this.isLoadingReport = true;
    this.reportData = null;

    const requestData: any = {
      project_id: projectId
    };

    if (dateFrom && dateTo) {
      requestData.date_from = dateFrom;
      requestData.date_to = dateTo;
    }

    this.apiService.post<any>('sla-report', requestData).subscribe({
      next: (response) => {
        this.isLoadingReport = false;
        this.reportData = response.data;
      },
      error: (error) => {
        this.isLoadingReport = false;
        this.dialog.open(AlertDialogComponent, {
          data: {
            icon: 'error',
            message: "Ha ocurrido un error, por favor inténtalo más tarde",
            showCancel: false,
            acceptText: 'Aceptar'
          }
        });
      }
    });
  }

  applyDateFilters(): void {
    const hasStartDate = !!this.dateRange.start;
    const hasEndDate = !!this.dateRange.end;

    if (!(hasStartDate && hasEndDate)) {
      this.dialog.open(AlertDialogComponent, {
        data: {
          icon: 'info',
          message: "Se debe seleccionar 2 fechas válidas para aplicar el filtro por rango de fechas",
          showCancel: false,
          acceptText: 'Aceptar'
        }
      });
      return;
    }

    if (this.selectedProjectId) {
      const dateFrom = this.formatDate(this.dateRange.start as Date);
      const dateTo = this.formatDate(this.dateRange.end as Date);
      this.loadSlaReport(this.selectedProjectId, dateFrom, dateTo);
    }
  }

  clearDates(): void {
    this.dateRange = { start: null, end: null };
    if (this.selectedProjectId) {
      this.loadSlaReport(this.selectedProjectId);
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  hasRule(ruleName: string): boolean {
    return this.reportData?.report_parameters?.sla_rules?.[ruleName] != null;
  }

  hasMetric(metricName: string): boolean {
    const metric = this.reportData?.sla_metrics?.[metricName];
    if (!metric) return false;

    if (metricName === 'hours_bank') {
      return metric.total_hours_used != null ||
        metric.hours_contracted != null ||
        metric.hours_remaining != null ||
        metric.utilization_percentage != null ||
        metric.status != null;
    }

    let ruleName = '';
    switch (metricName) {
      case 'first_response':
        ruleName = 'firstresponse_minutes';
        break;
      case 'max_resolution':
        ruleName = 'maxresolution_days';
        break;
      case 'effective_time':
        ruleName = 'effectivetime_hours';
        break;
      case 'hours_bank':
        ruleName = 'hoursbank_hours';
        break;
    }

    if (!this.hasRule(ruleName)) {
      return false;
    }

    return metric.compliant != null ||
      metric.non_compliant != null ||
      metric.total_analyzed != null ||
      metric.compliance_percentage != null;
  }

  formatPercentage(value: number): string {
    return value != null ? `${value}%` : '0%';
  }


    getStatusText(status: string): string {
    switch (status) {
      case 'available': return 'Disponible';
      case 'warning': return 'Advertencia';
      case 'exceeded': return 'Excedido';
      default: return 'Desconocido';
    }
  }
}