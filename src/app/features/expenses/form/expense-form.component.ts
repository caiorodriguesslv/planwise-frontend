import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, catchError, of } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';

import { ExpenseService } from '../../../core/services/expense.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingService } from '../../../core/services/loading.service';
import { ExpenseRequest, ExpenseResponse, CategoryResponse } from '../../../core/models/expense.model';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatDividerModule
  ],
  template: `
    <div class="expense-form-container">
      <!-- Header -->
      <div class="header">
        <button mat-icon-button (click)="goBack()" class="back-button">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="header-content">
          <h1>
            <mat-icon>{{ isEditMode ? 'edit' : 'add' }}</mat-icon>
            {{ isEditMode ? 'Editar Despesa' : 'Nova Despesa' }}
          </h1>
          <p>{{ isEditMode ? 'Modifique os dados da despesa' : 'Adicione uma nova despesa ao seu controle' }}</p>
        </div>
      </div>

      <!-- Form Card -->
      <mat-card class="form-card">
        <form [formGroup]="expenseForm" (ngSubmit)="onSubmit()" class="expense-form">
          
          <!-- Step 1: Basic Information -->
          <div class="form-section">
            <div class="section-header">
              <mat-icon>description</mat-icon>
              <h3>Informações Básicas</h3>
            </div>
            
            <div class="form-grid">
              <!-- Description -->
              <mat-form-field class="full-width">
                <mat-label>Descrição da Despesa</mat-label>
                <input matInput 
                       formControlName="description"
                       placeholder="Ex: Compra no supermercado"
                       maxlength="100">
                <mat-hint align="end">
                  {{ expenseForm.get('description')?.value?.length || 0 }}/100
                </mat-hint>
                <mat-error *ngIf="expenseForm.get('description')?.hasError('required')">
                  Descrição é obrigatória
                </mat-error>
                <mat-error *ngIf="expenseForm.get('description')?.hasError('minlength')">
                  Descrição deve ter pelo menos 3 caracteres
                </mat-error>
                <mat-error *ngIf="expenseForm.get('description')?.hasError('maxlength')">
                  Descrição deve ter no máximo 100 caracteres
                </mat-error>
              </mat-form-field>

              <!-- Category -->
              <mat-form-field class="full-width">
                <mat-label>Categoria</mat-label>
                <mat-select formControlName="categoryId" placeholder="Selecione uma categoria">
                  <mat-option *ngFor="let category of categories" [value]="category.id">
                    {{ category.name }}
                    <span class="category-description" *ngIf="category.description">
                      - {{ category.description }}
                    </span>
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="expenseForm.get('categoryId')?.hasError('required')">
                  Categoria é obrigatória
                </mat-error>
              </mat-form-field>
            </div>
          </div>

          <mat-divider></mat-divider>

          <!-- Step 2: Financial Information -->
          <div class="form-section">
            <div class="section-header">
              <mat-icon>attach_money</mat-icon>
              <h3>Informações Financeiras</h3>
            </div>
            
            <div class="form-grid">
              <!-- Value -->
              <mat-form-field class="value-field">
                <mat-label>Valor</mat-label>
                <input matInput 
                       type="number"
                       formControlName="value"
                       placeholder="0,00"
                       step="0.01"
                       min="0.01">
                <span matTextPrefix>R$ </span>
                <mat-error *ngIf="expenseForm.get('value')?.hasError('required')">
                  Valor é obrigatório
                </mat-error>
                <mat-error *ngIf="expenseForm.get('value')?.hasError('min')">
                  Valor deve ser maior que zero
                </mat-error>
              </mat-form-field>

              <!-- Date -->
              <mat-form-field class="date-field">
                <mat-label>Data da Despesa</mat-label>
                <input matInput 
                       [matDatepicker]="picker"
                       formControlName="date"
                       [max]="maxDate">
                <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                <mat-error *ngIf="expenseForm.get('date')?.hasError('required')">
                  Data é obrigatória
                </mat-error>
                <mat-error *ngIf="expenseForm.get('date')?.hasError('matDatepickerMax')">
                  Data não pode ser futura
                </mat-error>
              </mat-form-field>
            </div>

            <!-- Value Preview -->
            <div class="value-preview" *ngIf="expenseForm.get('value')?.value">
              <div class="preview-label">Valor formatado:</div>
              <div class="preview-value">{{ formatCurrency(expenseForm.get('value')?.value) }}</div>
            </div>
          </div>

          <mat-divider></mat-divider>

          <!-- Form Summary -->
          <div class="form-section" *ngIf="isFormValid()">
            <div class="section-header">
              <mat-icon>summarize</mat-icon>
              <h3>Resumo</h3>
            </div>
            
            <div class="summary-card">
              <div class="summary-item">
                <span class="label">Descrição:</span>
                <span class="value">{{ expenseForm.get('description')?.value }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Categoria:</span>
                <span class="value">{{ getCategoryName(expenseForm.get('categoryId')?.value) }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Valor:</span>
                <span class="value expense-amount">{{ formatCurrency(expenseForm.get('value')?.value) }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Data:</span>
                <span class="value">{{ formatDate(expenseForm.get('date')?.value) }}</span>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button type="button" 
                    mat-button 
                    (click)="goBack()"
                    [disabled]="isSubmitting">
              Cancelar
            </button>
            
            <button type="button"
                    mat-button
                    (click)="resetForm()"
                    [disabled]="isSubmitting || !expenseForm.dirty">
              <mat-icon>refresh</mat-icon>
              Limpar
            </button>
            
            <button type="submit"
                    mat-raised-button
                    color="primary"
                    [disabled]="!expenseForm.valid || isSubmitting"
                    class="submit-button">
              <mat-spinner diameter="20" *ngIf="isSubmitting"></mat-spinner>
              <mat-icon *ngIf="!isSubmitting">{{ isEditMode ? 'save' : 'add' }}</mat-icon>
              {{ isSubmitting ? 'Salvando...' : (isEditMode ? 'Salvar Alterações' : 'Criar Despesa') }}
            </button>
          </div>
        </form>
      </mat-card>

      <!-- Loading Overlay -->
      <div class="loading-overlay" *ngIf="isLoading">
        <mat-spinner diameter="60"></mat-spinner>
        <p>{{ isEditMode ? 'Carregando despesa...' : 'Carregando dados...' }}</p>
      </div>
    </div>
  `,
  styles: [`
    .expense-form-container {
      padding: 32px;
      max-width: 800px;
      margin: 0 auto;
      position: relative;
    }

    .header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 32px;
      
      .back-button {
        margin-top: 8px;
        color: #64748b;
        
        &:hover {
          color: #1a202c;
          background: rgba(0, 0, 0, 0.04);
        }
      }
      
      .header-content {
        flex: 1;
        
        h1 {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 700;
          color: #1a202c;
          
          mat-icon {
            color: #ef4444;
            font-size: 32px;
          }
        }
        
        p {
          margin: 0;
          color: #64748b;
          font-size: 16px;
        }
      }
    }

    .form-card {
      border-radius: 12px !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
      border: 1px solid #e2e8f0 !important;
    }

    .expense-form {
      .form-section {
        padding: 24px 0;
        
        &:first-child {
          padding-top: 0;
        }
        
        &:last-child {
          padding-bottom: 0;
        }
        
        .section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          
          mat-icon {
            color: #ef4444;
            font-size: 24px;
          }
          
          h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: #1a202c;
          }
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          
          @media (min-width: 768px) {
            &:has(.value-field, .date-field) {
              grid-template-columns: 1fr 1fr;
            }
          }
        }
        
        .full-width {
          grid-column: 1 / -1;
          width: 100%;
        }
        
        .value-field,
        .date-field {
          width: 100%;
        }
      }
      
      .category-description {
        font-size: 12px;
        color: #64748b;
        font-style: italic;
      }
      
      .value-preview {
        margin-top: 16px;
        padding: 16px;
        background: #fef2f2;
        border: 1px solid #fecaca;
        border-radius: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .preview-label {
          font-size: 14px;
          color: #64748b;
        }
        
        .preview-value {
          font-size: 18px;
          font-weight: 600;
          color: #dc2626;
        }
      }
      
      .summary-card {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 20px;
        
        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #e2e8f0;
          
          &:last-child {
            border-bottom: none;
          }
          
          .label {
            font-weight: 500;
            color: #64748b;
          }
          
          .value {
            font-weight: 600;
            color: #1a202c;
            
            &.expense-amount {
              color: #dc2626;
              font-size: 18px;
            }
          }
        }
      }
      
      .form-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        padding-top: 32px;
        border-top: 1px solid #e2e8f0;
        margin-top: 32px;
        
        button {
          min-width: 120px;
          
          &.submit-button {
            background: linear-gradient(135deg, #ef4444, #dc2626) !important;
            color: white !important;
            font-weight: 600 !important;
            
            mat-icon {
              margin-right: 8px;
            }
            
            mat-spinner {
              margin-right: 8px;
            }
          }
        }
        
        @media (max-width: 768px) {
          flex-direction: column;
          
          button {
            width: 100%;
          }
        }
      }
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      
      mat-spinner {
        margin-bottom: 16px;
      }
      
      p {
        color: #64748b;
        font-weight: 500;
      }
    }

    // Form field customizations
    .mat-mdc-form-field {
      &.mat-focused .mat-mdc-form-field-label {
        color: #ef4444 !important;
      }
      
      &.mat-focused .mat-mdc-form-field-ripple {
        background-color: #ef4444 !important;
      }
    }

    .mat-mdc-select-panel {
      .mat-mdc-option.mdc-list-item--selected {
        background-color: rgba(239, 68, 68, 0.1) !important;
      }
    }

    // Responsive adjustments
    @media (max-width: 768px) {
      .expense-form-container {
        padding: 16px;
      }
      
      .header {
        .header-content h1 {
          font-size: 24px;
        }
      }
      
      .form-section .form-grid {
        grid-template-columns: 1fr !important;
      }
    }
  `]
})
export class ExpenseFormComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  // Form
  expenseForm: FormGroup;
  categories: CategoryResponse[] = [];
  
  // State
  isLoading = false;
  isSubmitting = false;
  isEditMode = false;
  expenseId: number | null = null;
  maxDate = new Date(); // Não permite datas futuras

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private notificationService: NotificationService,
    private loadingService: LoadingService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.expenseForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadCategories();
    this.checkEditMode();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      description: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]],
      value: ['', [
        Validators.required,
        Validators.min(0.01)
      ]],
      date: [new Date(), [
        Validators.required
      ]],
      categoryId: ['', [
        Validators.required
      ]]
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.expenseId = +id;
      this.loadExpense();
    }
  }

  private loadCategories(): void {
    this.expenseService.getExpenseCategories()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Erro ao carregar categorias:', error);
          this.notificationService.error('Erro ao carregar categorias');
          return of([]);
        })
      )
      .subscribe(categories => {
        this.categories = categories;
      });
  }

  private loadExpense(): void {
    if (!this.expenseId) return;

    this.isLoading = true;
    
    this.expenseService.getExpenseById(this.expenseId)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Erro ao carregar despesa:', error);
          this.notificationService.error('Erro ao carregar despesa');
          this.router.navigate(['/dashboard/expenses']);
          return of(null);
        })
      )
      .subscribe(expense => {
        this.isLoading = false;
        if (expense) {
          this.populateForm(expense);
        }
      });
  }

  private populateForm(expense: ExpenseResponse): void {
    this.expenseForm.patchValue({
      description: expense.description,
      value: expense.value,
      date: new Date(expense.date),
      categoryId: expense.category.id
    });
  }

  onSubmit(): void {
    if (this.expenseForm.valid) {
      this.isSubmitting = true;
      
      const expenseData: ExpenseRequest = {
        description: this.expenseForm.value.description,
        value: this.expenseForm.value.value,
        date: this.formatDateForApi(this.expenseForm.value.date),
        categoryId: this.expenseForm.value.categoryId
      };

      const operation = this.isEditMode && this.expenseId
        ? this.expenseService.updateExpense(this.expenseId, expenseData)
        : this.expenseService.createExpense(expenseData);

      operation
        .pipe(
          takeUntil(this.destroy$),
          catchError(error => {
            console.error('Erro ao salvar despesa:', error);
            this.notificationService.error('Erro ao salvar despesa');
            return of(null);
          })
        )
        .subscribe(result => {
          this.isSubmitting = false;
          if (result) {
            const message = this.isEditMode 
              ? 'Despesa atualizada com sucesso' 
              : 'Despesa criada com sucesso';
            this.notificationService.success(message);
            this.router.navigate(['/dashboard/expenses']);
          }
        });
    } else {
      this.markFormGroupTouched();
      this.notificationService.error('Por favor, corrija os erros no formulário');
    }
  }

  resetForm(): void {
    if (this.isEditMode && this.expenseId) {
      this.loadExpense();
    } else {
      this.expenseForm.reset();
      this.expenseForm.patchValue({
        date: new Date()
      });
    }
    this.notificationService.info('Formulário limpo');
  }

  goBack(): void {
    this.router.navigate(['/dashboard/expenses']);
  }

  isFormValid(): boolean {
    return this.expenseForm.valid;
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : '';
  }

  formatCurrency(value: number): string {
    if (!value) return 'R$ 0,00';
    return this.expenseService.formatCurrency(value);
  }

  formatDate(date: Date): string {
    if (!date) return '';
    return date.toLocaleDateString('pt-BR');
  }

  private formatDateForApi(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private markFormGroupTouched(): void {
    Object.keys(this.expenseForm.controls).forEach(key => {
      const control = this.expenseForm.get(key);
      control?.markAsTouched();
    });
  }
}
