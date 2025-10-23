import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil, catchError, of, map, forkJoin } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

import { AuthService } from '../../core/services/auth.service';
import { ExpenseService } from '../../core/services/expense.service';
import { CategoryService } from '../../core/services/category.service';
import { NotificationService } from '../../core/services/notification.service';

// Importar configuração do Chart.js
import '../../core/config/chart.config';

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

  // Gráficos
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  // Gráfico de Despesas por Categoria (Doughnut)
  public doughnutChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        'rgba(255, 107, 107, 0.8)',  // Vermelho
        'rgba(0, 212, 255, 0.8)',     // Ciano
        'rgba(139, 92, 246, 0.8)',    // Roxo
        'rgba(255, 167, 38, 0.8)',    // Laranja
        'rgba(255, 107, 107, 0.6)',   // Vermelho claro
        'rgba(0, 212, 255, 0.6)',     // Ciano claro
        'rgba(139, 92, 246, 0.6)',    // Roxo claro
        'rgba(255, 167, 38, 0.6)',    // Laranja claro
      ],
      borderColor: [
        'rgba(255, 107, 107, 1)',
        'rgba(0, 212, 255, 1)',
        'rgba(139, 92, 246, 1)',
        'rgba(255, 167, 38, 1)',
        'rgba(255, 107, 107, 0.8)',
        'rgba(0, 212, 255, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(255, 167, 38, 0.8)',
      ],
      borderWidth: 2,
      hoverOffset: 15
    }]
  };

  public doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: 'rgba(255, 255, 255, 0.9)',
          padding: 15,
          font: {
            size: 12,
            weight: 500
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(10, 10, 26, 0.95)',
        titleColor: 'rgba(255, 255, 255, 1)',
        bodyColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = (context.dataset.data as number[]).reduce((acc, val) => acc + val, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: R$ ${value.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '65%',
    animation: {
      animateRotate: true,
      animateScale: true
    }
  };

  // Gráfico de Tendências Mensais (Line)
  public lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Despesas',
        borderColor: 'rgba(255, 107, 107, 1)',
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        pointBackgroundColor: 'rgba(255, 107, 107, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(255, 107, 107, 1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7
      },
      {
        data: [],
        label: 'Receitas',
        borderColor: 'rgba(0, 212, 255, 1)',
        backgroundColor: 'rgba(0, 212, 255, 0.1)',
        pointBackgroundColor: 'rgba(0, 212, 255, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(0, 212, 255, 1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  };

  public lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: 'rgba(255, 255, 255, 0.9)',
          padding: 15,
          font: {
            size: 12,
            weight: 500
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(10, 10, 26, 0.95)',
        titleColor: 'rgba(255, 255, 255, 1)',
        bodyColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y || 0;
            return `${label}: R$ ${value.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawTicks: false
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            size: 11
          },
          padding: 8
        },
        border: {
          display: false
        }
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawTicks: false
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            size: 11
          },
          padding: 8,
          callback: function(value) {
            return 'R$ ' + value;
          }
        },
        border: {
          display: false
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

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
    this.loadChartData();
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

  // ==========================================
  // MÉTODOS PARA CARREGAR DADOS DOS GRÁFICOS
  // ==========================================

  private loadChartData(): void {
    this.loadExpensesByCategoryChart();
    this.loadMonthlyTrendsChart();
  }

  private loadExpensesByCategoryChart(): void {
    forkJoin({
      expenses: this.expenseService.getAllExpensesList(),
      categories: this.categoryService.getAllCategories()
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ({ expenses, categories }) => {
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

        expensesByCategory.forEach((value, key) => {
          labels.push(key);
          data.push(value);
        });

        // Atualizar dados do gráfico
        if (labels.length > 0) {
          this.doughnutChartData = {
            labels: labels,
            datasets: [{
              data: data,
              backgroundColor: this.doughnutChartData.datasets[0].backgroundColor,
              borderColor: this.doughnutChartData.datasets[0].borderColor,
              borderWidth: 2,
              hoverOffset: 15
            }]
          };
        } else {
          // Dados de exemplo se não houver despesas
          this.doughnutChartData = {
            labels: ['Alimentação', 'Transporte', 'Moradia', 'Lazer'],
            datasets: [{
              data: [400, 200, 800, 120],
              backgroundColor: this.doughnutChartData.datasets[0].backgroundColor,
              borderColor: this.doughnutChartData.datasets[0].borderColor,
              borderWidth: 2,
              hoverOffset: 15
            }]
          };
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao carregar dados do gráfico de categorias:', error);
      }
    });
  }

  private loadMonthlyTrendsChart(): void {
    this.expenseService.getAllExpensesList().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (expenses) => {
        // Obter últimos 6 meses
        const currentDate = new Date();
        const monthLabels: string[] = [];
        const expensesData: number[] = [];
        const incomesData: number[] = [];

        for (let i = 5; i >= 0; i--) {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
          const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
          monthLabels.push(monthName.charAt(0).toUpperCase() + monthName.slice(1));

          // Calcular total de despesas do mês
          const monthExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.date + 'T00:00:00');
            return expenseDate.getMonth() === date.getMonth() && 
                   expenseDate.getFullYear() === date.getFullYear();
          }).reduce((total, expense) => total + expense.value, 0);

          expensesData.push(monthExpenses);
          incomesData.push(0); // Por enquanto, sem receitas
        }

        // Atualizar dados do gráfico (sempre mostrar, mesmo se vazio)
        this.lineChartData = {
          labels: monthLabels,
          datasets: [
            {
              ...this.lineChartData.datasets[0],
              data: expensesData,
              label: 'Despesas'
            },
            {
              ...this.lineChartData.datasets[1],
              data: incomesData,
              label: 'Receitas'
            }
          ]
        };

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao carregar dados do gráfico de tendências:', error);
      }
    });
  }
}