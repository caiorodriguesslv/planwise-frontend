import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';

import { IncomeService } from '../../../core/services/income.service';
import { NotificationService } from '../../../core/services/notification.service';
import { IncomeResponse } from '../../../core/models/income.model';

@Component({
  selector: 'app-income-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: './income-detail.component.html',
  styleUrls: ['./income-detail.component.scss']
})
export class IncomeDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  income: IncomeResponse | null = null;
  isLoading = false;
  incomeId: number | null = null;

  constructor(
    private incomeService: IncomeService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id']) {
        this.incomeId = +params['id'];
        this.loadIncome();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadIncome(): void {
    if (!this.incomeId) return;

    this.isLoading = true;
    this.incomeService.getIncomeById(this.incomeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (income) => {
          this.income = income;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar receita:', error);
          this.notificationService.error('Erro ao carregar receita');
          this.isLoading = false;
          this.router.navigate(['/dashboard/incomes']);
        }
      });
  }

  onEdit(): void {
    if (this.incomeId) {
      this.router.navigate(['/dashboard/incomes', this.incomeId, 'edit']);
    }
  }

  onDelete(): void {
    if (!this.incomeId) return;

    if (confirm('Tem certeza que deseja excluir esta receita?')) {
      this.incomeService.deleteIncome(this.incomeId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.notificationService.success('Receita excluída com sucesso!');
            this.router.navigate(['/dashboard/incomes']);
          },
          error: (error) => {
            console.error('Erro ao excluir receita:', error);
            this.notificationService.error('Erro ao excluir receita');
          }
        });
    }
  }

  onBack(): void {
    this.router.navigate(['/dashboard/incomes']);
  }
}


