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
  template: `
    <!-- Dashboard Content -->
    <div class="dashboard-content">
      
      <!-- Loading Spinner -->
      <div *ngIf="isLoadingStats" class="loading-container">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Carregando estatísticas...</p>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid" *ngIf="isNotLoadingStats">
        <div class="stat-card income">
          <div class="stat-icon">
            <mat-icon>trending_up</mat-icon>
          </div>
          <div class="stat-info">
            <h3>Receitas</h3>
            <p class="amount">{{ totalIncome | currency:'BRL':'symbol':'1.2-2' }}</p>
            <span class="subtitle">Este mês</span>
          </div>
        </div>

        <div class="stat-card expense">
          <div class="stat-icon">
            <mat-icon>trending_down</mat-icon>
          </div>
          <div class="stat-info">
            <h3>Despesas</h3>
            <p class="amount">{{ totalExpenses | currency:'BRL':'symbol':'1.2-2' }}</p>
            <span class="subtitle">Este mês</span>
          </div>
        </div>


        <div class="stat-card goals">
          <div class="stat-icon">
            <mat-icon>flag</mat-icon>
          </div>
          <div class="stat-info">
            <h3>Metas</h3>
            <p class="amount">{{ activeGoals }}</p>
            <span class="subtitle">Ativas</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h2>Ações Rápidas</h2>
        <div class="actions-grid">
          <div class="action-card income-action" (click)="navigateTo('/dashboard/expenses/new')">
            <div class="action-icon">
              <mat-icon>add</mat-icon>
            </div>
            <div class="action-content">
              <h3>Nova Receita</h3>
              <p>Registrar entrada</p>
            </div>
          </div>
          <div class="action-card expense-action" (click)="navigateTo('/dashboard/expenses/new')">
            <div class="action-icon">
              <mat-icon>remove</mat-icon>
            </div>
            <div class="action-content">
              <h3>Nova Despesa</h3>
              <p>Registrar gasto</p>
            </div>
          </div>
          <div class="action-card goal-action" (click)="navigateTo('/dashboard/metas')">
            <div class="action-icon">
              <mat-icon>flag</mat-icon>
            </div>
            <div class="action-content">
              <h3>Nova Meta</h3>
              <p>Definir objetivo</p>
            </div>
          </div>
          <div class="action-card report-action" (click)="navigateTo('/dashboard/relatorios')">
            <div class="action-icon">
              <mat-icon>analytics</mat-icon>
            </div>
            <div class="action-content">
              <h3>Ver Relatórios</h3>
              <p>Analisar dados</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="recent-activity">
        <div class="activity-header">
          <h2>Atividade Recente</h2>
          <button mat-icon-button (click)="refreshActivities()" class="refresh-btn" [disabled]="isLoadingActivities">
            <mat-icon>refresh</mat-icon>
          </button>
        </div>
        <div class="activity-list">
          <!-- Loading State -->
          <div class="activity-item loading" *ngIf="isLoadingActivities">
            <mat-spinner diameter="24"></mat-spinner>
            <div class="activity-content">
              <p>Carregando atividades...</p>
            </div>
          </div>
          
          <!-- Empty State -->
          <div class="activity-item empty" *ngIf="!isLoadingActivities && recentActivities.length === 0">
            <mat-icon>info</mat-icon>
            <div class="activity-content">
              <p>Nenhuma atividade recente</p>
              <span>Comece adicionando suas primeiras transações</span>
            </div>
          </div>
          
          <!-- Activities List -->
          <div class="activity-item" *ngFor="let activity of recentActivities">
            <div class="activity-icon" [style.background-color]="activity.color">
              <mat-icon>{{ activity.icon }}</mat-icon>
            </div>
            <div class="activity-content">
              <p>{{ activity.title }}</p>
              <span>{{ activity.subtitle }} • {{ formatActivityDate(activity.date) }}</span>
            </div>
          </div>
          
          <!-- Load More Button -->
          <div class="load-more-container" *ngIf="hasMoreActivities && !isLoadingActivities">
            <button mat-stroked-button (click)="loadMoreActivities()" class="load-more-btn">
              <mat-icon>expand_more</mat-icon>
              Carregar mais atividades
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-content {
      max-width: 1200px;
      margin: 0 auto;
      background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
      min-height: calc(100vh - 80px);
      position: relative;
      border-radius: 20px;
      padding: 24px;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
          radial-gradient(circle at 20% 20%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 60%, rgba(255, 167, 38, 0.05) 0%, transparent 50%);
        pointer-events: none;
        border-radius: 20px;
      }
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
      
      p {
        margin-top: 16px;
        color: #6b7280;
        font-size: 14px;
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      margin-bottom: 32px;
      
      .stat-card {
        background: linear-gradient(135deg, var(--planwise-bg-secondary) 0%, var(--planwise-bg-tertiary) 100%);
        border-radius: 20px;
        padding: 28px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        gap: 20px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        
        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03));
          pointer-events: none;
        }
        
        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
        }
        
        .stat-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          
          &::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
            border-radius: 18px;
            z-index: -1;
          }
          
          mat-icon {
            font-size: 32px;
            color: white;
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
            width: 32px !important;
            height: 32px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            line-height: 1 !important;
            margin: 0 !important;
            padding: 0 !important;
            text-align: center !important;
            vertical-align: middle !important;
          }
        }
        
        .stat-info {
          h3 {
            margin: 0 0 4px 0;
            font-size: 14px;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.8);
          }
          
          .amount {
            margin: 0 0 2px 0;
            font-size: 24px;
            font-weight: 700;
            color: white;
          }
          
          .subtitle {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.6);
          }
        }
        
        &.income .stat-icon {
          background: linear-gradient(135deg, var(--planwise-cyan), var(--planwise-cyan-dark));
          box-shadow: 0 6px 20px rgba(0, 212, 255, 0.4);
        }
        
        &.expense .stat-icon {
          background: linear-gradient(135deg, var(--planwise-red), var(--planwise-red-dark));
          box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
        }
        
        &.balance .stat-icon {
          background: linear-gradient(135deg, var(--planwise-purple), var(--planwise-purple-dark));
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
        }
        
        &.goals .stat-icon {
          background: linear-gradient(135deg, var(--planwise-orange), var(--planwise-orange-dark));
          box-shadow: 0 6px 20px rgba(255, 167, 38, 0.4);
        }
      }
    }

    .quick-actions {
      margin-bottom: 40px;
      
      h2 {
        margin: 0 0 24px 0;
        font-size: 24px;
        font-weight: 700;
        color: white;
        text-align: center;
        position: relative;
        
        &::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 3px;
          background: linear-gradient(135deg, var(--planwise-cyan), var(--planwise-purple));
          border-radius: 2px;
        }
      }
      
      .actions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 24px;
        max-width: 1000px;
        margin: 0 auto;
        
        .action-card {
          background: linear-gradient(135deg, var(--planwise-bg-secondary) 0%, var(--planwise-bg-tertiary) 100%);
          border-radius: 24px;
          padding: 32px;
          display: flex;
          align-items: center;
          gap: 24px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
          position: relative;
          overflow: hidden;
          min-height: 120px;
          
          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03));
            pointer-events: none;
          }
          
          .action-icon {
            width: 64px;
            height: 64px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            background: linear-gradient(135deg, var(--planwise-cyan), var(--planwise-cyan-dark));
            box-shadow: 0 6px 20px rgba(0, 212, 255, 0.4);
            position: relative;
            
            &::before {
              content: '';
              position: absolute;
              top: -2px;
              left: -2px;
              right: -2px;
              bottom: -2px;
              background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
              border-radius: 18px;
              z-index: -1;
            }
            
            mat-icon {
              font-size: 32px;
              width: 32px;
              height: 32px;
              color: white;
              filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
            }
          }
          
          .action-content {
            flex: 1;
            
            h3 {
              margin: 0 0 8px 0;
              font-size: 18px;
              font-weight: 700;
              color: white;
              text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            }
            
            p {
              margin: 0;
              font-size: 14px;
              color: rgba(255, 255, 255, 0.8);
              line-height: 1.4;
            }
          }
          
          &:hover {
            transform: translateY(-6px);
            box-shadow: 0 16px 50px rgba(0, 0, 0, 0.6);
          }
          
          &.income-action .action-icon {
            background: linear-gradient(135deg, var(--planwise-cyan), var(--planwise-cyan-dark));
            box-shadow: 0 6px 20px rgba(0, 212, 255, 0.4);
          }
          
          &.expense-action .action-icon {
            background: linear-gradient(135deg, var(--planwise-red), var(--planwise-red-dark));
            box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
          }
          
          &.goal-action .action-icon {
            background: linear-gradient(135deg, var(--planwise-orange), var(--planwise-orange-dark));
            box-shadow: 0 6px 20px rgba(255, 167, 38, 0.4);
          }
          
          &.report-action .action-icon {
            background: linear-gradient(135deg, var(--planwise-purple), var(--planwise-purple-dark));
            box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
          }
        }
      }
      
      @media (max-width: 768px) {
        .actions-grid {
          grid-template-columns: 1fr;
          gap: 16px;
          padding: 0 16px;
        }
        
        .action-card {
          padding: 24px;
          min-height: 100px;
          
          .action-icon {
            width: 56px;
            height: 56px;
            
            mat-icon {
              font-size: 28px;
              width: 28px;
              height: 28px;
            }
          }
          
          .action-content {
            h3 {
              font-size: 16px;
            }
            
            p {
              font-size: 13px;
            }
          }
        }
      }
    }

    .recent-activity {
      .activity-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        
        h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: white;
        }
        
        .refresh-btn {
          color: rgba(255, 255, 255, 0.7) !important;
          transition: all 0.3s ease !important;
          
          &:hover:not(:disabled) {
            color: white !important;
            background: rgba(255, 255, 255, 0.1) !important;
          }
          
          &:disabled {
            opacity: 0.5;
          }
          
          mat-icon {
            font-size: 20px;
            width: 20px;
            height: 20px;
          }
        }
      }
      
      .activity-list {
        background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        
        .activity-item {
          padding: 16px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
          
          &:last-child {
            border-bottom: none;
          }
          
          &:hover {
            background: rgba(255, 255, 255, 0.05);
          }
          
          &.loading {
            justify-content: center;
            color: rgba(255, 255, 255, 0.7);
            
            p {
              margin: 0;
              font-weight: 500;
            }
          }
          
          &.empty {
            text-align: center;
            flex-direction: column;
            color: rgba(255, 255, 255, 0.7);
            
            mat-icon {
              font-size: 48px;
              color: rgba(255, 255, 255, 0.4);
              margin-bottom: 8px;
            }
            
            p {
              margin: 0 0 4px 0;
              font-weight: 600;
            }
            
            span {
              font-size: 14px;
            }
          }
          
          .activity-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            
            mat-icon {
              color: white;
              font-size: 20px;
              width: 20px;
              height: 20px;
            }
          }
          
          .activity-content {
            flex: 1;
            
            p {
              margin: 0 0 4px 0;
              font-weight: 600;
              color: white;
              font-size: 14px;
            }
            
            span {
              font-size: 12px;
              color: rgba(255, 255, 255, 0.6);
            }
          }
        }
        
        .load-more-container {
          padding: 16px 24px;
          text-align: center;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          
          .load-more-btn {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%) !important;
            color: white !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            border-radius: 12px !important;
            padding: 12px 24px !important;
            font-weight: 500 !important;
            font-size: 14px !important;
            transition: all 0.3s ease !important;
            
            &:hover {
              background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%) !important;
              transform: translateY(-1px);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
            }
            
            mat-icon {
              margin-right: 8px;
              font-size: 18px;
              width: 18px;
              height: 18px;
            }
          }
        }
      }
    }

    // Responsive Design
    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
      
      .actions-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 480px) {
      .actions-grid {
        grid-template-columns: 1fr;
      }
      
      .stat-card {
        padding: 16px;
      }
    }
  `]
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
        color: '#ef4444'
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
          color: category.type === 'RECEITA' ? '#10b981' : '#ef4444'
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