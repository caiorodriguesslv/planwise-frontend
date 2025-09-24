import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn, CanMatchFn } from '@angular/router';
import { map, take, tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

/**
 * Guard que verifica se o usuário está autenticado
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  console.log('🔐 AuthGuard: Verificando autenticação...', {
    isLoggedIn: authService.isLoggedIn,
    hasToken: authService.userId !== null,
    url: state.url
  });

  // Aguarda a inicialização completa do AuthService
  return authService.waitForInitialization().pipe(
    tap(isAuthenticated => {
      console.log('🔐 AuthGuard: Estado verificado após inicialização:', isAuthenticated);
    }),
    map(isAuthenticated => {
      // Dupla verificação: tanto o Observable quanto a propriedade direta
      const finalCheck = isAuthenticated || authService.isLoggedIn;
      
      if (finalCheck) {
        console.log('✅ AuthGuard: Usuário autenticado, permitindo acesso');
        return true;
      }

      console.log('❌ AuthGuard: Usuário não autenticado, redirecionando para login');
      
      // Armazena a URL de destino para redirecionamento após login
      const returnUrl = state.url;
      
      // Notifica sobre necessidade de login
      notificationService.warning('Você precisa fazer login para acessar esta página.');
      
      // Redireciona para login com URL de retorno
      router.navigate(['/auth/login'], { 
        queryParams: { returnUrl } 
      });
      
      return false;
    })
  );
};

/**
 * Guard que verifica se o usuário está autenticado (para lazy loading)
 */
export const authMatchGuard: CanMatchFn = (route, segments) => {
  const authService = inject(AuthService);
  return authService.isLoggedIn;
};

/**
 * Guard que verifica se o usuário NÃO está autenticado (para páginas de login/register)
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('👤 GuestGuard: Verificando se usuário é guest...', {
    isLoggedIn: authService.isLoggedIn,
    url: state.url
  });

  // Aguarda a inicialização completa do AuthService
  return authService.waitForInitialization().pipe(
    map(isAuthenticated => {
      const isLoggedIn = isAuthenticated || authService.isLoggedIn;
      
      if (!isLoggedIn) {
        console.log('✅ GuestGuard: Usuário não autenticado, permitindo acesso à página guest');
        return true;
      }

      console.log('🔄 GuestGuard: Usuário já está logado, redirecionando para dashboard');
      // Se já está logado, redireciona para dashboard
      router.navigate(['/dashboard']);
      return false;
    })
  );
};

/**
 * Guard que verifica se o usuário tem role de ADMIN
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  if (!authService.isLoggedIn) {
    notificationService.warning('Você precisa fazer login.');
    router.navigate(['/auth/login'], { 
      queryParams: { returnUrl: state.url } 
    });
    return false;
  }

  if (authService.isAdmin()) {
    return true;
  }

  // Usuário não tem permissão de admin
  notificationService.forbidden();
  router.navigate(['/dashboard']);
  return false;
};

/**
 * Guard que verifica role específica
 */
export const roleGuard = (requiredRole: string): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const notificationService = inject(NotificationService);

    if (!authService.isLoggedIn) {
      notificationService.warning('Você precisa fazer login.');
      router.navigate(['/auth/login'], { 
        queryParams: { returnUrl: state.url } 
      });
      return false;
    }

    if (authService.hasRole(requiredRole)) {
      return true;
    }

    // Usuário não tem a role necessária
    notificationService.forbidden();
    router.navigate(['/dashboard']);
    return false;
  };
};
