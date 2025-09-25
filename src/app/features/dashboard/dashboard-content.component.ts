import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-content',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="dashboard-content">
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card income">
          <div class="stat-icon">
            <mat-icon>trending_up</mat-icon>
          </div>
          <div class="stat-info">
            <h3>Receitas</h3>
            <p class="amount">R$ 0,00</p>
            <span class="subtitle">Este mês</span>
          </div>
        </div>

        <div class="stat-card expense">
          <div class="stat-icon">
            <mat-icon>trending_down</mat-icon>
          </div>
          <div class="stat-info">
            <h3>Despesas</h3>
            <p class="amount">R$ 0,00</p>
            <span class="subtitle">Este mês</span>
          </div>
        </div>

        <div class="stat-card balance">
          <div class="stat-icon">
            <mat-icon>account_balance_wallet</mat-icon>
          </div>
          <div class="stat-info">
            <h3>Saldo</h3>
            <p class="amount">R$ 0,00</p>
            <span class="subtitle">Disponível</span>
          </div>
        </div>

        <div class="stat-card goals">
          <div class="stat-icon">
            <mat-icon>flag</mat-icon>
          </div>
          <div class="stat-info">
            <h3>Metas</h3>
            <p class="amount">0</p>
            <span class="subtitle">Ativas</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h2>Ações Rápidas</h2>
        <div class="actions-grid">
          <div class="action-card" (click)="navigateTo('/dashboard/receitas', $event)">
            <mat-icon>add_circle</mat-icon>
            <span>Nova Receita</span>
          </div>
          <div class="action-card" (click)="navigateTo('/dashboard/expenses/new', $event)">
            <mat-icon>remove_circle</mat-icon>
            <span>Nova Despesa</span>
          </div>
          <div class="action-card" (click)="navigateTo('/dashboard/metas', $event)">
            <mat-icon>emoji_events</mat-icon>
            <span>Nova Meta</span>
          </div>
          <div class="action-card" (click)="navigateTo('/dashboard/relatorios', $event)">
            <mat-icon>assessment</mat-icon>
            <span>Ver Relatórios</span>
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
      padding: 32px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
      
      .stat-card {
        background: white;
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        border: 1px solid #e2e8f0;
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
            color: #64748b;
          }
          
          .amount {
            margin: 0 0 2px 0;
            font-size: 24px;
            font-weight: 700;
            color: #1a202c;
          }
          
          .subtitle {
            font-size: 12px;
            color: #94a3b8;
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
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        
        .action-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid #e2e8f0;
          
          mat-icon {
            font-size: 32px;
            color: #ff6b6b;
          }
          
          span {
            font-weight: 600;
            color: #1a202c;
          }
          
          &:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(255, 107, 107, 0.15);
            border-color: #ff6b6b;
            
            mat-icon {
              color: #e84393;
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
        color: #1a202c;
      }
      
      .activity-list {
        background: white;
        border-radius: 16px;
        border: 1px solid #e2e8f0;
        
        .activity-item {
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          
          &.empty {
            text-align: center;
            flex-direction: column;
            color: #64748b;
            
            mat-icon {
              font-size: 48px;
              color: #cbd5e1;
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

    // Responsive
    @media (max-width: 768px) {
      .dashboard-content {
        padding: 16px;
      }
      
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
export class DashboardContentComponent implements OnInit {

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Implementação adicional se necessário
  }

  navigateTo(route: string, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.router.navigate([route]);
  }
}
