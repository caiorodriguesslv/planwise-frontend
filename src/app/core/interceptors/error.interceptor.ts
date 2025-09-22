import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { TokenService } from '../services/token.service';
import { environment } from '../../../environments/environment';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const tokenService = inject(TokenService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Log do erro (apenas em desenvolvimento)
      if (environment.enableLogs) {
        console.error('HTTP Error:', error);
      }

      // Tratamento específico por status code
      switch (error.status) {
        case 401:
          // Token inválido ou expirado
          tokenService.removeToken();
          router.navigate(['/auth/login'], { 
            queryParams: { returnUrl: router.url } 
          });
          break;

        case 403:
          // Acesso negado
          console.warn('Acesso negado:', error.error?.message || 'Sem permissão');
          break;

        case 404:
          // Recurso não encontrado
          console.warn('Recurso não encontrado:', req.url);
          break;

        case 422:
          // Erro de validação
          console.warn('Erro de validação:', error.error);
          break;

        case 500:
          // Erro interno do servidor
          console.error('Erro interno do servidor:', error.error?.message);
          break;

        case 0:
          // Erro de rede ou CORS
          console.error('Erro de rede ou servidor inacessível');
          break;

        default:
          console.error('Erro HTTP não tratado:', error);
      }

      // Formatar mensagem de erro amigável
      const friendlyMessage = getFriendlyErrorMessage(error);
      
      // Retornar erro formatado
      return throwError(() => ({
        ...error,
        friendlyMessage
      }));
    })
  );
};

/**
 * Converte erros HTTP em mensagens amigáveis ao usuário
 */
function getFriendlyErrorMessage(error: HttpErrorResponse): string {
  switch (error.status) {
    case 0:
      return 'Erro de conexão. Verifique sua internet ou tente novamente.';
    
    case 400:
      return error.error?.message || 'Dados inválidos enviados.';
    
    case 401:
      return 'Sessão expirada. Faça login novamente.';
    
    case 403:
      return 'Você não tem permissão para realizar esta ação.';
    
    case 404:
      return 'Recurso solicitado não foi encontrado.';
    
    case 422:
      // Retorna erros específicos de validação se disponíveis
      if (error.error?.errors && Array.isArray(error.error.errors)) {
        return error.error.errors.join(', ');
      }
      return error.error?.message || 'Dados inválidos.';
    
    case 429:
      return 'Muitas tentativas. Tente novamente em alguns minutos.';
    
    case 500:
      return 'Erro interno do servidor. Tente novamente em alguns instantes.';
    
    case 502:
    case 503:
    case 504:
      return 'Serviço temporariamente indisponível. Tente novamente.';
    
    default:
      return error.error?.message || 'Ocorreu um erro inesperado. Tente novamente.';
  }
}
