import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

import { AuthService } from '../../core/services/auth.service';
import { ExpenseListV2Component } from '../expenses/list/expense-list-v2.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    ExpenseListV2Component
  ],
  template: `
    <div class="dashboard-layout">
      <!-- Sidebar -->
      <div class="sidebar">
        <div class="sidebar-header">
          <div class="logo">
            <mat-icon>account_balance_wallet</mat-icon>
            <span>Plan Wise</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section">
            <h3>Principal</h3>
            <div class="nav-item" 
                 [class.active]="selectedModule === 'dashboard'"
                 (click)="selectModule('dashboard', $event)">
              <mat-icon>dashboard</mat-icon>
              <span>Home</span>
            </div>
          </div>

          <div class="nav-section">
            <h3>Financeiro</h3>
            <div class="nav-item" 
                 [class.active]="selectedModule === 'receitas'"
                 (click)="selectModule('receitas', $event)">
              <mat-icon>trending_up</mat-icon>
              <span>Receitas</span>
              <span class="badge">Em breve</span>
            </div>
            <div class="nav-item" 
                 [class.active]="selectedModule === 'despesas'"
                 (click)="selectModule('despesas', $event)">
              <mat-icon>trending_down</mat-icon>
              <span>Despesas</span>
            </div>
            <div class="nav-item" 
                 [class.active]="selectedModule === 'categorias'"
                 (click)="selectModule('categorias', $event)">
              <mat-icon>category</mat-icon>
              <span>Categorias</span>
              <span class="badge">Em breve</span>
            </div>
          </div>

          <div class="nav-section">
            <h3>Planejamento</h3>
            <div class="nav-item" 
                 [class.active]="selectedModule === 'metas'"
                 (click)="selectModule('metas', $event)">
              <mat-icon>flag</mat-icon>
              <span>Metas</span>
              <span class="badge">Em breve</span>
            </div>
            <div class="nav-item" 
                 [class.active]="selectedModule === 'orcamento'"
                 (click)="selectModule('orcamento', $event)">
              <mat-icon>account_balance</mat-icon>
              <span>Orçamento</span>
              <span class="badge">Em breve</span>
            </div>
          </div>

          <div class="nav-section">
            <h3>Relatórios</h3>
            <div class="nav-item" 
                 [class.active]="selectedModule === 'relatorios'"
                 (click)="selectModule('relatorios', $event)">
              <mat-icon>analytics</mat-icon>
              <span>Relatórios</span>
              <span class="badge">Em breve</span>
            </div>
            <div class="nav-item" 
                 [class.active]="selectedModule === 'graficos'"
                 (click)="selectModule('graficos', $event)">
              <mat-icon>bar_chart</mat-icon>
              <span>Gráficos</span>
              <span class="badge">Em breve</span>
            </div>
          </div>

          <div class="nav-section">
            <h3>Configurações</h3>
            <div class="nav-item" 
                 [class.active]="selectedModule === 'perfil'"
                 (click)="selectModule('perfil', $event)">
              <mat-icon>person</mat-icon>
              <span>Meu Perfil</span>
            </div>
            <div class="nav-item logout-item" (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Sair</span>
            </div>
          </div>
        </nav>
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Top Header -->
        <div class="top-header">
          <div class="header-left">
            <h1>{{ getModuleTitle() }}</h1>
            <p>{{ getModuleSubtitle() }}</p>
          </div>
          <div class="header-right">
            <div class="user-info">
              <div class="avatar">
                <mat-icon>person</mat-icon>
              </div>
              <div class="user-details">
                <span class="name">{{ authService.userName }}</span>
                <span class="role">{{ authService.isAdmin() ? 'Administrador' : 'Usuário' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Content Area -->
        <div class="content-area">
          <!-- Dashboard Content -->
          <div *ngIf="selectedModule === 'dashboard'" class="dashboard-content">
            
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
                <div class="action-card income-action" (click)="selectModule('receitas', $event)">
                  <div class="action-icon">
                    <mat-icon>add</mat-icon>
                  </div>
                  <div class="action-content">
                    <h3>Nova Receita</h3>
                    <p>Registrar entrada</p>
                  </div>
                </div>
                <div class="action-card expense-action" (click)="selectModule('despesas', $event)">
                  <div class="action-icon">
                    <mat-icon>remove</mat-icon>
                  </div>
                  <div class="action-content">
                    <h3>Nova Despesa</h3>
                    <p>Registrar gasto</p>
                  </div>
                </div>
                <div class="action-card goal-action" (click)="selectModule('metas', $event)">
                  <div class="action-icon">
                    <mat-icon>flag</mat-icon>
                  </div>
                  <div class="action-content">
                    <h3>Nova Meta</h3>
                    <p>Definir objetivo</p>
                  </div>
                </div>
                <div class="action-card report-action" (click)="selectModule('relatorios', $event)">
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

          <!-- Debug Info -->

          <!-- Module Content -->
          <div *ngIf="selectedModule !== 'dashboard'" class="module-content">
            
            <!-- Despesas Module -->
            <div *ngIf="selectedModule === 'despesas'" class="expense-module">
              <app-expense-list-v2></app-expense-list-v2>
            </div>
            
            <!-- Outros Módulos - Coming Soon -->
            <div *ngIf="selectedModule !== 'dashboard' && selectedModule !== 'despesas'" class="coming-soon">
              <mat-icon>build</mat-icon>
              <h2>{{ getModuleTitle() }}</h2>
              <p>Esta funcionalidade está em desenvolvimento</p>
              <button mat-raised-button color="primary" (click)="selectModule('dashboard', $event)">
                Voltar ao Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-layout {
      display: flex;
      min-height: 100vh;
      background: #f8fafc;
    }

    // Sidebar Styles
    .sidebar {
      width: 280px;
      background: linear-gradient(180deg, #2d3748 0%, #1a202c 100%);
      box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
      position: fixed;
      height: 100vh;
      overflow-y: auto;
      z-index: 1000;
      
      &::-webkit-scrollbar {
        width: 6px;
      }
      
      &::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
      }
      
      &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.3);
        border-radius: 3px;
      }
    }

    .sidebar-header {
      padding: 24px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      
      .logo {
        display: flex;
        align-items: center;
        gap: 12px;
        color: white;
        
        mat-icon {
          font-size: 28px;
          color: #ff6b6b;
        }
        
        span {
          font-size: 20px;
          font-weight: 700;
          background: linear-gradient(135deg, #ff6b6b, #e84393);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      }
    }

    .sidebar-nav {
      padding: 20px 0;
      
      .nav-section {
        margin-bottom: 32px;
        
        h3 {
          color: rgba(255, 255, 255, 0.6);
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin: 0 0 12px 20px;
          padding: 0;
        }
        
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          transition: all 0.3s ease;
          position: relative;
          
          mat-icon {
            font-size: 20px;
            width: 20px;
          }
          
          span:not(.badge) {
            font-weight: 500;
            flex: 1;
          }
          
          .badge {
            background: rgba(255, 107, 107, 0.2);
            color: #ff6b6b;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
          }
          
          &:hover {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            
            mat-icon {
              color: #ff6b6b;
            }
          }
          
          &.active {
            background: linear-gradient(135deg, #ff6b6b, #e84393);
            color: white;
            
            &::before {
              content: '';
              position: absolute;
              left: 0;
              top: 0;
              bottom: 0;
              width: 4px;
              background: white;
            }
            
            mat-icon {
              color: white;
            }
          }
          
          &.logout-item {
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            margin-top: 8px;
            padding-top: 16px;
            
            &:hover {
              background: rgba(239, 68, 68, 0.1);
              
              mat-icon {
                color: #ef4444;
              }
            }
          }
        }
      }
    }

    // Main Content Styles
    .main-content {
      flex: 1;
      margin-left: 280px;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .top-header {
      background: white;
      padding: 24px 32px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      
      .header-left {
        h1 {
          margin: 0 0 4px 0;
          font-size: 28px;
          font-weight: 700;
          color: #1a202c;
        }
        
        p {
          margin: 0;
          color: #64748b;
          font-size: 16px;
        }
      }
      
      .user-info {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #ff6b6b, #e84393);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          
          mat-icon {
            color: white;
            font-size: 20px;
          }
        }
        
        .user-details {
          display: flex;
          flex-direction: column;
          
          .name {
            font-weight: 600;
            color: #1a202c;
            font-size: 14px;
          }
          
          .role {
            font-size: 12px;
            color: #64748b;
          }
        }
      }
    }

    .content-area {
      flex: 1;
      padding: 32px;
      background: #f8fafc;
    }

    // Dashboard Content
    .dashboard-content {
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
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 20px;
        
        .action-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          
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
              color: #1a202c;
            }
            
            p {
              margin: 0;
              font-size: 13px;
              color: #64748b;
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

    // Module Content
    .module-content {
      min-height: 400px;
      
      .expense-module {
        // O componente de despesas gerencia seu próprio layout
        width: 100%;
      }
      
      .coming-soon {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 400px;
        text-align: center;
        background: white;
        padding: 48px;
        border-radius: 16px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        border: 1px solid #e2e8f0;
        margin: 32px;
        
        mat-icon {
          font-size: 64px;
          color: #cbd5e1;
          margin-bottom: 16px;
        }
        
        h2 {
          margin: 0 0 8px 0;
          color: #1a202c;
        }
        
        p {
          margin: 0 0 24px 0;
          color: #64748b;
        }
        
        button {
          background: linear-gradient(135deg, #ff6b6b, #e84393) !important;
          color: white !important;
          border-radius: 8px !important;
        }
      }
    }

    // Responsive
    @media (max-width: 1024px) {
      .sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s ease;
      }
      
      .main-content {
        margin-left: 0;
      }
      
      .content-area {
        padding: 20px;
      }
      
      .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
      }
    }

    @media (max-width: 768px) {
      .top-header {
        padding: 16px 20px;
        
        .header-left h1 {
          font-size: 24px;
        }
        
        .user-details {
          display: none;
        }
      }
      
      .content-area {
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
export class DashboardComponent implements OnInit {

  selectedModule: string = 'dashboard';

  private moduleData: { [key: string]: { title: string; subtitle: string } } = {
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Visão geral do seu planejamento financeiro'
    },
    receitas: {
      title: 'Receitas',
      subtitle: 'Gerencie suas fontes de entrada'
    },
    despesas: {
      title: 'Despesas',
      subtitle: 'Monitore e controle seus gastos'
    },
    categorias: {
      title: 'Categorias',
      subtitle: 'Organize suas transações'
    },
    metas: {
      title: 'Metas',
      subtitle: 'Defina e acompanhe seus objetivos'
    },
    orcamento: {
      title: 'Orçamento',
      subtitle: 'Planeje seus gastos mensais'
    },
    relatorios: {
      title: 'Relatórios',
      subtitle: 'Análise detalhada das suas finanças'
    },
    graficos: {
      title: 'Gráficos',
      subtitle: 'Visualização dos seus dados'
    },
    perfil: {
      title: 'Meu Perfil',
      subtitle: 'Gerencie suas informações pessoais'
    }
  };

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Implementação adicional se necessário
  }

  selectModule(module: string, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    console.log('📱 Selecionando módulo:', module, 'atual:', this.selectedModule);
    this.selectedModule = module;
    console.log('📱 Módulo atualizado para:', this.selectedModule);
  }

  getModuleTitle(): string {
    return this.moduleData[this.selectedModule]?.title || 'Dashboard';
  }

  getModuleSubtitle(): string {
    return this.moduleData[this.selectedModule]?.subtitle || 'Visão geral do seu planejamento financeiro';
  }

  logout(): void {
    this.authService.logout();
  }
}
