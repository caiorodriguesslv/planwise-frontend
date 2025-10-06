import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { CategoryResponse, CategoryType } from '../../../core/models/category.model';

@Component({
  selector: 'app-category-success-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './category-success-modal.component.html',
  styleUrls: ['./category-success-modal.component.scss']
})
export class CategorySuccessModalComponent {
  constructor(
    public dialogRef: MatDialogRef<CategorySuccessModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { category: CategoryResponse }
  ) {}

  getTypeIcon(): string {
    return this.data.category.type === CategoryType.RECEITA ? 'trending_up' : 'trending_down';
  }

  getTypeLabel(): string {
    return this.data.category.type === CategoryType.RECEITA ? 'Receita' : 'Despesa';
  }

  getCategoryColor(): string {
    // Gerar cor baseada no tipo
    if (this.data.category.type === CategoryType.RECEITA) {
      return '#4caf50'; // Verde para receita
    } else {
      return '#f44336'; // Vermelho para despesa
    }
  }

  continue(): void {
    this.dialogRef.close('continue');
  }

  viewList(): void {
    this.dialogRef.close('view');
  }
}