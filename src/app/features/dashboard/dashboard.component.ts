import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil, catchError, of, map } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { ExpenseService } from '../../core/services/expense.service';
import { CategoryService } from '../../core/services/category.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {

  // Estatísticas do dashboard
  totalIncome: number = 0;
  totalExpenses: number = 0;
  activeGoals: number = 0;
  isLoading: boolean = false;

  // Propriedades computadas para evitar mudanças durante detecção
  isLoadingStats: boolean = false;
  isNotLoadingStats: boolean = true;

  // Atividade recente
  recentActivities: any[] = [];
  isLoadingActivities: boolean = false;
  hasMoreActivities: boolean = true;
  currentPage: number = 0;
  pageSize: number = 5;

  private destroy$ = new Subject<void>();

  constructor(
    public authService: AuthService,
    private expenseService: ExpenseService,
    private categoryService: CategoryService,
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardStats();
    this.loadRecentActivities();
  }

  ngAfterViewInit(): void {
    // Recarregar atividades quando o usuário retorna ao dashboard
    this.refreshActivities();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardStats(): void {
    this.isLoadingStats = true;
    this.isNotLoadingStats = false;
    this.cdr.detectChanges();

    // Carregar estatísticas reais
    this.loadExpenseStats();
  }

  private loadExpenseStats(): void {
    // Calcular período do mês atual
    const currentDate = new Date();

    this.expenseService.getAllExpensesList()
    .pipe(
      takeUntil(this.destroy$),
      map((allExpenses: any[]) => {
        // Filtrar e calcular total em uma única operação
        const filteredExpenses = allExpenses.filter((expense: any) => {
          // Parsear a data corretamente - assumindo formato YYYY-MM-DD
          const expenseDate = new Date(expense.date + 'T00:00:00');
          const expenseYear = expenseDate.getFullYear();
          const expenseMonth = expenseDate.getMonth();
          const currentYear = currentDate.getFullYear();
          const currentMonth = currentDate.getMonth();
          
          // Verificar se está no mês atual
          return expenseYear === currentYear && expenseMonth === currentMonth;
        });
        
        const total = filteredExpenses.reduce((total: number, expense: any) => total + expense.value, 0);
        
        // Fallback: se não há despesas filtradas, mostrar total geral
        if (filteredExpenses.length === 0) {
          return allExpenses.reduce((total: number, expense: any) => total + expense.value, 0);
        }
        
        return total;
      })
    )
    .subscribe({
      next: (totalExpenses: number) => {
        this.totalExpenses = totalExpenses;
        this.totalIncome = 0; // Por enquanto, sem receitas
        this.activeGoals = 0; // Por enquanto, sem metas
        
        this.isLoadingStats = false;
        this.isNotLoadingStats = true;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao carregar estatísticas:', error);
        this.notificationService.error('Erro ao carregar estatísticas');
        
        this.totalIncome = 0;
        this.totalExpenses = 0;
        this.activeGoals = 0;
        
        this.isLoadingStats = false;
        this.isNotLoadingStats = true;
        this.cdr.detectChanges();
      }
    });
  }

  private loadRecentActivities(loadMore: boolean = false): void {
    if (this.isLoadingActivities) return;
    
    this.isLoadingActivities = true;
    this.cdr.detectChanges();

    // Carregar despesas e categorias recentes
    const expenses$ = this.expenseService.getAllExpensesList();
    const categories$ = this.categoryService.getAllCategories();

    expenses$.pipe(
      takeUntil(this.destroy$),
      map(expenses => expenses.map(expense => ({
        type: 'expense',
        id: expense.id,
        title: expense.description,
        subtitle: `R$ ${expense.value.toFixed(2)}`,
        date: expense.date,
        icon: 'trending_down',
        color: '#ff6b6b'
      })))
    ).subscribe(expenseActivities => {
      categories$.pipe(
        takeUntil(this.destroy$),
        map(categories => categories.map(category => ({
          type: 'category',
          id: category.id,
          title: category.name,
          subtitle: category.type === 'RECEITA' ? 'Receita' : 'Despesa',
          date: category.createdAt,
          icon: 'category',
          color: category.type === 'RECEITA' ? '#00d4ff' : '#ff6b6b'
        })))
      ).subscribe(categoryActivities => {
        // Combinar e ordenar por data
        const allActivities = [...expenseActivities, ...categoryActivities]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        if (loadMore) {
          // Adicionar mais atividades
          const startIndex = this.currentPage * this.pageSize;
          const endIndex = startIndex + this.pageSize;
          const newActivities = allActivities.slice(startIndex, endIndex);
          
          this.recentActivities = [...this.recentActivities, ...newActivities];
          this.hasMoreActivities = newActivities.length === this.pageSize;
          this.currentPage++;
        } else {
          // Carregar primeira página
          this.recentActivities = allActivities.slice(0, this.pageSize);
          this.hasMoreActivities = allActivities.length > this.pageSize;
          this.currentPage = 1;
        }

        this.isLoadingActivities = false;
        this.cdr.detectChanges();
      });
    });
  }

  loadMoreActivities(): void {
    if (this.hasMoreActivities && !this.isLoadingActivities) {
      this.loadRecentActivities(true);
    }
  }

  refreshActivities(): void {
    // Reset pagination and reload activities
    this.currentPage = 0;
    this.hasMoreActivities = true;
    this.recentActivities = [];
    this.loadRecentActivities();
  }

  formatActivityDate(date: string): string {
    const activityDate = new Date(date);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Agora mesmo';
    } else if (diffInHours < 24) {
      return `${diffInHours}h atrás`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d atrás`;
    }
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}