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

import { IncomeService } from '../../../core/services/income.service';
import { CategoryService } from '../../../core/services/category.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingService } from '../../../core/services/loading.service';
import { IncomeRequest, IncomeResponse } from '../../../core/models/income.model';
import { CategoryResponse, CategoryType } from '../../../core/models/category.model';

@Component({
  selector: 'app-income-form',
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
  templateUrl: './income-form.component.html',
  styleUrls: ['./income-form.component.scss']
})
export class IncomeFormComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  incomeForm!: FormGroup;
  categories: CategoryResponse[] = [];
  isLoading = false;
  isSubmitting = false;
  isEditMode = false;
  incomeId: number | null = null;
  maxDate = new Date();

  constructor(
    private fb: FormBuilder,
    private incomeService: IncomeService,
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
    this.incomeForm = this.fb.group({
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
          // Filtrar apenas categorias de RECEITA
          this.categories = categories.filter(cat => cat.type === CategoryType.RECEITA);
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
        this.incomeId = +params['id']; // Convert string to number
        this.loadIncome();
      }
    });
  }

  private loadIncome(): void {
    if (!this.incomeId) return;

    this.isLoading = true;
    
    this.incomeService.getIncomeById(this.incomeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (income) => {
          this.incomeForm.patchValue({
            description: income.description,
            categoryId: income.category.id,
            value: income.value,
            date: new Date(income.date)
          });
          setTimeout(() => {
            this.isLoading = false;
          }, 0);
        },
        error: (error) => {
          console.error('Erro ao carregar receita:', error);
          this.notificationService.error('Erro ao carregar receita');
          setTimeout(() => {
            this.isLoading = false;
          }, 0);
        }
      });
  }

  onSubmit(): void {
    if (this.incomeForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.loadingService.show();

      const formValue = this.incomeForm.value;
      const incomeData: IncomeRequest = {
        description: formValue.description,
        categoryId: formValue.categoryId,
        value: formValue.value,
        date: this.formatDate(formValue.date)
      };

      const operation$ = this.isEditMode && this.incomeId
        ? this.incomeService.updateIncome(this.incomeId, incomeData)
        : this.incomeService.createIncome(incomeData);

      operation$.pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.loadingService.hide();
          this.router.navigate(['/dashboard/incomes']);
        },
        error: (error) => {
          console.error('Erro ao salvar receita:', error);
          this.loadingService.hide();
          this.isSubmitting = false;
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.incomeForm);
      this.notificationService.error('Por favor, preencha todos os campos corretamente');
    }
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/incomes']);
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  get f() {
    return this.incomeForm.controls;
  }
}


