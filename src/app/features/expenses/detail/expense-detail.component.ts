import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, catchError, of } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ExpenseService } from '../../../core/services/expense.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ExpenseResponse } from '../../../core/models/expense.model';

@Component({
  selector: 'app-expense-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTooltipModule
  ],
  templateUrl: './expense-detail.component.html',
  styleUrls: ['./expense-detail.component.scss']
})
export class ExpenseDetailComponent implements OnInit, OnDestroy {
  expense: ExpenseResponse | null = null;
  isLoading = false;
  hasError = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private expenseService: ExpenseService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadExpense();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadExpense(): void {
    this.isLoading = true;
    this.hasError = false;
    
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.hasError = true;
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    this.expenseService.getExpenseById(+id)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error loading expense:', error);
          this.hasError = true;
          this.isLoading = false;
          this.cdr.detectChanges();
          return of(null);
        })
      )
      .subscribe(expense => {
        this.expense = expense;
        this.isLoading = false;
        this.cdr.detectChanges();
      });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/expenses']);
  }

  editExpense(): void {
    if (this.expense) {
      this.router.navigate(['/dashboard/expenses/edit', this.expense.id]);
    }
  }

  deleteExpense(): void {
    if (this.expense && confirm(`Tem certeza que deseja excluir a despesa "${this.expense.description}"?`)) {
      this.expenseService.deleteExpense(this.expense.id)
        .pipe(
          takeUntil(this.destroy$),
          catchError(error => {
            this.notificationService.error('Erro ao excluir despesa');
            return of(null);
          })
        )
        .subscribe(result => {
          if (result !== null) {
            this.notificationService.success('Despesa excluída com sucesso');
            this.goBack();
          }
        });
    }
  }

  duplicateExpense(): void {
    if (this.expense) {
      this.notificationService.info('Funcionalidade de duplicação será implementada em breve');
    }
  }

  refreshExpense(): void {
    this.loadExpense();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('pt-BR');
  }
}