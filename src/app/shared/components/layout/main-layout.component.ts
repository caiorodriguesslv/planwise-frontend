import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { filter } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule
  ],
  template: `
    <div class="layout-container">
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
                 [class.active]="isRouteActive('/dashboard')"
                 (click)="navigateTo('/dashboard', $event)">
              <mat-icon>dashboard</mat-icon>
              <span>Dashboard</span>
            </div>
          </div>

          <div class="nav-section">
            <h3>Financeiro</h3>
            <div class="nav-item" 
                 [class.active]="isRouteActive('/dashboard/receitas')"
                 (click)="navigateTo('/dashboard/receitas', $event)">
              <mat-icon>trending_up</mat-icon>
              <span>Receitas</span>
              <span class="badge">Em breve</span>
            </div>
            <div class="nav-item" 
                 [class.active]="isRouteActive('/dashboard/expenses')"
                 (click)="navigateTo('/dashboard/expenses', $event)">
              <mat-icon>trending_down</mat-icon>
              <span>Despesas</span>
            </div>
            <div class="nav-item" 
                 [class.active]="isRouteActive('/dashboard/categorias')"
                 (click)="navigateTo('/dashboard/categorias', $event)">
              <mat-icon>category</mat-icon>
              <span>Categorias</span>
              <span class="badge">Em breve</span>
            </div>
          </div>

          <div class="nav-section">
            <h3>Planejamento</h3>
            <div class="nav-item" 
                 [class.active]="isRouteActive('/dashboard/metas')"
                 (click)="navigateTo('/dashboard/metas', $event)">
              <mat-icon>flag</mat-icon>
              <span>Metas</span>
              <span class="badge">Em breve</span>
            </div>
            <div class="nav-item" 
                 [class.active]="isRouteActive('/dashboard/orcamento')"
                 (click)="navigateTo('/dashboard/orcamento', $event)">
              <mat-icon>account_balance</mat-icon>
              <span>Orçamento</span>
              <span class="badge">Em breve</span>
            </div>
          </div>

          <div class="nav-section">
            <h3>Relatórios</h3>
            <div class="nav-item" 
                 [class.active]="isRouteActive('/dashboard/relatorios')"
                 (click)="navigateTo('/dashboard/relatorios', $event)">
              <mat-icon>analytics</mat-icon>
              <span>Relatórios</span>
              <span class="badge">Em breve</span>
            </div>
            <div class="nav-item" 
                 [class.active]="isRouteActive('/dashboard/graficos')"
                 (click)="navigateTo('/dashboard/graficos', $event)">
              <mat-icon>bar_chart</mat-icon>
              <span>Gráficos</span>
              <span class="badge">Em breve</span>
            </div>
          </div>

          <div class="nav-section">
            <h3>Configurações</h3>
            <div class="nav-item" 
                 [class.active]="isRouteActive('/dashboard/perfil')"
                 (click)="navigateTo('/dashboard/perfil', $event)">
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
            <h1>{{ getPageTitle() }}</h1>
            <p>{{ getPageSubtitle() }}</p>
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
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .layout-container {
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
          cursor: pointer;
          
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
      background: #f8fafc;
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
    }
  `]
})
export class MainLayoutComponent implements OnInit {

  currentRoute: string = '';

  private routeTitles: { [key: string]: { title: string; subtitle: string } } = {
    '/dashboard': {
      title: 'Dashboard',
      subtitle: 'Visão geral do seu planejamento financeiro'
    },
    '/dashboard/expenses': {
      title: 'Despesas',
      subtitle: 'Gerencie e monitore todos os seus gastos'
    },
    '/dashboard/expenses/list': {
      title: 'Lista de Despesas',
      subtitle: 'Todas as suas despesas organizadas'
    },
    '/dashboard/expenses/new': {
      title: 'Nova Despesa',
      subtitle: 'Adicione uma nova despesa ao seu controle'
    },
    '/dashboard/receitas': {
      title: 'Receitas',
      subtitle: 'Gerencie suas fontes de entrada'
    },
    '/dashboard/categorias': {
      title: 'Categorias',
      subtitle: 'Organize suas transações'
    },
    '/dashboard/metas': {
      title: 'Metas',
      subtitle: 'Defina e acompanhe seus objetivos'
    },
    '/dashboard/orcamento': {
      title: 'Orçamento',
      subtitle: 'Planeje seus gastos mensais'
    },
    '/dashboard/relatorios': {
      title: 'Relatórios',
      subtitle: 'Análise detalhada das suas finanças'
    },
    '/dashboard/graficos': {
      title: 'Gráficos',
      subtitle: 'Visualização dos seus dados'
    },
    '/dashboard/perfil': {
      title: 'Meu Perfil',
      subtitle: 'Gerencie suas informações pessoais'
    }
  };

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Escutar mudanças de rota para atualizar o título
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.url;
    });
    
    // Definir rota inicial
    this.currentRoute = this.router.url;
  }

  navigateTo(route: string, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.router.navigate([route]);
  }

  isRouteActive(route: string): boolean {
    if (route === '/dashboard') {
      return this.currentRoute === '/dashboard';
    }
    return this.currentRoute.startsWith(route);
  }

  getPageTitle(): string {
    // Buscar por rota exata primeiro
    let routeData = this.routeTitles[this.currentRoute];
    
    // Se não encontrar, buscar por rota que inclui parâmetros
    if (!routeData) {
      for (const route in this.routeTitles) {
        if (this.currentRoute.startsWith(route) && route !== '/dashboard') {
          routeData = this.routeTitles[route];
          break;
        }
      }
    }
    
    // Se ainda não encontrar e a rota contém /edit/, mostrar "Editar Despesa"
    if (!routeData && this.currentRoute.includes('/expenses/') && this.currentRoute.includes('/edit')) {
      return 'Editar Despesa';
    }
    
    // Se ainda não encontrar e a rota contém um ID de despesa, mostrar "Detalhes da Despesa"
    if (!routeData && this.currentRoute.match(/\/expenses\/\d+$/)) {
      return 'Detalhes da Despesa';
    }
    
    return routeData?.title || 'Dashboard';
  }

  getPageSubtitle(): string {
    // Buscar por rota exata primeiro
    let routeData = this.routeTitles[this.currentRoute];
    
    // Se não encontrar, buscar por rota que inclui parâmetros
    if (!routeData) {
      for (const route in this.routeTitles) {
        if (this.currentRoute.startsWith(route) && route !== '/dashboard') {
          routeData = this.routeTitles[route];
          break;
        }
      }
    }
    
    // Se ainda não encontrar e a rota contém /edit/, mostrar subtitle para edição
    if (!routeData && this.currentRoute.includes('/expenses/') && this.currentRoute.includes('/edit')) {
      return 'Modifique os dados da despesa selecionada';
    }
    
    // Se ainda não encontrar e a rota contém um ID de despesa, mostrar subtitle para detalhes
    if (!routeData && this.currentRoute.match(/\/expenses\/\d+$/)) {
      return 'Informações completas sobre a despesa selecionada';
    }
    
    return routeData?.subtitle || 'Visão geral do seu planejamento financeiro';
  }

  logout(): void {
    this.authService.logout();
  }
}
