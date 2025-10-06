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
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss']
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
