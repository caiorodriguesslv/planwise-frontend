import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil, catchError, of } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { ExpenseService } from '../../core/services/expense.service';
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

        <div class="stat-card balance">
          <div class="stat-icon">
            <mat-icon>account_balance_wallet</mat-icon>
          </div>
          <div class="stat-info">
            <h3>Saldo</h3>
            <p class="amount">{{ balance | currency:'BRL':'symbol':'1.2-2' }}</p>
            <span class="subtitle">Disponível</span>
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
        <h2>Atividade Recente</h2>
        <div class="activity-list">
          <div class="activity-item empty">
            <mat-icon>info</mat-icon>
            <div class="activity-content">
              <p>Nenhuma atividade recente</p>
              <span>Comece adicionando suas primeiras transações</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-content {
      max-width: 1200px;
      margin: 0 auto;
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
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
      
      .stat-card {
        background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        gap: 16px;
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }
        
        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          
          mat-icon {
            font-size: 24px;
            color: white;
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
          background: linear-gradient(135deg, #10b981, #34d399);
        }
        
        &.expense .stat-icon {
          background: linear-gradient(135deg, #ef4444, #f87171);
        }
        
        &.balance .stat-icon {
          background: linear-gradient(135deg, #3b82f6, #60a5fa);
        }
        
        &.goals .stat-icon {
          background: linear-gradient(135deg, #8b5cf6, #a78bfa);
        }
      }
    }

    .quick-actions {
      margin-bottom: 32px;
      
      h2 {
        margin: 0 0 20px 0;
        font-size: 20px;
        font-weight: 700;
        color: #1a202c;
      }
      
      .actions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 20px;
        
        .action-card {
          background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          
          .action-icon {
            width: 56px;
            height: 56px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            
            mat-icon {
              font-size: 28px;
              width: 28px;
              height: 28px;
              color: white;
            }
          }
          
          .action-content {
            flex: 1;
            
            h3 {
              margin: 0 0 4px 0;
              font-size: 16px;
              font-weight: 600;
              color: white;
            }
            
            p {
              margin: 0;
              font-size: 13px;
              color: rgba(255, 255, 255, 0.7);
            }
          }
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
          }
          
          &.income-action {
            .action-icon {
              background: linear-gradient(135deg, #10b981, #059669);
            }
            
            &:hover {
              border-color: #10b981;
            }
          }
          
          &.expense-action {
            .action-icon {
              background: linear-gradient(135deg, #ef4444, #dc2626);
            }
            
            &:hover {
              border-color: #ef4444;
            }
          }
          
          &.goal-action {
            .action-icon {
              background: linear-gradient(135deg, #f59e0b, #d97706);
            }
            
            &:hover {
              border-color: #f59e0b;
            }
          }
          
          &.report-action {
            .action-icon {
              background: linear-gradient(135deg, #8b5cf6, #7c3aed);
            }
            
            &:hover {
              border-color: #8b5cf6;
            }
          }
        }
      }
    }

    .recent-activity {
      h2 {
        margin: 0 0 20px 0;
        font-size: 20px;
        font-weight: 700;
        color: white;
      }
      
      .activity-list {
        background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        
        .activity-item {
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          
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
export class DashboardComponent implements OnInit, OnDestroy {

  // Estatísticas do dashboard
  totalIncome: number = 0;
  totalExpenses: number = 0;
  balance: number = 0;
  activeGoals: number = 0;
  isLoading: boolean = false;

  // Propriedades computadas para evitar mudanças durante detecção
  isLoadingStats: boolean = false;
  isNotLoadingStats: boolean = true;

  private destroy$ = new Subject<void>();

  constructor(
    public authService: AuthService,
    private expenseService: ExpenseService,
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardStats(): void {
    this.isLoadingStats = true;
    this.isNotLoadingStats = false;
    this.cdr.markForCheck();

    // Simular carregamento de estatísticas
    setTimeout(() => {
      this.totalIncome = 0;
      this.totalExpenses = 0;
      this.balance = 0;
      this.activeGoals = 0;
      
      this.isLoadingStats = false;
      this.isNotLoadingStats = true;
      this.cdr.markForCheck();
    }, 1000);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}