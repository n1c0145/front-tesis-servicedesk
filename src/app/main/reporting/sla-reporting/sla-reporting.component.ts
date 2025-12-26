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
    MatExpansionModule
  ],
  templateUrl: './sla-reporting.component.html'
})
export class SlaReportingComponent implements OnInit {
  isLoading = true;
  isLoadingReport = false;
  projects: any[] = [];
  selectedProjectId: number | null = null;

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
    }
  }

  loadSlaReport(projectId: number, dateFrom?: string, dateTo?: string): void {
    this.isLoadingReport = true;

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
}