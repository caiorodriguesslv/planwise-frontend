import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { ExpenseResponse } from '../../../core/models/expense.model';

@Component({
  selector: 'app-expense-success-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './expense-success-modal.component.html',
  styleUrls: ['./expense-success-modal.component.scss']
})
export class ExpenseSuccessModalComponent {
  constructor(
    public dialogRef: MatDialogRef<ExpenseSuccessModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { expense: ExpenseResponse }
  ) {}

  continue(): void {
    this.dialogRef.close('continue');
  }

  viewList(): void {
    this.dialogRef.close('view');
  }
}