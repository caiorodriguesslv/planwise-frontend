import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

// Services e Models
import { CategoryService } from '../../../core/services/category.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CategoryRequest, CategoryResponse, CategoryType } from '../../../core/models/category.model';
import { CategorySuccessModalComponent } from '../modal/category-success-modal.component';

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
    MatChipsModule,
    MatDialogModule
  ],
  styleUrls: ['./category-form.component.scss'],
  template: `
    <div class="category-form-container planwise-bg-primary">
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
                <h1 class="planwise-text-primary">{{ isEditMode ? 'Editar Categoria' : 'Nova Categoria' }}</h1>
                <p class="planwise-text-muted">{{ isEditMode ? 'Modifique os dados da categoria' : 'Adicione uma nova categoria ao seu controle' }}</p>
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
        <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()" class="category-form">
        
        <!-- Seção: Informações Básicas -->
        <div class="form-section basic-info planwise-bg-card">
          <div class="section-header">
            <div class="section-icon planwise-icon-cyan">
              <mat-icon>edit_note</mat-icon>
            </div>
            <div class="section-content">
              <h3 class="planwise-text-primary">Informações Básicas</h3>
              <p class="planwise-text-muted">Dados principais da categoria</p>
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
        <div class="form-section config-info planwise-bg-card">
          <div class="section-header">
            <div class="section-icon planwise-icon-orange">
              <mat-icon>tune</mat-icon>
            </div>
            <div class="section-content">
              <h3 class="planwise-text-primary">Configurações</h3>
              <p class="planwise-text-muted">Tipo e personalização da categoria</p>
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
                    🔧 Escolha um tipo
                  </mat-option>
                  <mat-option value="RECEITA">
                    💰 Receita - Para dinheiro que entra
                  </mat-option>
                  <mat-option value="DESPESA">
                    🛒 Despesa - Para dinheiro que sai
                  </mat-option>
                  </mat-select>
                  <mat-error *ngIf="categoryForm.get('type')?.hasError('required')">
                    Tipo é obrigatório
                  </mat-error>
                </mat-form-field>
              </div>

            </div>
          </div>
        </div>

        <mat-divider></mat-divider>

        <!-- Resumo Final -->
        <div class="form-section summary-section planwise-bg-card" *ngIf="isFormValid()">
          <div class="section-header">
            <div class="section-icon planwise-icon-purple">
              <mat-icon>summarize</mat-icon>
            </div>
            <div class="section-content">
              <h3 class="planwise-text-primary">Resumo da Categoria</h3>
              <p class="planwise-text-muted">Revise os dados antes de salvar</p>
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
                
                <div class="summary-item">
                  <div class="item-icon" [class.receita-icon]="getTypeLabel() === 'Receita'" [class.despesa-icon]="getTypeLabel() === 'Despesa'">
                    <mat-icon>{{ getTypeIcon() }}</mat-icon>
                  </div>
                  <div class="item-content">
                    <span class="label">Tipo</span>
                    <span class="value">{{ getTypeLabel() }}</span>
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
      </div>

      <!-- Loading Overlay -->
      <div class="loading-overlay" *ngIf="isLoading">
        <mat-spinner diameter="60"></mat-spinner>
        <p>{{ isEditMode ? 'Carregando categoria...' : 'Carregando dados...' }}</p>
      </div>
    </div>
  `,
  styles: []
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
    private notificationService: NotificationService,
    private dialog: MatDialog,
    private router: Router
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
            this.notificationService.error('Erro ao salvar categoria');
            this.isSubmitting = false;
            return of(null);
          })
        )
        .subscribe(result => {
          this.isSubmitting = false;
          if (result) {
            // Mostrar modal de sucesso
            this.showSuccessModal(result);
          } else {
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

  showSuccessModal(category: CategoryResponse): void {
    const dialogRef = this.dialog.open(CategorySuccessModalComponent, {
      width: '400px',
      disableClose: true,
      data: { category }
    });

    dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'continue') {
        // Criar nova categoria
        this.resetForm();
      } else if (result === 'view') {
        // Ver lista de categorias
        this.goBack();
      }
    });
  }

  goBack(): void {
    this.notificationService.info('Voltando para a lista de categorias...');
    this.router.navigate(['/dashboard/categories']);
  }

  isFormValid(): boolean {
    return this.categoryForm.valid;
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
