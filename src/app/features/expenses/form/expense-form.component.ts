import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
      <!-- Header aprimorado -->
      <div class="page-header">
        <div class="header-left">
          <button mat-icon-button (click)="goBack()" class="back-button">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div class="header-content">
            <div class="title-section">
              <div class="title-icon">
                <mat-icon>{{ isEditMode ? 'edit' : 'add_circle' }}</mat-icon>
              </div>
              <div class="title-text">
                <h1>{{ isEditMode ? 'Editar Despesa' : 'Nova Despesa' }}</h1>
                <p>{{ isEditMode ? 'Modifique os dados da despesa' : 'Adicione uma nova despesa ao seu controle' }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="header-right">
          <div class="progress-indicator" *ngIf="!isEditMode">
            <span class="step active">1</span>
            <span class="step-label">Criar Despesa</span>
          </div>
        </div>
      </div>

      <!-- Form moderno -->
      <div class="form-wrapper">
        <mat-card class="form-card">
          <form [formGroup]="expenseForm" (ngSubmit)="onSubmit()" class="expense-form">
          
          <!-- Seção: Informações Básicas -->
          <div class="form-section basic-info">
            <div class="section-header">
              <div class="section-icon">
                <mat-icon>description</mat-icon>
              </div>
              <div class="section-content">
                <h3>Informações Básicas</h3>
                <p>Dados principais da despesa</p>
              </div>
            </div>
            
            <div class="section-body">
              <div class="field-group">
                <!-- Description -->
                <div class="field-wrapper full-width">
                  <mat-form-field appearance="outline" class="modern-field">
                    <mat-label>Descrição da Despesa</mat-label>
                    <input matInput 
                           formControlName="description"
                           placeholder="Ex: Compra no supermercado, Conta de luz..."
                           maxlength="100">
                    <mat-hint align="end">
                      {{ expenseForm.get('description')?.value?.length || 0 }}/100 caracteres
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
                </div>

                <!-- Category -->
                <div class="field-wrapper full-width">
                  <mat-form-field appearance="outline" class="modern-field">
                    <mat-label>Categoria</mat-label>
                    <mat-select formControlName="categoryId" placeholder="Selecione uma categoria">
                      <mat-option disabled value="">
                        <span class="placeholder-option">
                          <mat-icon>category</mat-icon>
                          Escolha uma categoria
                        </span>
                      </mat-option>
                      <mat-option *ngFor="let category of categories" [value]="category.id">
                        <span class="category-option">
                          <span class="category-color" [style.background-color]="category.color || '#ccc'"></span>
                          {{ category.name }}
                        </span>
                      </mat-option>
                    </mat-select>
                    <mat-error *ngIf="expenseForm.get('categoryId')?.hasError('required')">
                      Categoria é obrigatória
                    </mat-error>
                  </mat-form-field>
                </div>
              </div>
            </div>
          </div>

          <mat-divider></mat-divider>

          <!-- Seção: Informações Financeiras -->
          <div class="form-section financial-info">
            <div class="section-header">
              <div class="section-icon">
                <mat-icon>attach_money</mat-icon>
              </div>
              <div class="section-content">
                <h3>Informações Financeiras</h3>
                <p>Valor e data da despesa</p>
              </div>
            </div>
            
            <div class="section-body">
              <div class="field-group financial-grid">
                <!-- Value -->
                <div class="field-wrapper value-field">
                  <mat-form-field appearance="outline" class="modern-field value-input">
                    <mat-label>Valor da Despesa</mat-label>
                    <input matInput 
                           type="number"
                           formControlName="value"
                           placeholder="0,00"
                           step="0.01"
                           min="0.01">
                    <span matTextPrefix class="currency-prefix">R$ </span>
                    <mat-error *ngIf="expenseForm.get('value')?.hasError('required')">
                      Valor é obrigatório
                    </mat-error>
                    <mat-error *ngIf="expenseForm.get('value')?.hasError('min')">
                      Valor deve ser maior que zero
                    </mat-error>
                  </mat-form-field>
                  
                  <!-- Preview do valor -->
                  <div class="value-preview" *ngIf="expenseForm.get('value')?.value">
                    <div class="preview-chip">
                      <mat-icon>monetization_on</mat-icon>
                      <span>{{ formatCurrency(expenseForm.get('value')?.value) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Date -->
                <div class="field-wrapper date-field">
                  <mat-form-field appearance="outline" class="modern-field">
                    <mat-label>Data da Despesa</mat-label>
                    <input matInput 
                           [matDatepicker]="picker"
                           formControlName="date"
                           [max]="maxDate"
                           readonly>
                    <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                    <mat-datepicker #picker></mat-datepicker>
                    <mat-error *ngIf="expenseForm.get('date')?.hasError('required')">
                      Data é obrigatória
                    </mat-error>
                    <mat-error *ngIf="expenseForm.get('date')?.hasError('matDatepickerMax')">
                      Data não pode ser futura
                    </mat-error>
                  </mat-form-field>
                  
                  <!-- Preview da data -->
                  <div class="date-preview" *ngIf="expenseForm.get('date')?.value">
                    <div class="preview-chip">
                      <mat-icon>event</mat-icon>
                      <span>{{ formatDate(expenseForm.get('date')?.value) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <mat-divider></mat-divider>

          <!-- Resumo Final -->
          <div class="form-section summary-section" *ngIf="isFormValid()">
            <div class="section-header">
              <div class="section-icon">
                <mat-icon>summarize</mat-icon>
              </div>
              <div class="section-content">
                <h3>Resumo da Despesa</h3>
                <p>Revise os dados antes de salvar</p>
              </div>
            </div>
            
            <div class="section-body">
              <div class="summary-card">
                <div class="summary-grid">
                  <div class="summary-item">
                    <div class="item-icon">
                      <mat-icon>description</mat-icon>
                    </div>
                    <div class="item-content">
                      <span class="label">Descrição</span>
                      <span class="value">{{ expenseForm.get('description')?.value }}</span>
                    </div>
                  </div>
                  
                  <div class="summary-item">
                    <div class="item-icon">
                      <mat-icon>category</mat-icon>
                    </div>
                    <div class="item-content">
                      <span class="label">Categoria</span>
                      <span class="value">{{ getCategoryName(expenseForm.get('categoryId')?.value) || 'Não selecionada' }}</span>
                    </div>
                  </div>
                  
                  <div class="summary-item highlight">
                    <div class="item-icon">
                      <mat-icon>monetization_on</mat-icon>
                    </div>
                    <div class="item-content">
                      <span class="label">Valor</span>
                      <span class="value expense-amount">{{ formatCurrency(expenseForm.get('value')?.value) }}</span>
                    </div>
                  </div>
                  
                  <div class="summary-item">
                    <div class="item-icon">
                      <mat-icon>event</mat-icon>
                    </div>
                    <div class="item-content">
                      <span class="label">Data</span>
                      <span class="value">{{ formatDate(expenseForm.get('date')?.value) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions aprimoradas -->
          <div class="form-actions">
            <div class="action-buttons">
              <button type="button" 
                      mat-button 
                      (click)="goBack()"
                      [disabled]="isSubmitting"
                      class="cancel-btn">
                <mat-icon>close</mat-icon>
                Cancelar
              </button>
              
              <button type="button"
                      mat-stroked-button
                      (click)="resetForm()"
                      [disabled]="isSubmitting || !expenseForm.dirty"
                      class="reset-btn">
                <mat-icon>refresh</mat-icon>
                Limpar
              </button>
              
              <button type="submit"
                      mat-raised-button
                      [disabled]="!expenseForm.valid || isSubmitting"
                      class="submit-btn">
                <div class="btn-content">
                  <mat-spinner diameter="20" *ngIf="isSubmitting" class="btn-spinner"></mat-spinner>
                  <mat-icon *ngIf="!isSubmitting">{{ isEditMode ? 'save' : 'add_circle' }}</mat-icon>
                  <span>{{ isSubmitting ? 'Salvando...' : (isEditMode ? 'Salvar Alterações' : 'Criar Despesa') }}</span>
                </div>
              </button>
            </div>
          </div>
        </form>
        </mat-card>
      </div>

      <!-- Loading Overlay -->
      <div class="loading-overlay" *ngIf="isLoading">
        <mat-spinner diameter="60"></mat-spinner>
        <p>{{ isEditMode ? 'Carregando despesa...' : 'Carregando dados...' }}</p>
      </div>
    </div>
  `,
  styles: [`
    .expense-form-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
      min-height: 100vh;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      position: relative;
    }

    /* Header moderno */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding: 24px 32px;
      background: white;
      border-radius: 20px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
      
      .header-left {
        display: flex;
        align-items: center;
        flex: 1;
        
        .back-button {
          margin-right: 20px;
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
          color: #64748b;
          border-radius: 12px;
          transition: all 0.3s ease;
          
          &:hover {
            background: linear-gradient(135deg, #e2e8f0, #cbd5e1);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
          
          mat-icon {
            font-size: 24px;
          }
        }
        
        .header-content {
          flex: 1;
          
          .title-section {
            display: flex;
            align-items: center;
            gap: 16px;
            
            .title-icon {
              width: 60px;
              height: 60px;
              background: linear-gradient(135deg, #ef4444, #dc2626);
              border-radius: 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              
              mat-icon {
                font-size: 32px;
                color: white;
              }
            }
            
            .title-text {
              h1 {
                margin: 0 0 4px 0;
                font-size: 28px;
                font-weight: 700;
                color: #1a202c;
                line-height: 1.2;
              }
              
              p {
                margin: 0;
                color: #64748b;
                font-size: 15px;
                line-height: 1.4;
              }
            }
          }
        }
      }
      
      .header-right {
        .progress-indicator {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
          border-radius: 12px;
          border: 1px solid #7dd3fc;
          
          .step {
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, #0ea5e9, #0284c7);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 14px;
          }
          
          .step-label {
            color: #0369a1;
            font-weight: 600;
            font-size: 14px;
          }
        }
      }
    }

    /* Form wrapper */
    .form-wrapper {
      background: white;
      border-radius: 20px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }

    /* Form e seções */
    .form-card {
      background: transparent;
      border: none;
      box-shadow: none;
      
      .expense-form {
        padding: 32px;
      }
    }

    .form-section {
      margin-bottom: 32px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
      border: 1px solid #f1f5f9;
      overflow: hidden;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      &.basic-info {
        border-left: 4px solid #3b82f6;
      }
      
      &.financial-info {
        border-left: 4px solid #10b981;
      }
      
      &.summary-section {
        border-left: 4px solid #f59e0b;
        background: linear-gradient(135deg, #fffbeb, #fef3c7);
      }
      
      .section-header {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 24px 32px 0;
        margin-bottom: 24px;
        
        .section-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          
          mat-icon {
            font-size: 24px;
            color: #64748b;
          }
        }
        
        .section-content {
          flex: 1;
          
          h3 {
            margin: 0 0 4px 0;
            font-size: 18px;
            font-weight: 600;
            color: #1a202c;
          }
          
          p {
            margin: 0;
            font-size: 13px;
            color: #64748b;
          }
        }
      }
      
      .section-body {
        padding: 0 32px 32px;
        
        .field-group {
          display: grid;
          gap: 24px;
          
          &.financial-grid {
            grid-template-columns: 1fr 1fr;
            gap: 32px;
          }
          
          .field-wrapper {
            &.full-width {
              grid-column: 1 / -1;
            }
            
            .modern-field {
              width: 100%;
            }
            
            .preview-chip {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              margin-top: 8px;
              padding: 8px 16px;
              background: linear-gradient(135deg, #f0fdf4, #dcfce7);
              border: 1px solid #bbf7d0;
              border-radius: 8px;
              color: #166534;
              font-size: 13px;
              font-weight: 500;
              
              mat-icon {
                font-size: 18px;
              }
            }
          }
        }
      }
    }

    /* Estilos para categorias */
    .placeholder-option, .category-option {
      display: flex !important;
      align-items: center;
      gap: 8px;
      
      .category-color {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      
      small {
        color: #64748b;
        font-size: 11px;
        margin-left: 4px;
      }
    }

    /* Summary grid */
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      
      .summary-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background: white;
        border-radius: 12px;
        border: 1px solid #f1f5f9;
        transition: all 0.2s ease;
        
        &:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        
        &.highlight {
          background: linear-gradient(135deg, #fef2f2, #fee2e2);
          border-color: #fecaca;
          
          .expense-amount {
            color: #dc2626;
            font-weight: 700;
          }
        }
        
        .item-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          
          mat-icon {
            font-size: 20px;
            color: #64748b;
          }
        }
        
        .item-content {
          flex: 1;
          
          .label {
            display: block;
            font-size: 12px;
            color: #64748b;
            margin-bottom: 2px;
            text-transform: uppercase;
            font-weight: 500;
            letter-spacing: 0.5px;
          }
          
          .value {
            display: block;
            font-size: 14px;
            color: #1a202c;
            font-weight: 600;
          }
        }
      }
    }

    /* Actions */
    .form-actions {
      padding: 32px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      
      .action-buttons {
        display: flex;
        gap: 16px;
        justify-content: flex-end;
        align-items: center;
        
        .cancel-btn {
          color: #64748b;
          
          mat-icon {
            margin-right: 8px;
          }
          
          &:hover {
            color: #1a202c;
            background: rgba(0, 0, 0, 0.04);
          }
        }
        
        .reset-btn {
          color: #0ea5e9;
          border-color: #0ea5e9;
          
          mat-icon {
            margin-right: 8px;
          }
          
          &:hover {
            background: rgba(14, 165, 233, 0.04);
          }
        }
        
        .submit-btn {
          background: linear-gradient(135deg, #ef4444, #dc2626) !important;
          color: white !important;
          padding: 12px 32px;
          font-weight: 600;
          border-radius: 12px;
          min-width: 160px;
          
          .btn-content {
            display: flex;
            align-items: center;
            gap: 8px;
            
            .btn-spinner {
              width: 20px;
              height: 20px;
            }
            
            mat-icon {
              font-size: 20px;
            }
          }
          
          &:hover {
            background: linear-gradient(135deg, #dc2626, #b91c1c) !important;
            transform: translateY(-1px);
            box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
          }
          
          &:disabled {
            opacity: 0.6;
            transform: none !important;
            box-shadow: none !important;
          }
        }
      }
    }

    /* Customização do Material Design */
    ::ng-deep .mat-mdc-form-field {
      &.modern-field {
        .mat-mdc-form-field-outline {
          border-radius: 12px !important;
        }
        
        &.mat-focused {
          .mat-mdc-form-field-outline-thick {
            border-color: #ef4444 !important;
          }
          
          .mat-mdc-form-field-label {
            color: #ef4444 !important;
          }
        }
        
        .mat-mdc-form-field-label {
          font-weight: 500;
        }
        
        .mat-mdc-input-element {
          font-size: 14px;
        }
        
        &.value-input {
          .currency-prefix {
            color: #10b981;
            font-weight: 600;
            font-size: 16px;
          }
        }
      }
    }

    /* Loading overlay */
    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.95);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      border-radius: 20px;
      
      mat-spinner {
        margin-bottom: 16px;
      }
      
      p {
        color: #64748b;
        font-weight: 500;
        margin: 0;
      }
    }

    /* Responsividade */
    @media (max-width: 768px) {
      .expense-form-container {
        padding: 16px;
      }
      
      .page-header {
        padding: 20px;
        flex-direction: column;
        text-align: center;
        gap: 16px;
        
        .header-left {
          justify-content: center;
          
          .back-button {
            position: absolute;
            top: 20px;
            left: 20px;
            margin: 0;
          }
          
          .header-content .title-section {
            flex-direction: column;
            text-align: center;
            gap: 12px;
          }
        }
        
        .header-right {
          order: -1;
        }
      }
      
      .form-section {
        .section-header {
          padding: 20px 24px 0;
          
          .section-icon {
            width: 40px;
            height: 40px;
          }
        }
        
        .section-body {
          padding: 0 24px 24px;
          
          .field-group.financial-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }
      }
      
      .summary-grid {
        grid-template-columns: 1fr;
      }
      
      .form-actions {
        padding: 24px;
        
        .action-buttons {
          flex-direction: column;
          
          .submit-btn {
            order: -1;
            width: 100%;
          }
        }
      }
    }

    @media (max-width: 480px) {
      .page-header .header-left .header-content .title-section .title-text h1 {
        font-size: 24px;
      }
      
      .form-section .section-header {
        flex-direction: column;
        text-align: center;
        gap: 12px;
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
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
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
          this.notificationService.error('Erro ao carregar categorias');
          return of([]);
        })
      )
      .subscribe(categories => {
        this.categories = categories;
        this.cdr.detectChanges();
      });
  }

  private loadExpense(): void {
    if (!this.expenseId) return;

    this.isLoading = true;
    
    this.expenseService.getExpenseById(this.expenseId)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
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
            this.notificationService.error('Erro ao salvar despesa');
            this.isSubmitting = false; // ← Garantir que pare o loading em caso de erro
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
            // Voltar para a lista de despesas
            this.goBack();
          } else {
            // Se result for null, significa que houve erro e já foi tratado no catchError
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
    // Como estamos no dashboard, vamos emitir evento para voltar à lista
    window.dispatchEvent(new CustomEvent('navigate-to-module', { 
      detail: { module: 'despesas' } 
    }));
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
