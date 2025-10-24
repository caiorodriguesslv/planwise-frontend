import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { ExpenseService } from '../../core/services/expense.service';
import { CategoryService } from '../../core/services/category.service';
import { IncomeService } from '../../core/services/income.service';

@Component({
  selector: 'app-analytics',
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
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit, OnDestroy {
  
  private destroy$ = new Subject<void>();
  isLoading = true;

  // Gráfico 1: Despesas por Categoria (Horizontal Bar)
  public categoryExpensesChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: 'rgba(255, 107, 107, 0.8)',
      borderColor: 'rgba(255, 107, 107, 1)',
      borderWidth: 2,
      borderRadius: 8,
      barThickness: 12
    }]
  };

  public retailChartOptions: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(0, 212, 255, 0.5)',
        borderWidth: 1,
        padding: 12
      }
    },
    scales: {
      x: {
        border: { display: false },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: 'rgba(255, 255, 255, 0.6)', font: { size: 10 } }
      },
      y: {
        border: { display: false },
        grid: { display: false },
        ticks: { color: 'rgba(255, 255, 255, 0.8)', font: { size: 11, weight: 500 } }
      }
    }
  };

  // Gráfico 2: Receitas vs Despesas Últimos 12 Meses (Multi-line)
  public financialTrendsChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        label: 'Despesas',
        data: [],
        borderColor: 'rgb(255, 107, 107)',
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 6
      },
      {
        label: 'Receitas',
        data: [],
        borderColor: 'rgb(0, 212, 255)',
        backgroundColor: 'rgba(0, 212, 255, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 6
      }
    ]
  };

  public dynamicsChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: { size: 11, weight: 500 },
          padding: 15,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        padding: 12
      }
    },
    scales: {
      x: {
        border: { display: false },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: 'rgba(255, 255, 255, 0.6)', font: { size: 10 } }
      },
      y: {
        border: { display: false },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: 'rgba(255, 255, 255, 0.6)', font: { size: 10 } }
      }
    }
  };

  // Gráfico 3: Distribuição por Tipo (Receitas/Despesas) (Pie/Doughnut)
  public distributionChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        'rgba(0, 212, 255, 0.9)',
        'rgba(139, 92, 246, 0.9)',
        'rgba(255, 167, 38, 0.9)',
        'rgba(255, 107, 107, 0.9)',
        'rgba(34, 197, 94, 0.9)',
        'rgba(236, 72, 153, 0.9)',
        'rgba(245, 158, 11, 0.9)',
        'rgba(99, 102, 241, 0.9)'
      ],
      borderWidth: 2,
      borderColor: 'rgba(15, 15, 35, 0.8)',
      hoverOffset: 10
    }]
  };

  public creditsChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: { size: 10 },
          padding: 10,
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
        padding: 12
      }
    }
  };

  // Gráfico 4: Finance (Horizontal Bar com múltiplas categorias)
  public financeChartData: ChartData<'bar'> = {
    labels: ['North America', 'South America', 'Europe', 'Africa', 'Asia', 'Oceania'],
    datasets: [{
      data: [45, 28, 35, 15, 52, 12],
      backgroundColor: [
        'rgba(0, 212, 255, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(255, 167, 38, 0.8)',
        'rgba(255, 107, 107, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(236, 72, 153, 0.8)'
      ],
      borderColor: [
        'rgba(0, 212, 255, 1)',
        'rgba(139, 92, 246, 1)',
        'rgba(255, 167, 38, 1)',
        'rgba(255, 107, 107, 1)',
        'rgba(34, 197, 94, 1)',
        'rgba(236, 72, 153, 1)'
      ],
      borderWidth: 2,
      borderRadius: 8
    }]
  };

  public financeChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        padding: 12
      }
    },
    scales: {
      x: {
        border: { display: false },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: 'rgba(255, 255, 255, 0.6)', font: { size: 10 } }
      },
      y: {
        border: { display: false },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: 'rgba(255, 255, 255, 0.6)', font: { size: 10 } }
      }
    }
  };

  // Gráfico 5: Statistic (Radar/Polar)
  public statisticChartData: ChartData<'polarArea'> = {
    labels: ['A', 'B', 'C', 'D', 'E', 'F'],
    datasets: [{
      data: [65, 59, 90, 81, 56, 72],
      backgroundColor: [
        'rgba(0, 212, 255, 0.7)',
        'rgba(139, 92, 246, 0.7)',
        'rgba(255, 167, 38, 0.7)',
        'rgba(255, 107, 107, 0.7)',
        'rgba(34, 197, 94, 0.7)',
        'rgba(236, 72, 153, 0.7)'
      ],
      borderColor: 'rgba(255, 255, 255, 0.3)',
      borderWidth: 2
    }]
  };

  public statisticChartOptions: ChartOptions<'polarArea'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: { size: 10 },
          padding: 10,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        padding: 12
      }
    },
    scales: {
      r: {
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { 
          color: 'rgba(255, 255, 255, 0.6)',
          backdropColor: 'transparent'
        }
      }
    }
  };

  // Gráfico 6: Activity (Multi-line Area)
  public activityChartData: ChartData<'line'> = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Series 1',
        data: [30, 40, 35, 50, 49, 60, 70, 91, 85, 75, 80, 90],
        borderColor: 'rgb(0, 212, 255)',
        backgroundColor: 'rgba(0, 212, 255, 0.2)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 0
      },
      {
        label: 'Series 2',
        data: [20, 30, 25, 40, 39, 50, 60, 81, 75, 65, 70, 80],
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 0
      },
      {
        label: 'Series 3',
        data: [10, 20, 15, 30, 29, 40, 50, 71, 65, 55, 60, 70],
        borderColor: 'rgb(255, 167, 38)',
        backgroundColor: 'rgba(255, 167, 38, 0.2)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 0
      }
    ]
  };

  public activityChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: { size: 10 },
          padding: 10,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        padding: 12
      }
    },
    scales: {
      x: {
        border: { display: false },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: 'rgba(255, 255, 255, 0.6)', font: { size: 9 } }
      },
      y: {
        border: { display: false },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: 'rgba(255, 255, 255, 0.6)', font: { size: 9 } }
      }
    }
  };

  constructor(
    private cdr: ChangeDetectorRef,
    private expenseService: ExpenseService,
    private categoryService: CategoryService,
    private incomeService: IncomeService
  ) {}

  ngOnInit(): void {
    this.loadAllChartData();
  }

  private loadAllChartData(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    forkJoin({
      expenses: this.expenseService.getAllExpensesList(),
      incomes: this.incomeService.getAllIncomes({ page: 0, size: 1000 }),
      categories: this.categoryService.getAllCategories()
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ({ expenses, incomes, categories }) => {
        this.loadCategoryExpensesChart(expenses, categories);
        this.loadFinancialTrendsChart(expenses, incomes.content || []);
        this.loadDistributionChart(expenses, incomes.content || []);
        this.loadCategoryDistributionChart(categories);
        this.loadMonthlyComparisonChart(expenses, incomes.content || []);
        this.loadTopCategoriesChart(expenses, categories);
        
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao carregar dados dos gráficos:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Carrega gráfico de despesas por categoria
  private loadCategoryExpensesChart(expenses: any[], categories: any[]): void {
    const categoryMap = new Map<string, number>();
    
    expenses.forEach(expense => {
      const categoryName = expense.category?.name || 'Sem Categoria';
      const current = categoryMap.get(categoryName) || 0;
      categoryMap.set(categoryName, current + expense.value);
    });

    // Ordenar por valor e pegar top 7
    const sorted = Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7);

    this.categoryExpensesChartData = {
      ...this.categoryExpensesChartData,
      labels: sorted.map(([name]) => name),
      datasets: [{
        ...this.categoryExpensesChartData.datasets[0],
        data: sorted.map(([, value]) => value)
      }]
    };
  }

  // Carrega gráfico de receitas vs despesas
  private loadFinancialTrendsChart(expenses: any[], incomes: any[]): void {
    const months: string[] = [];
    const expensesByMonth: number[] = [];
    const incomesByMonth: number[] = [];
    
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
      months.push(monthName.charAt(0).toUpperCase() + monthName.slice(1));
      
      // Calcular despesas do mês
      const monthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date + 'T00:00:00');
        return expenseDate.getMonth() === date.getMonth() && 
               expenseDate.getFullYear() === date.getFullYear();
      }).reduce((total, expense) => total + expense.value, 0);
      
      // Calcular receitas do mês
      const monthIncomes = incomes.filter(income => {
        const incomeDate = new Date(income.date + 'T00:00:00');
        return incomeDate.getMonth() === date.getMonth() && 
               incomeDate.getFullYear() === date.getFullYear();
      }).reduce((total, income) => total + income.value, 0);
      
      expensesByMonth.push(monthExpenses);
      incomesByMonth.push(monthIncomes);
    }

    this.financialTrendsChartData = {
      ...this.financialTrendsChartData,
      labels: months,
      datasets: [
        {
          ...this.financialTrendsChartData.datasets[0],
          data: expensesByMonth
        },
        {
          ...this.financialTrendsChartData.datasets[1],
          data: incomesByMonth
        }
      ]
    };
  }

  // Carrega gráfico de distribuição (donut)
  private loadDistributionChart(expenses: any[], incomes: any[]): void {
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.value, 0);
    const totalIncomes = incomes.reduce((sum, inc) => sum + inc.value, 0);

    this.distributionChartData = {
      ...this.distributionChartData,
      labels: ['Despesas', 'Receitas'],
      datasets: [{
        ...this.distributionChartData.datasets[0],
        data: [totalExpenses, totalIncomes],
        backgroundColor: [
          'rgba(255, 107, 107, 0.9)',
          'rgba(0, 212, 255, 0.9)'
        ],
        borderColor: [
          'rgba(255, 107, 107, 1)',
          'rgba(0, 212, 255, 1)'
        ]
      }]
    };
  }

  // Carrega distribuição de categorias
  private loadCategoryDistributionChart(categories: any[]): void {
    const receitas = categories.filter(c => c.type === 'RECEITA').length;
    const despesas = categories.filter(c => c.type === 'DESPESA').length;

    this.financeChartData = {
      ...this.financeChartData,
      labels: ['Categorias de Receita', 'Categorias de Despesa'],
      datasets: [{
        ...this.financeChartData.datasets[0],
        data: [receitas, despesas],
        backgroundColor: [
          'rgba(0, 212, 255, 0.8)',
          'rgba(255, 107, 107, 0.8)'
        ],
        borderColor: [
          'rgba(0, 212, 255, 1)',
          'rgba(255, 107, 107, 1)'
        ]
      }]
    };
  }

  // Carrega comparação mensal (polar)
  private loadMonthlyComparisonChart(expenses: any[], incomes: any[]): void {
    const currentDate = new Date();
    const last6Months: string[] = [];
    const balances: number[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
      last6Months.push(monthName.charAt(0).toUpperCase() + monthName.slice(1));
      
      const monthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date + 'T00:00:00');
        return expenseDate.getMonth() === date.getMonth() && 
               expenseDate.getFullYear() === date.getFullYear();
      }).reduce((total, expense) => total + expense.value, 0);
      
      const monthIncomes = incomes.filter(income => {
        const incomeDate = new Date(income.date + 'T00:00:00');
        return incomeDate.getMonth() === date.getMonth() && 
               incomeDate.getFullYear() === date.getFullYear();
      }).reduce((total, income) => total + income.value, 0);
      
      balances.push(Math.abs(monthIncomes - monthExpenses));
    }

    this.statisticChartData = {
      ...this.statisticChartData,
      labels: last6Months,
      datasets: [{
        ...this.statisticChartData.datasets[0],
        data: balances
      }]
    };
  }

  // Carrega atividade por categoria (line)
  private loadTopCategoriesChart(expenses: any[], categories: any[]): void {
    // Agrupar por categoria e mês
    const categoryMonthMap = new Map<string, Map<string, number>>();
    const currentDate = new Date();
    
    expenses.forEach(expense => {
      const categoryName = expense.category?.name || 'Sem Categoria';
      const expenseDate = new Date(expense.date + 'T00:00:00');
      const monthKey = `${expenseDate.getMonth()}-${expenseDate.getFullYear()}`;
      
      if (!categoryMonthMap.has(categoryName)) {
        categoryMonthMap.set(categoryName, new Map());
      }
      
      const monthMap = categoryMonthMap.get(categoryName)!;
      const current = monthMap.get(monthKey) || 0;
      monthMap.set(monthKey, current + expense.value);
    });

    // Pegar top 3 categorias
    const topCategories = Array.from(categoryMonthMap.entries())
      .map(([name, monthMap]) => ({
        name,
        total: Array.from(monthMap.values()).reduce((a, b) => a + b, 0)
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);

    const months: string[] = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
      months.push(monthName.charAt(0).toUpperCase() + monthName.slice(1));
    }

    const datasets = topCategories.map((cat, index) => {
      const colors = [
        { border: 'rgb(0, 212, 255)', bg: 'rgba(0, 212, 255, 0.2)' },
        { border: 'rgb(139, 92, 246)', bg: 'rgba(139, 92, 246, 0.2)' },
        { border: 'rgb(255, 167, 38)', bg: 'rgba(255, 167, 38, 0.2)' }
      ];

      const data = months.map((_, monthIndex) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - (11 - monthIndex), 1);
        const monthKey = `${date.getMonth()}-${date.getFullYear()}`;
        const monthMap = categoryMonthMap.get(cat.name);
        return monthMap?.get(monthKey) || 0;
      });

      return {
        label: cat.name,
        data,
        borderColor: colors[index].border,
        backgroundColor: colors[index].bg,
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 0
      };
    });

    this.activityChartData = {
      labels: months,
      datasets
    };
  }

  // Calcula total de um dataset
  calculateDatasetTotal(data: any[]): number {
    if (!data || !Array.isArray(data)) return 0;
    return data.reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
  }

  // Pega valor específico do dataset
  getDatasetValue(datasetIndex: number, valueIndex: number): number {
    const data = this.financeChartData?.datasets?.[datasetIndex]?.data;
    if (!data || !Array.isArray(data)) return 0;
    return (data as number[])[valueIndex] || 0;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

