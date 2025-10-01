import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

import { ExpenseService } from '../../../core/services/expense.service';
import { CategoryService } from '../../../core/services/category.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingService } from '../../../core/services/loading.service';
import { ExpenseRequest } from '../../../core/models/expense.model';
import { CategoryResponse } from '../../../core/models/category.model';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  styleUrls: ['./expense-form.component.scss'],
  template: `
    <div class="expense-form-container planwise-bg-primary">
      <!-- Header aprimorado -->
      <div class="page-header planwise-bg-card">
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
                <h1 class="planwise-text-primary">{{ isEditMode ? 'Editar Despesa' : 'Nova Despesa' }}</h1>
                <p class="planwise-text-muted">{{ isEditMode ? 'Modifique os dados da despesa' : 'Adicione uma nova despesa ao seu controle' }}</p>
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
        <form [formGroup]="expenseForm" (ngSubmit)="onSubmit()" class="expense-form">
        
        <!-- Seção: Informações Básicas -->
        <div class="form-section basic-info planwise-bg-card">
          <div class="section-header">
            <div class="section-icon planwise-icon-cyan">
              <mat-icon>description</mat-icon>
            </div>
            <div class="section-content">
              <h3 class="planwise-text-primary">Informações Básicas</h3>
              <p class="planwise-text-muted">Dados principais da despesa</p>
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
        <div class="form-section financial-info planwise-bg-card">
          <div class="section-header">
            <div class="section-icon planwise-icon-orange">
              <mat-icon>attach_money</mat-icon>
            </div>
            <div class="section-content">
              <h3 class="planwise-text-primary">Informações Financeiras</h3>
              <p class="planwise-text-muted">Valor e data da despesa</p>
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
        <div class="form-section summary-section planwise-card" *ngIf="isFormValid()">
          <div class="section-header">
            <div class="section-icon planwise-icon-purple">
              <mat-icon>summarize</mat-icon>
            </div>
            <div class="section-content">
              <h3 class="planwise-text-primary">Resumo da Despesa</h3>
              <p class="planwise-text-muted">Revise os dados antes de salvar</p>
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
                    <span class="value">{{ getCategoryName(+expenseForm.get('categoryId')?.value) }}</span>
                  </div>
                </div>
                
                <div class="summary-item">
                  <div class="item-icon">
                    <mat-icon>attach_money</mat-icon>
                  </div>
                  <div class="item-content">
                    <span class="label">Valor</span>
                    <span class="value">{{ formatCurrency(expenseForm.get('value')?.value) }}</span>
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

        <!-- Ações do formulário -->
        <div class="form-actions">
          <div class="action-buttons">
            <button type="button"
                    mat-stroked-button
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
      </div>

      <!-- Loading Overlay -->
      <div class="loading-overlay" *ngIf="isLoading">
        <mat-spinner diameter="60"></mat-spinner>
        <p>{{ isEditMode ? 'Carregando despesa...' : 'Carregando dados...' }}</p>
      </div>
    </div>
  `,
  styles: []
})
export class ExpenseFormComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  expenseForm!: FormGroup;
  categories: CategoryResponse[] = [];
  isLoading = false;
  isSubmitting = false;
  isEditMode = false;
  expenseId: number | null = null;
  maxDate = new Date();

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private categoryService: CategoryService,
    private notificationService: NotificationService,
    private loadingService: LoadingService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadCategories();
    this.checkEditMode();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.expenseForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      categoryId: ['', Validators.required],
      value: ['', [Validators.required, Validators.min(0.01)]],
      date: ['', Validators.required]
    });
  }

  private loadCategories(): void {
    this.categoryService.getAllCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.categories = categories;
        },
        error: (error) => {
          console.error('Erro ao carregar categorias:', error);
          this.notificationService.error('Erro ao carregar categorias');
        }
      });
  }

  private checkEditMode(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.expenseId = +params['id']; // Convert string to number
        this.loadExpense();
      }
    });
  }

  private loadExpense(): void {
    if (!this.expenseId) return;

    this.isLoading = true;
    this.expenseService.getExpenseById(this.expenseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (expense) => {
          this.expenseForm.patchValue({
            description: expense.description,
            categoryId: expense.category.id,
            value: expense.value,
            date: new Date(expense.date)
          });
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar despesa:', error);
          this.notificationService.error('Erro ao carregar despesa');
          this.isLoading = false;
        }
      });
  }

  onSubmit(): void {
    if (this.expenseForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.loadingService.show();

      const formValue = this.expenseForm.value;
      const expenseData: ExpenseRequest = {
        description: formValue.description,
        categoryId: formValue.categoryId,
        value: formValue.value,
        date: formValue.date.toISOString()
      };

      const operation = this.isEditMode 
        ? this.expenseService.updateExpense(this.expenseId!, expenseData)
        : this.expenseService.createExpense(expenseData);

      operation.pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          this.loadingService.hide();
          this.isSubmitting = false;
          
          const message = this.isEditMode 
            ? 'Despesa atualizada com sucesso!' 
            : 'Despesa criada com sucesso!';
          
          this.notificationService.success(message);
          this.router.navigate(['/dashboard/expenses']);
        },
        error: (error) => {
          this.loadingService.hide();
          this.isSubmitting = false;
          console.error('Erro ao salvar despesa:', error);
          this.notificationService.error('Erro ao salvar despesa');
        }
      });
    }
  }

  resetForm(): void {
    this.expenseForm.reset();
  }

  goBack(): void {
    this.router.navigate(['/dashboard/expenses']);
  }

  isFormValid(): boolean {
    return this.expenseForm.valid;
  }

  formatCurrency(value: number): string {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDate(date: Date): string {
    if (!date) return '';
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'Categoria não encontrada';
  }
}
