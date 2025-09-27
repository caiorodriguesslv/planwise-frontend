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
  template: `
    <div class="success-modal">
      <div class="modal-header">
        <div class="success-icon">
          <mat-icon>check_circle</mat-icon>
        </div>
        <h2>Categoria Criada com Sucesso!</h2>
        <p>Sua categoria foi salva no sistema</p>
      </div>

      <div class="modal-content">
        <mat-card class="category-card">
          <div class="category-info">
            <div class="category-name">
              <mat-icon>label</mat-icon>
              <span>{{ data.category.name }}</span>
            </div>
            <div class="category-type">
              <mat-icon>{{ getTypeIcon() }}</mat-icon>
              <span>{{ getTypeLabel() }}</span>
            </div>
            <div class="category-color">
              <div class="color-preview" [style.background-color]="getCategoryColor()"></div>
              <span>{{ getCategoryColor() }}</span>
            </div>
          </div>
        </mat-card>
      </div>

      <div class="modal-actions">
        <button mat-stroked-button 
                (click)="continue()" 
                class="continue-btn">
          <mat-icon>add</mat-icon>
          Criar Outra
        </button>
        
        <button mat-raised-button 
                (click)="viewList()" 
                class="view-btn">
          <mat-icon>list</mat-icon>
          Ver Lista
        </button>
      </div>
    </div>
  `,
  styles: [`
    .success-modal {
      padding: 24px;
      text-align: center;
    }

    .modal-header {
      margin-bottom: 24px;
    }

    .success-icon {
      margin-bottom: 16px;
    }

    .success-icon mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #4caf50;
    }

    .modal-header h2 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 24px;
      font-weight: 600;
    }

    .modal-header p {
      margin: 0;
      color: #666;
      font-size: 16px;
    }

    .modal-content {
      margin-bottom: 24px;
    }

    .category-card {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .category-info {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .category-name,
    .category-type,
    .category-color {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 12px;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 8px;
      font-weight: 500;
    }

    .category-name mat-icon {
      color: #2196f3;
    }

    .category-type mat-icon {
      color: #ff9800;
    }

    .color-preview {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid #fff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .modal-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
    }

    .continue-btn {
      background: #f5f5f5;
      color: #333;
      border: 1px solid #ddd;
    }

    .continue-btn:hover {
      background: #e0e0e0;
    }

    .view-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .view-btn:hover {
      background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
    }

    @media (max-width: 480px) {
      .modal-actions {
        flex-direction: column;
      }
      
      .modal-actions button {
        width: 100%;
      }
    }
  `]
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
