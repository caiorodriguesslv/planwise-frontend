import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, catchError, of } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

// Services e Models
import { CategoryService } from '../../../core/services/category.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CategoryRequest, CategoryResponse, CategoryType } from '../../../core/models/category.model';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule
  ],
  template: `
    <div class="category-form-container">
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
                <h1>{{ isEditMode ? 'Editar Categoria' : 'Nova Categoria' }}</h1>
                <p>{{ isEditMode ? 'Modifique os dados da categoria' : 'Crie uma nova categoria para organizar suas transações' }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="header-right">
          <div class="progress-indicator" *ngIf="!isEditMode">
            <span class="step active">1</span>
            <span class="step-label">Criar Categoria</span>
          </div>
        </div>
      </div>

      <!-- Form moderno -->
      <div class="form-wrapper">
        <mat-card class="form-card">
          <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()" class="category-form">
          
            <!-- Seção: Informações Básicas -->
            <div class="form-section basic-info">
              <div class="section-header">
                <div class="section-icon">
                  <mat-icon>info</mat-icon>
                </div>
                <div class="section-content">
                  <h3>Informações Básicas</h3>
                  <p>Dados principais da categoria</p>
                </div>
              </div>
              
              <div class="section-body">
                <div class="field-group">
                  <!-- Nome -->
                  <div class="field-wrapper full-width">
                    <mat-form-field appearance="outline" class="modern-field">
                      <mat-label>Nome da Categoria</mat-label>
                      <input matInput 
                             formControlName="name"
                             placeholder="Ex: Alimentação, Transporte, Salário..."
                             maxlength="50">
                      <mat-hint align="end">
                        {{ categoryForm.get('name')?.value?.length || 0 }}/50 caracteres
                      </mat-hint>
                      <mat-error *ngIf="categoryForm.get('name')?.hasError('required')">
                        Nome é obrigatório
                      </mat-error>
                      <mat-error *ngIf="categoryForm.get('name')?.hasError('minlength')">
                        Nome deve ter pelo menos 2 caracteres
                      </mat-error>
                      <mat-error *ngIf="categoryForm.get('name')?.hasError('maxlength')">
                        Nome deve ter no máximo 50 caracteres
                      </mat-error>
                    </mat-form-field>
                  </div>
                </div>
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- Seção: Configurações -->
            <div class="form-section config-info">
              <div class="section-header">
                <div class="section-icon">
                  <mat-icon>settings</mat-icon>
                </div>
                <div class="section-content">
                  <h3>Configurações</h3>
                  <p>Tipo e personalização da categoria</p>
                </div>
              </div>
              
              <div class="section-body">
                <div class="field-group">
                  <!-- Tipo -->
                  <div class="field-wrapper type-field">
                    <mat-form-field appearance="outline" class="modern-field">
                      <mat-label>Tipo</mat-label>
                      <mat-select formControlName="type" placeholder="Selecione o tipo">
                        <mat-option disabled value="">
                          <span class="placeholder-option">
                            <mat-icon>category</mat-icon>
                            Escolha um tipo
                          </span>
                        </mat-option>
                        <mat-option value="RECEITA">
                          <span class="type-option receita">
                            <mat-icon>trending_up</mat-icon>
                            Receita
                            <small>Para dinheiro que entra</small>
                          </span>
                        </mat-option>
                        <mat-option value="DESPESA">
                          <span class="type-option despesa">
                            <mat-icon>trending_down</mat-icon>
                            Despesa
                            <small>Para dinheiro que sai</small>
                          </span>
                        </mat-option>
                      </mat-select>
                      <mat-error *ngIf="categoryForm.get('type')?.hasError('required')">
                        Tipo é obrigatório
                      </mat-error>
                    </mat-form-field>
                  </div>

                  <!-- Cor (Preview) -->
                  <div class="field-wrapper color-field">
                    <div class="color-preview" *ngIf="categoryForm.get('type')?.value">
                      <div class="color-label">Cor da categoria:</div>
                      <div class="color-sample" [style.background-color]="getPreviewColor()">
                        <mat-icon>palette</mat-icon>
                      </div>
                      <div class="color-info">
                        <span>Cor gerada automaticamente</span>
                        <small>Baseada no tipo selecionado</small>
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
                  <h3>Resumo da Categoria</h3>
                  <p>Revise os dados antes de salvar</p>
                </div>
              </div>
              
              <div class="section-body">
                <div class="summary-card">
                  <div class="summary-grid">
                    <div class="summary-item">
                      <div class="item-icon">
                        <mat-icon>label</mat-icon>
                      </div>
                      <div class="item-content">
                        <span class="label">Nome</span>
                        <span class="value">{{ categoryForm.get('name')?.value }}</span>
                      </div>
                    </div>
                    
                    <div class="summary-item highlight">
                      <div class="item-icon">
                        <mat-icon>{{ getTypeIcon() }}</mat-icon>
                      </div>
                      <div class="item-content">
                        <span class="label">Tipo</span>
                        <span class="value category-type">{{ getTypeLabel() }}</span>
                      </div>
                    </div>
                    
                    <div class="summary-item">
                      <div class="item-icon" [style.background-color]="getPreviewColor()">
                        <mat-icon>palette</mat-icon>
                      </div>
                      <div class="item-content">
                        <span class="label">Cor</span>
                        <span class="value">{{ getPreviewColor() }}</span>
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
                        [disabled]="isSubmitting || !categoryForm.dirty"
                        class="reset-btn">
                  <mat-icon>refresh</mat-icon>
                  Limpar
                </button>
                
                <button type="submit"
                        mat-raised-button
                        [disabled]="!categoryForm.valid || isSubmitting"
                        class="submit-btn">
                  <div class="btn-content">
                    <mat-spinner diameter="20" *ngIf="isSubmitting" class="btn-spinner"></mat-spinner>
                    <mat-icon *ngIf="!isSubmitting">{{ isEditMode ? 'save' : 'add_circle' }}</mat-icon>
                    <span>{{ isSubmitting ? 'Salvando...' : (isEditMode ? 'Salvar Alterações' : 'Criar Categoria') }}</span>
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
        <p>{{ isEditMode ? 'Carregando categoria...' : 'Carregando dados...' }}</p>
      </div>
    </div>
  `,
  styles: [`
    .category-form-container {
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
              background: linear-gradient(135deg, #8b5cf6, #7c3aed);
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
      
      .category-form {
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
      
      &.config-info {
        border-left: 4px solid #8b5cf6;
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
          
          .field-wrapper {
            &.full-width {
              grid-column: 1 / -1;
            }
            
            .modern-field {
              width: 100%;
            }
          }
        }
      }
    }

    /* Estilos para tipos */
    .placeholder-option, .type-option {
      display: flex !important;
      align-items: center;
      gap: 8px;
      flex-direction: column;
      padding: 8px 0;
      
      &.receita {
        mat-icon {
          color: #10b981;
        }
      }
      
      &.despesa {
        mat-icon {
          color: #ef4444;
        }
      }
      
      small {
        color: #64748b;
        font-size: 11px;
        margin-top: 2px;
      }
    }

    /* Color Preview */
    .color-preview {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: #f8fafc;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      
      .color-label {
        font-size: 14px;
        font-weight: 500;
        color: #374151;
      }
      
      .color-sample {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        
        mat-icon {
          color: white;
          font-size: 20px;
        }
      }
      
      .color-info {
        flex: 1;
        
        span {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #1a202c;
        }
        
        small {
          display: block;
          font-size: 12px;
          color: #64748b;
          margin-top: 2px;
        }
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
          background: linear-gradient(135deg, #f3e8ff, #e9d5ff);
          border-color: #c4b5fd;
          
          .category-type {
            color: #7c3aed;
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
          background: linear-gradient(135deg, #8b5cf6, #7c3aed) !important;
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
            background: linear-gradient(135deg, #7c3aed, #6d28d9) !important;
            transform: translateY(-1px);
            box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3);
          }
          
          &:disabled {
            opacity: 0.6;
            transform: none !important;
            box-shadow: none !important;
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

    /* Customização do Material Design */
    ::ng-deep .mat-mdc-form-field {
      &.modern-field {
        .mat-mdc-form-field-outline {
          border-radius: 12px !important;
        }
        
        &.mat-focused {
          .mat-mdc-form-field-outline-thick {
            border-color: #8b5cf6 !important;
          }
          
          .mat-mdc-form-field-label {
            color: #8b5cf6 !important;
          }
        }
        
        .mat-mdc-form-field-label {
          font-weight: 500;
        }
        
        .mat-mdc-input-element {
          font-size: 14px;
        }
      }
    }

    /* Responsividade */
    @media (max-width: 768px) {
      .category-form-container {
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
export class CategoryFormComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  // Form
  categoryForm: FormGroup;
  
  // State
  isLoading = false;
  isSubmitting = false;
  isEditMode = false;
  categoryId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private notificationService: NotificationService
  ) {
    this.categoryForm = this.createForm();
  }

  ngOnInit(): void {
    // Implementar lógica de edição futuramente
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      type: ['', [
        Validators.required
      ]]
    });
  }

  onSubmit(): void {
    if (this.categoryForm.valid) {
      this.isSubmitting = true;
      
      const categoryData: CategoryRequest = {
        name: this.categoryForm.value.name,
        type: this.categoryForm.value.type as CategoryType
      };

      this.categoryService.createCategory(categoryData)
        .pipe(
          takeUntil(this.destroy$),
          catchError(error => {
            console.error('Erro ao salvar categoria:', error);
            this.notificationService.error('Erro ao salvar categoria');
            return of(null);
          })
        )
        .subscribe(result => {
          this.isSubmitting = false;
          if (result) {
            this.notificationService.success('Categoria criada com sucesso');
            this.goBack();
          }
        });
    } else {
      this.markFormGroupTouched();
      this.notificationService.error('Por favor, corrija os erros no formulário');
    }
  }

  resetForm(): void {
    this.categoryForm.reset();
    this.notificationService.info('Formulário limpo');
  }

  goBack(): void {
    // Emitir evento para voltar à lista
    window.dispatchEvent(new CustomEvent('navigate-to-module', { 
      detail: { module: 'categorias' } 
    }));
  }

  isFormValid(): boolean {
    return this.categoryForm.valid;
  }

  getPreviewColor(): string {
    const type = this.categoryForm.get('type')?.value as CategoryType;
    if (type) {
      return this.categoryService.generateCategoryColor(type);
    }
    return '#6b7280';
  }

  getTypeIcon(): string {
    const type = this.categoryForm.get('type')?.value;
    return type === 'RECEITA' ? 'trending_up' : 'trending_down';
  }

  getTypeLabel(): string {
    const type = this.categoryForm.get('type')?.value;
    return type === 'RECEITA' ? 'Receita' : 'Despesa';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.categoryForm.controls).forEach(key => {
      const control = this.categoryForm.get(key);
      control?.markAsTouched();
    });
  }
}
