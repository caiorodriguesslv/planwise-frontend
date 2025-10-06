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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { ExpenseService } from '../../../core/services/expense.service';
import { CategoryService } from '../../../core/services/category.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingService } from '../../../core/services/loading.service';
import { ExpenseRequest, ExpenseResponse } from '../../../core/models/expense.model';
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
    MatDividerModule,
    MatDialogModule
  ],
  templateUrl: './expense-form.component.html',
  styleUrls: ['./expense-form.component.scss']
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
    private route: ActivatedRoute,
    private dialog: MatDialog
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
          setTimeout(() => {
            this.isLoading = false;
          }, 0);
        },
        error: (error) => {
          console.error('Erro ao carregar despesa:', error);
          this.notificationService.error('Erro ao carregar despesa');
          setTimeout(() => {
            this.isLoading = false;
          }, 0);
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
          
          if (this.isEditMode) {
            this.notificationService.success('Despesa atualizada com sucesso!');
            this.router.navigate(['/dashboard/expenses']);
          } else {
            // Mostrar modal de sucesso para nova despesa
            this.showSuccessModal(response);
          }
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

  async showSuccessModal(expense: ExpenseResponse): Promise<void> {
    const { ExpenseSuccessModalComponent } = await import('../modal/expense-success-modal.component');
    
    const dialogRef = this.dialog.open(ExpenseSuccessModalComponent, {
      width: '400px',
      disableClose: true,
      data: { expense }
    });

    dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'continue') {
        // Criar nova despesa
        this.resetForm();
      } else if (result === 'viewList') {
        // Ver lista de despesas
        this.goBack();
      }
    });
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
