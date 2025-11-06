import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil, catchError, of, map, forkJoin } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';

import { AuthService } from '../../core/services/auth.service';
import { ExpenseService } from '../../core/services/expense.service';
import { IncomeService } from '../../core/services/income.service';
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
    MatProgressSpinnerModule,
    BaseChartDirective
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

  // Dados dos gráficos
  public doughnutChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        'rgba(255, 107, 107, 0.8)',  // Vermelho
        'rgba(0, 212, 255, 0.8)',     // Ciano
        'rgba(139, 92, 246, 0.8)',    // Roxo
        'rgba(255, 167, 38, 0.8)',    // Laranja
        'rgba(34, 197, 94, 0.8)',     // Verde
        'rgba(236, 72, 153, 0.8)',    // Rosa
      ],
      borderColor: [
        'rgba(255, 107, 107, 1)',
        'rgba(0, 212, 255, 1)',
        'rgba(139, 92, 246, 1)',
        'rgba(255, 167, 38, 1)',
        'rgba(34, 197, 94, 1)',
        'rgba(236, 72, 153, 1)',
      ],
      borderWidth: 2,
      hoverOffset: 15
    }]
  };

  public doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 1.5,
    cutout: '65%',
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: 'rgba(255, 255, 255, 0.9)',
          font: {
            size: 12,
            family: 'Roboto, sans-serif',
            weight: 500
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: R$ ${value.toFixed(2)}`;
          }
        }
      }
    }
  };

  public lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        label: 'Despesas',
        data: [],
        borderColor: 'rgb(255, 107, 107)',
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgb(255, 107, 107)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(255, 107, 107)',
        pointHoverBorderWidth: 3
      },
      {
        label: 'Receitas',
        data: [],
        borderColor: 'rgb(0, 212, 255)',
        backgroundColor: 'rgba(0, 212, 255, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgb(0, 212, 255)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(0, 212, 255)',
        pointHoverBorderWidth: 3
      }
    ]
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 2,
    interaction: {
      mode: 'index',
      intersect: false
    },
    scales: {
      x: {
        border: {
          display: false
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            size: 11,
            family: 'Roboto, sans-serif',
            weight: 500
          }
        }
      },
      y: {
        beginAtZero: true,
        border: {
          display: false
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            size: 11,
            family: 'Roboto, sans-serif',
            weight: 500
          },
          callback: function(value) {
            return 'R$ ' + value;
          }
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: 'rgba(255, 255, 255, 0.9)',
          font: {
            size: 12,
            family: 'Roboto, sans-serif',
            weight: 500
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y || 0;
            return `${label}: R$ ${value.toFixed(2)}`;
          }
        }
      }
    }
  };

  private destroy$ = new Subject<void>();

  constructor(
    public authService: AuthService,
    private expenseService: ExpenseService,
    private incomeService: IncomeService,
    private categoryService: CategoryService,
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardStats();
    this.loadRecentActivities();
    this.loadExpensesByCategoryChart();
    this.loadMonthlyTrendsChart();
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
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Carregar despesas e receitas em paralelo
    forkJoin({
      expenses: this.expenseService.getAllExpensesList(),
      incomes: this.incomeService.getAllIncomesList()
    }).pipe(
      takeUntil(this.destroy$),
      map(({ expenses, incomes }) => {
        // Filtrar e calcular total de despesas do mês atual
        const filteredExpenses = expenses.filter((expense: any) => {
          const expenseDate = new Date(expense.date + 'T00:00:00');
          const expenseYear = expenseDate.getFullYear();
          const expenseMonth = expenseDate.getMonth();
          
          return expenseYear === currentYear && expenseMonth === currentMonth;
        });
        
        const totalExpenses = filteredExpenses.reduce((total: number, expense: any) => total + expense.value, 0);
        
        // Filtrar e calcular total de receitas do mês atual
        const filteredIncomes = incomes.filter((income: any) => {
          const incomeDate = new Date(income.date + 'T00:00:00');
          const incomeYear = incomeDate.getFullYear();
          const incomeMonth = incomeDate.getMonth();
          
          return incomeYear === currentYear && incomeMonth === currentMonth;
        });
        
        const totalIncome = filteredIncomes.reduce((total: number, income: any) => total + income.value, 0);
        
        return { totalExpenses, totalIncome };
      })
    )
    .subscribe({
      next: ({ totalExpenses, totalIncome }) => {
        this.totalExpenses = totalExpenses;
        this.totalIncome = totalIncome;
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

    // Carregar despesas, receitas e categorias recentes
    forkJoin({
      expenses: this.expenseService.getAllExpensesList(),
      incomes: this.incomeService.getAllIncomesList(),
      categories: this.categoryService.getAllCategories()
    }).pipe(
      takeUntil(this.destroy$),
      map(({ expenses, incomes, categories }) => {
        // Converter despesas em atividades
        const expenseActivities = expenses.map(expense => ({
          type: 'expense',
          id: expense.id,
          title: expense.description,
          subtitle: `R$ ${expense.value.toFixed(2)}`,
          date: expense.date,
          icon: 'trending_down',
          color: '#ff6b6b'
        }));

        // Converter receitas em atividades
        const incomeActivities = incomes.map(income => ({
          type: 'income',
          id: income.id,
          title: income.description,
          subtitle: `R$ ${income.value.toFixed(2)}`,
          date: income.date,
          icon: 'trending_up',
          color: '#00d4ff'
        }));

        // Converter categorias em atividades
        const categoryActivities = categories.map(category => ({
          type: 'category',
          id: category.id,
          title: category.name,
          subtitle: category.type === 'RECEITA' ? 'Receita' : 'Despesa',
          date: category.createdAt,
          icon: 'category',
          color: category.type === 'RECEITA' ? '#00d4ff' : '#ff6b6b'
        }));

        // Combinar e ordenar por data
        return [...expenseActivities, ...incomeActivities, ...categoryActivities]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      })
    ).subscribe(allActivities => {
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

  // Carrega gráfico de despesas por categoria
  private loadExpensesByCategoryChart(): void {
    forkJoin({
      expenses: this.expenseService.getAllExpensesList(),
      categories: this.categoryService.getAllCategories()
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ({ expenses, categories }) => {
        // Criar mapa de categorias para lookup rápido
        const categoryMap = new Map<number, string>();
        categories.forEach(cat => categoryMap.set(cat.id, cat.name));

        // Agrupar despesas por categoria
        const expensesByCategory = new Map<string, number>();
        expenses.forEach(expense => {
          const categoryName = expense.category?.name || 'Sem Categoria';
          const currentValue = expensesByCategory.get(categoryName) || 0;
          expensesByCategory.set(categoryName, currentValue + expense.value);
        });

        // Converter para arrays para o gráfico
        const labels: string[] = [];
        const data: number[] = [];
        
        expensesByCategory.forEach((value, category) => {
          labels.push(category);
          data.push(value);
        });

        // Atualizar dados do gráfico
        this.doughnutChartData = {
          ...this.doughnutChartData,
          labels: labels,
          datasets: [{
            ...this.doughnutChartData.datasets[0],
            data: data
          }]
        };

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao carregar gráfico de despesas por categoria:', error);
      }
    });
  }

  // Carrega gráfico de tendências mensais
  private loadMonthlyTrendsChart(): void {
    forkJoin({
      expenses: this.expenseService.getAllExpensesList(),
      incomes: this.incomeService.getAllIncomesList()
    })
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: ({ expenses, incomes }) => {
          // Obter últimos 6 meses
          const months: string[] = [];
          const expensesByMonth: number[] = [];
          const incomesByMonth: number[] = [];
          
          const currentDate = new Date();
          
          for (let i = 5; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
            months.push(monthName);
            
            // Calcular total de despesas do mês
            const monthExpenses = expenses.filter(expense => {
              const expenseDate = new Date(expense.date + 'T00:00:00');
              return expenseDate.getMonth() === date.getMonth() && 
                     expenseDate.getFullYear() === date.getFullYear();
            }).reduce((total, expense) => total + expense.value, 0);
            
            // Calcular total de receitas do mês
            const monthIncomes = incomes.filter(income => {
              const incomeDate = new Date(income.date + 'T00:00:00');
              return incomeDate.getMonth() === date.getMonth() && 
                     incomeDate.getFullYear() === date.getFullYear();
            }).reduce((total, income) => total + income.value, 0);
            
            expensesByMonth.push(monthExpenses);
            incomesByMonth.push(monthIncomes);
          }

          // Atualizar dados do gráfico
          this.lineChartData = {
            ...this.lineChartData,
            labels: months,
            datasets: [
              {
                ...this.lineChartData.datasets[0],
                data: expensesByMonth
              },
              {
                ...this.lineChartData.datasets[1],
                data: incomesByMonth
              }
            ]
          };

          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erro ao carregar gráfico de tendências:', error);
        }
      });
  }
}