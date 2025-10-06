import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSidenavModule } from '@angular/material/sidenav';
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
    MatToolbarModule,
    MatTooltipModule,
    MatSidenavModule
  ],
  template: `
    <div class="layout-container">
      <!-- Mobile Overlay -->
      <div class="mobile-overlay" 
           [class.active]="isMobileMenuOpen()" 
           (click)="toggleMobileMenu()"></div>

      <!-- Sidebar -->
      <div class="sidebar" 
           [class.mobile-open]="isMobileMenuOpen()">
        
        <!-- Sidebar Header -->
        <div class="sidebar-header">
          <div class="logo">
            <div class="logo-icon">
              <mat-icon>account_balance_wallet</mat-icon>
            </div>
            <span class="logo-text">PlanWise</span>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="sidebar-nav">
          <!-- Principal Section -->
          <div class="nav-section">
            <h3 class="section-title">Principal</h3>
            <div class="nav-item" 
                 [class.active]="isRouteActive('/dashboard')"
                 (click)="navigateTo('/dashboard', $event)">
              <div class="nav-icon">
                <mat-icon>dashboard</mat-icon>
              </div>
              <span class="nav-text">Dashboard</span>
            </div>
          </div>

          <!-- Financeiro Section -->
          <div class="nav-section">
            <h3 class="section-title">Financeiro</h3>
            
            <div class="nav-item" 
                 [class.active]="isRouteActive('/dashboard/expenses')"
                 (click)="navigateTo('/dashboard/expenses', $event)">
              <div class="nav-icon">
                <mat-icon>trending_down</mat-icon>
              </div>
              <span class="nav-text">Despesas</span>
            </div>

            <div class="nav-item" 
                 [class.disabled]="true">
              <div class="nav-icon">
                <mat-icon>trending_up</mat-icon>
              </div>
              <span class="nav-text">Receitas</span>
              <span class="badge">Em breve</span>
            </div>

            <div class="nav-item" 
                 [class.active]="isRouteActive('/dashboard/categories')"
                 (click)="navigateTo('/dashboard/categories', $event)">
              <div class="nav-icon">
                <mat-icon>category</mat-icon>
              </div>
              <span class="nav-text">Categorias</span>
            </div>
          </div>

          <!-- Planejamento Section -->
          <div class="nav-section">
            <h3 class="section-title">Planejamento</h3>
            
            <div class="nav-item" 
                 [class.disabled]="true">
              <div class="nav-icon">
                <mat-icon>flag</mat-icon>
              </div>
              <span class="nav-text">Metas</span>
              <span class="badge">Em breve</span>
            </div>

            <div class="nav-item" 
                 [class.disabled]="true">
              <div class="nav-icon">
                <mat-icon>account_balance</mat-icon>
              </div>
              <span class="nav-text">Orçamento</span>
              <span class="badge">Em breve</span>
            </div>
          </div>

          <!-- Relatórios Section -->
          <div class="nav-section">
            <h3 class="section-title">Relatórios</h3>
            
            <div class="nav-item" 
                 [class.disabled]="true">
              <div class="nav-icon">
                <mat-icon>analytics</mat-icon>
              </div>
              <span class="nav-text">Relatórios</span>
              <span class="badge">Em breve</span>
            </div>

            <div class="nav-item" 
                 [class.disabled]="true">
              <div class="nav-icon">
                <mat-icon>bar_chart</mat-icon>
              </div>
              <span class="nav-text">Gráficos</span>
              <span class="badge">Em breve</span>
            </div>
          </div>

          <!-- Configurações Section -->
          <div class="nav-section">
            <h3 class="section-title">Configurações</h3>
            
            <div class="nav-item" 
                 [class.active]="isRouteActive('/dashboard/perfil')"
                 (click)="navigateTo('/dashboard/perfil', $event)">
              <div class="nav-icon">
                <mat-icon>person</mat-icon>
              </div>
              <span class="nav-text">Meu Perfil</span>
            </div>

            <div class="nav-item logout-item" 
                 (click)="logout()">
              <div class="nav-icon">
                <mat-icon>logout</mat-icon>
              </div>
              <span class="nav-text">Sair</span>
            </div>
          </div>
        </nav>
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Top Header -->
        <div class="top-header">
          <div class="header-left">
            <button class="mobile-menu-btn" 
                    (click)="toggleMobileMenu()" 
                    mat-icon-button
                    *ngIf="isMobile()">
              <mat-icon>menu</mat-icon>
            </button>
            <div class="page-info">
              <h1>{{ getPageTitle() }}</h1>
              <p>{{ getPageSubtitle() }}</p>
            </div>
          </div>
          <div class="header-right">
            <div class="user-info">
              <div class="user-details">
                <span class="name">{{ authService.userName || 'Administrador' }}</span>
                <span class="role">{{ authService.isAdmin() ? 'Administrador' : 'Usuário' }}</span>
              </div>
              <div class="avatar">
                <mat-icon>person</mat-icon>
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
      background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
      position: relative;
    }

    // Mobile Overlay
    .mobile-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 998;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      
      &.active {
        opacity: 1;
        visibility: visible;
      }
    }

    // Sidebar Styles
    .sidebar {
      width: 280px;
      background: linear-gradient(180deg, #0f0f23 0%, #1a1a2e 100%);
      box-shadow: 4px 0 20px rgba(0, 0, 0, 0.4);
      position: fixed;
      height: 100vh;
      overflow: hidden;
      z-index: 1000;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      
      &.collapsed {
        width: 70px;
        
        .sidebar-header {
          padding: 20px 16px;
          
          .logo-text {
            opacity: 0;
            transform: translateX(-10px);
          }
          
          .collapse-btn {
            transform: rotate(180deg);
          }
        }
        
        .section-title {
          opacity: 0;
          transform: translateX(-10px);
        }
        
        .nav-text {
          opacity: 0;
          transform: translateX(-10px);
        }
        
        .badge {
          opacity: 0;
          transform: translateX(-10px);
        }
      }
      
      &.mobile-open {
        transform: translateX(0);
      }
      
    }

    .sidebar-header {
      padding: 24px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
      height: 80px;
      
      .logo {
        display: flex;
        align-items: center;
        gap: 12px;
        color: white;
        flex: 1;
        
        .logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--planwise-red), #e84393);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          
          mat-icon {
            font-size: 24px;
            color: white;
          }
        }
        
        .logo-text {
          font-size: 20px;
          font-weight: 700;
          background: linear-gradient(135deg, var(--planwise-red), #e84393);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          transition: all 0.3s ease;
        }
      }
      
      .collapse-btn {
        color: rgba(255, 255, 255, 0.7);
        transition: all 0.3s ease;
        
        &:hover {
          color: #ff6b6b;
          background: rgba(255, 107, 107, 0.1);
        }
      }
    }

    .sidebar-nav {
      padding: 20px 0;
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      
      .nav-section {
        margin-bottom: 16px;
        flex-shrink: 0;
        
        .section-title {
          color: rgba(255, 255, 255, 0.6);
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin: 0 0 12px 20px;
          padding: 0;
          transition: all 0.3s ease;
        }
        
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 20px;
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          cursor: pointer;
          margin: 2px 0;
          border-radius: 0 25px 25px 0;
          
          .nav-icon {
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            
            mat-icon {
              font-size: 20px;
              width: 20px;
              height: 20px;
            }
          }
          
          .nav-text {
            font-weight: 500;
            flex: 1;
            transition: all 0.3s ease;
          }
          
          .badge {
            background: rgba(255, 107, 107, 0.2);
            color: #ff6b6b;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            transition: all 0.3s ease;
          }
          
          &:hover:not(.disabled) {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            transform: translateX(4px);
            
            .nav-icon mat-icon {
              color: #ff6b6b;
            }
          }
          
          &.active {
            background: linear-gradient(135deg, var(--planwise-red), #e84393);
            color: white;
            transform: translateX(4px);
            
            &::before {
              content: '';
              position: absolute;
              left: 0;
              top: 0;
              bottom: 0;
              width: 4px;
              background: white;
              border-radius: 0 2px 2px 0;
            }
            
            .nav-icon mat-icon {
              color: white;
            }
          }
          
          &.disabled {
            opacity: 0.5;
            cursor: not-allowed;
            
            &:hover {
              transform: none;
              background: transparent;
            }
          }
          
          &.logout-item {
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            margin-top: 8px;
            padding-top: 8px;
            
            &:hover {
              background: rgba(239, 68, 68, 0.1);
              
              .nav-icon mat-icon {
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
      background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
      transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      
    }

    .top-header {
      background: #211A3D !important;
      padding: 20px 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 0;
      margin: 0;
      max-width: none;
      width: calc(100% - 280px);
      margin-left: 280px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
      position: fixed;
      top: 0;
      left: 0;
      transform: none;
      z-index: 999;
      height: 80px;
      min-height: 80px;
      
      .header-left {
        display: flex;
        align-items: center;
        gap: 16px;
        
        .mobile-menu-btn {
          color: rgba(255, 255, 255, 0.8);
          
          &:hover {
            color: #ff6b6b;
            background: rgba(255, 107, 107, 0.2);
          }
        }
        
        .expand-sidebar-btn {
          color: rgba(255, 255, 255, 0.8);
          margin-right: 8px;
          
          &:hover {
            color: #ff6b6b;
            background: rgba(255, 107, 107, 0.2);
          }
        }
        
        .page-info {
          h1 {
            margin: 0 0 4px 0;
            font-size: 28px;
            font-weight: 700;
            color: white;
          }
          
          p {
            margin: 0;
            color: rgba(255, 255, 255, 0.7);
            font-size: 16px;
          }
        }
      }
      
      .user-info {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--planwise-red), #e84393);
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
            color: white;
            font-size: 14px;
          }
          
          .role {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.7);
          }
        }
      }
    }

    .content-area {
      flex: 1;
      background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
      padding: 32px;
      padding-top: 100px;
      min-height: calc(100vh - 80px);
    }

    // Utility Classes
    .hidden {
      opacity: 0 !important;
      transform: translateX(-10px) !important;
    }

    // Responsive Design
    @media (max-width: 1024px) {
      .sidebar {
        // Só ocultar se for mobile e não estiver aberto
        &:not(.mobile-open) {
          transform: translateX(-100%);
        }
        
        &.mobile-open {
          transform: translateX(0);
        }
      }
      
      .main-content {
        margin-left: 0;
        
      }
    }

    @media (max-width: 768px) {
      .top-header {
        padding: 16px 20px;
        
        .header-left .page-info h1 {
          font-size: 24px;
        }
        
        .user-details {
          display: none;
        }
      }
      
      .content-area {
        padding: 16px;
      }
    }

    @media (max-width: 480px) {
      .top-header {
        padding: 12px 16px;
        
        .header-left .page-info {
          h1 {
            font-size: 20px;
          }
          
          p {
            font-size: 14px;
          }
        }
      }
      
      .content-area {
        padding: 12px;
      }
    }

    // Dark mode support
    @media (prefers-color-scheme: dark) {
      .main-content {
        background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
      }
      
      .top-header {
        background: linear-gradient(135deg, var(--planwise-bg-secondary) 0%, var(--planwise-bg-tertiary) 100%) !important;
        border-bottom-color: rgba(255, 255, 255, 0.1);
        
        .header-left .page-info {
          h1 {
            color: white;
          }
          
          p {
            color: rgba(255, 255, 255, 0.7);
          }
        }
        
        .user-details {
          .name {
            color: white;
          }
          
          .role {
            color: rgba(255, 255, 255, 0.7);
          }
        }
      }
      
      .content-area {
        background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
      }
    }
  `]
})
export class MainLayoutComponent implements OnInit {

  currentRoute: string = '';
  
  // Signals para estado reativo
  private _isMobileMenuOpen = signal(false);
  private _isMobile = signal(false);

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
    },
    '/dashboard/categories': {
      title: 'Categorias',
      subtitle: 'Gerencie suas categorias'
    },
    '/dashboard/categories/list': {
      title: 'Lista de Categorias',
      subtitle: 'Visualize todas as suas categorias'
    },
    '/dashboard/categories/new': {
      title: 'Nova Categoria',
      subtitle: 'Adicione uma nova categoria'
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
    
    // Verificar se é mobile
    this.checkMobile();
    
    // Escutar mudanças de tamanho da tela
    window.addEventListener('resize', () => this.checkMobile());
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

  // Getters para signals
  isMobileMenuOpen(): boolean {
    return this._isMobileMenuOpen();
  }

  isMobile(): boolean {
    return this._isMobile();
  }

  toggleMobileMenu(): void {
    this._isMobileMenuOpen.set(!this._isMobileMenuOpen());
  }

  checkMobile(): void {
    this._isMobile.set(window.innerWidth <= 1024);
    
    // Se não é mobile, fechar menu mobile
    if (!this.isMobile()) {
      this._isMobileMenuOpen.set(false);
    }
  }
}
