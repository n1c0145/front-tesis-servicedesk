import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { LoadingComponent } from '../../../layout/loading/loading.component';

@Component({
  selector: 'app-update-ticket',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    LoadingComponent
  ],
  templateUrl: './update-ticket.component.html',
  styleUrl: './update-ticket.component.scss'
})
export class UpdateTicketComponent {
  isLoading = false;

  constructor(
    public dialogRef: MatDialogRef<UpdateTicketComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log('Datos recibidos en el modal:', this.data);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    alert("save work")
  }
}
