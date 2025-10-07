import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';
import { NavigationSection, NavigationItem, UserInfo } from './types';
import { MobileOverlayComponent } from './mobile-overlay/mobile-overlay.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    HeaderComponent,
    MobileOverlayComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {

  currentRoute: string = '';
  
  // Signals para estado reativo
  private _isMobileMenuOpen = signal(false);
  private _isMobile = signal(false);

  // Navigation sections
  navigationSections: NavigationSection[] = [
    {
      title: 'Principal',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: 'dashboard',
          route: '/dashboard/dashboard'
        }
      ]
    },
    {
      title: 'Financeiro',
      items: [
        {
          id: 'expenses',
          label: 'Despesas',
          icon: 'trending_down',
          route: '/dashboard/expenses'
        },
        {
          id: 'income',
          label: 'Receitas',
          icon: 'trending_up',
          route: '/dashboard/income',
          disabled: true,
          badge: 'Em breve'
        },
        {
          id: 'categories',
          label: 'Categorias',
          icon: 'category',
          route: '/dashboard/categories'
        }
      ]
    },
    {
      title: 'Planejamento',
      items: [
        {
          id: 'goals',
          label: 'Metas',
          icon: 'flag',
          route: '/dashboard/goals',
          disabled: true,
          badge: 'Em breve'
        },
        {
          id: 'budget',
          label: 'Orçamento',
          icon: 'account_balance',
          route: '/dashboard/budget',
          disabled: true,
          badge: 'Em breve'
        }
      ]
    },
    {
      title: 'Relatórios',
      items: [
        {
          id: 'reports',
          label: 'Relatórios',
          icon: 'analytics',
          route: '/dashboard/reports',
          disabled: true,
          badge: 'Em breve'
        },
        {
          id: 'charts',
          label: 'Gráficos',
          icon: 'bar_chart',
          route: '/dashboard/charts',
          disabled: true,
          badge: 'Em breve'
        }
      ]
    },
    {
      title: 'Configurações',
      items: [
        {
          id: 'profile',
          label: 'Meu Perfil',
          icon: 'person',
          route: '/dashboard/profile'
        },
        {
          id: 'logout',
          label: 'Sair',
          icon: 'logout',
          route: '/logout'
        }
      ]
    }
  ];

  // User info
  get userInfo(): UserInfo {
    return {
      name: this.authService.userName || 'Administrador',
      role: this.authService.isAdmin() ? 'Administrador' : 'Usuário'
    };
  }

  private routeTitles: { [key: string]: { title: string; subtitle: string } } = {
    '/dashboard': {
      title: 'Dashboard',
      subtitle: 'Visão geral do seu planejamento financeiro'
    },
    '/dashboard/dashboard': {
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
    '/dashboard/categories': {
      title: 'Categorias',
      subtitle: 'Organize suas despesas por categorias'
    },
    '/dashboard/categories/list': {
      title: 'Lista de Categorias',
      subtitle: 'Todas as suas categorias organizadas'
    },
    '/dashboard/categories/new': {
      title: 'Nova Categoria',
      subtitle: 'Crie uma nova categoria para organizar suas despesas'
    },
    '/dashboard/profile': {
      title: 'Meu Perfil',
      subtitle: 'Gerencie suas informações pessoais'
    }
  };

  constructor(
    private router: Router,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    // Detectar mudanças de rota
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.url;
      });

    // Detectar tamanho da tela
    this.checkMobile();
    window.addEventListener('resize', () => this.checkMobile());
  }

  onNavigationItemClick(item: NavigationItem): void {
    if (item.id === 'logout') {
      this.logout();
    } else if (!item.disabled) {
      // Fechar menu mobile se estiver aberto
      if (this.isMobile()) {
        this.toggleMobileMenu();
      }
      
      this.router.navigate([item.route]);
    }
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
    
    // Se ainda não encontrar e a rota contém /edit/, mostrar título para edição
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

  onUserClick(): void {
    // Implementar ação do usuário (ex: abrir menu de perfil)
    console.log('User clicked');
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