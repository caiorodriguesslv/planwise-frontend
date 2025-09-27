import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil, catchError, of } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { ExpenseService } from '../../core/services/expense.service';
import { NotificationService } from '../../core/services/notification.service';
import { ExpenseListV2Component } from '../expenses/list/expense-list-v2.component';
import { ExpenseFormComponent } from '../expenses/form/expense-form.component';
import { CategoryListComponent } from '../categories/list/category-list.component';
import { CategoryFormComponent } from '../categories/form/category-form.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    ExpenseListV2Component,
    ExpenseFormComponent,
    CategoryListComponent,
    CategoryFormComponent
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
                 [class.active]="isDashboardActive"
                 (click)="selectModule('dashboard', $event)">
              <mat-icon>dashboard</mat-icon>
              <span>Home</span>
            </div>
          </div>

          <div class="nav-section">
            <h3>Financeiro</h3>
            <div class="nav-item" 
                 [class.active]="isReceitasActive"
                 (click)="selectModule('receitas', $event)">
              <mat-icon>trending_up</mat-icon>
              <span>Receitas</span>
              <span class="badge">Em breve</span>
            </div>
            <div class="nav-item" 
                 [class.active]="isDespesasActive"
                 (click)="selectModule('despesas', $event)">
              <mat-icon>trending_down</mat-icon>
              <span>Despesas</span>
            </div>
            <div class="nav-item" 
                 [class.active]="isCategoriasActive"
                 (click)="selectModule('categorias', $event)">
              <mat-icon>category</mat-icon>
              <span>Categorias</span>
            </div>
          </div>

          <div class="nav-section">
            <h3>Planejamento</h3>
            <div class="nav-item" 
                 [class.active]="isMetasActive"
                 (click)="selectModule('metas', $event)">
              <mat-icon>flag</mat-icon>
              <span>Metas</span>
              <span class="badge">Em breve</span>
            </div>
            <div class="nav-item" 
                 [class.active]="isOrcamentoActive"
                 (click)="selectModule('orcamento', $event)">
              <mat-icon>account_balance</mat-icon>
              <span>Orçamento</span>
              <span class="badge">Em breve</span>
            </div>
          </div>

          <div class="nav-section">
            <h3>Relatórios</h3>
            <div class="nav-item" 
                 [class.active]="isRelatoriosActive"
                 (click)="selectModule('relatorios', $event)">
              <mat-icon>analytics</mat-icon>
              <span>Relatórios</span>
              <span class="badge">Em breve</span>
            </div>
            <div class="nav-item" 
                 [class.active]="isGraficosActive"
                 (click)="selectModule('graficos', $event)">
              <mat-icon>bar_chart</mat-icon>
              <span>Gráficos</span>
              <span class="badge">Em breve</span>
            </div>
          </div>

          <div class="nav-section">
            <h3>Configurações</h3>
            <div class="nav-item" 
                 [class.active]="isPerfilActive"
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
            <h1>{{ currentModuleTitle }}</h1>
            <p>{{ currentModuleSubtitle }}</p>
          </div>
          <div class="header-right">
            <div class="user-info">
              <div class="avatar">
                <mat-icon>person</mat-icon>
              </div>
              <div class="user-details">
                <span class="name">{{ userName }}</span>
                <span class="role">{{ userRole }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Content Area -->
        <div class="content-area">
          <!-- Dashboard Content -->
          <div *ngIf="isDashboardModule" class="dashboard-content">
            
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
          <div *ngIf="isNotDashboardModule" class="module-content">
            
            <!-- Despesas Module -->
            <div *ngIf="isDespesasModule" class="expense-module">
              <app-expense-list-v2></app-expense-list-v2>
            </div>

            <!-- Nova Despesa Module -->
            <div *ngIf="isNovaDespesaModule" class="expense-form-module">
              <app-expense-form></app-expense-form>
            </div>

            <!-- Categorias Module -->
            <div *ngIf="isCategoriasModule" class="category-module">
              <app-category-list></app-category-list>
            </div>

            <!-- Nova Categoria Module -->
            <div *ngIf="isNovaCategoriaModule" class="category-form-module">
              <app-category-form></app-category-form>
            </div>
            
            <!-- Outros Módulos - Coming Soon -->
            <div *ngIf="isComingSoonModule" class="coming-soon">
              <mat-icon>build</mat-icon>
              <h2>{{ currentModuleTitle }}</h2>
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
export class DashboardComponent implements OnInit, OnDestroy {

  selectedModule: string = 'dashboard';
  private navigationListener: ((event: any) => void) | null = null;

  // Estatísticas do dashboard
  totalIncome: number = 0;
  totalExpenses: number = 0;
  balance: number = 0;
  activeGoals: number = 0;
  isLoading: boolean = false;

  // Dados do usuário (cacheados para evitar mudanças durante detecção)
  userName: string = '';
  userRole: string = '';
  
  // Dados do módulo atual (cacheados para evitar mudanças durante detecção)
  currentModuleTitle: string = 'Dashboard';
  currentModuleSubtitle: string = 'Visão geral do seu planejamento financeiro';

  // Propriedades computadas para evitar mudanças durante detecção
  isDashboardModule: boolean = true;
  isNotDashboardModule: boolean = false;
  isLoadingStats: boolean = false;
  isNotLoadingStats: boolean = true;
  
  // Propriedades para navegação ativa
  isDashboardActive: boolean = true;
  isReceitasActive: boolean = false;
  isDespesasActive: boolean = false;
  isCategoriasActive: boolean = false;
  isMetasActive: boolean = false;
  isOrcamentoActive: boolean = false;
  isRelatoriosActive: boolean = false;
  isGraficosActive: boolean = false;
  isPerfilActive: boolean = false;
  
  // Propriedades para módulos específicos
  isDespesasModule: boolean = false;
  isNovaDespesaModule: boolean = false;
  isCategoriasModule: boolean = false;
  isNovaCategoriaModule: boolean = false;
  
  // Propriedade para módulos "coming soon"
  isComingSoonModule: boolean = false;

  private destroy$ = new Subject<void>();

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
    'nova-despesa': {
      title: 'Nova Despesa',
      subtitle: 'Registre uma nova despesa'
    },
    'categorias': {
      title: 'Categorias',
      subtitle: 'Gerencie suas categorias'
    },
    'nova-categoria': {
      title: 'Nova Categoria',
      subtitle: 'Crie uma nova categoria'
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
    private router: Router,
    private expenseService: ExpenseService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Inicializar dados do usuário
    this.initializeUserData();
    
    // Inicializar propriedades computadas
    this.updateComputedProperties();
    
    // Carregar estatísticas do dashboard
    this.loadDashboardStats();
    
    // Listener para navegação entre módulos
    this.navigationListener = (event: any) => {
      // Agendar mudança para o próximo ciclo para evitar conflitos
      setTimeout(() => {
        this.selectModule(event.detail.module, undefined);
      });
    };
    window.addEventListener('navigate-to-module', this.navigationListener);
  }

  ngOnDestroy(): void {
    if (this.navigationListener) {
      window.removeEventListener('navigate-to-module', this.navigationListener);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectModule(module: string, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Usar setTimeout para agendar mudanças para o próximo ciclo
    setTimeout(() => {
      this.selectedModule = module;
      this.updateComputedProperties();
    });
  }


  /**
   * Inicializa os dados do usuário de forma segura
   */
  private initializeUserData(): void {
    // Usar setTimeout para garantir que os dados sejam definidos no próximo ciclo
    setTimeout(() => {
      this.userName = this.authService.userName || 'Usuário';
      this.userRole = this.authService.isAdmin() ? 'Administrador' : 'Usuário';
      this.cdr.markForCheck();
    });
  }

  /**
   * Atualiza as propriedades computadas de forma segura
   */
  private updateComputedProperties(): void {
    // Dados do módulo atual
    this.currentModuleTitle = this.moduleData[this.selectedModule]?.title || 'Dashboard';
    this.currentModuleSubtitle = this.moduleData[this.selectedModule]?.subtitle || 'Visão geral do seu planejamento financeiro';
    
    // Propriedades principais
    this.isDashboardModule = this.selectedModule === 'dashboard';
    this.isNotDashboardModule = this.selectedModule !== 'dashboard';
    this.isLoadingStats = this.isLoading;
    this.isNotLoadingStats = !this.isLoading;
    
    // Propriedades para navegação ativa
    this.isDashboardActive = this.selectedModule === 'dashboard';
    this.isReceitasActive = this.selectedModule === 'receitas';
    this.isDespesasActive = this.selectedModule === 'despesas';
    this.isCategoriasActive = this.selectedModule === 'categorias';
    this.isMetasActive = this.selectedModule === 'metas';
    this.isOrcamentoActive = this.selectedModule === 'orcamento';
    this.isRelatoriosActive = this.selectedModule === 'relatorios';
    this.isGraficosActive = this.selectedModule === 'graficos';
    this.isPerfilActive = this.selectedModule === 'perfil';
    
    // Propriedades para módulos específicos
    this.isDespesasModule = this.selectedModule === 'despesas';
    this.isNovaDespesaModule = this.selectedModule === 'nova-despesa';
    this.isCategoriasModule = this.selectedModule === 'categorias';
    this.isNovaCategoriaModule = this.selectedModule === 'nova-categoria';
    
    // Propriedade para módulos "coming soon"
    this.isComingSoonModule = this.selectedModule !== 'dashboard' && 
                              this.selectedModule !== 'despesas' && 
                              this.selectedModule !== 'nova-despesa' && 
                              this.selectedModule !== 'categorias' && 
                              this.selectedModule !== 'nova-categoria';
    
    // Marcar para verificação com OnPush
    this.cdr.markForCheck();
  }

  /**
   * Carrega as estatísticas do dashboard
   */
  private loadDashboardStats(): void {
    if (!this.authService.isLoggedIn) {
      return;
    }

    // Agenda a mudança de estado para o próximo ciclo
    setTimeout(() => {
      this.isLoading = true;
      this.updateComputedProperties();
    });

    // Carregar despesas
    this.expenseService.getAllExpensesList()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          this.notificationService.error('Erro ao carregar estatísticas de despesas');
          return of([]);
        })
      )
      .subscribe(expenses => {
        // Calcular total de despesas
        this.totalExpenses = expenses.reduce((total, expense) => total + expense.value, 0);
        
        // Calcular saldo (por enquanto, apenas despesas - receitas serão implementadas depois)
        this.balance = -this.totalExpenses; // Negativo porque são despesas
        
        // Agenda a mudança de estado para o próximo ciclo
        setTimeout(() => {
          this.isLoading = false;
          this.updateComputedProperties();
        });
      });
  }

  logout(): void {
    this.authService.logout();
  }
}
