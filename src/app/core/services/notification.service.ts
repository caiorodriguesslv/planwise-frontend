import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

export interface NotificationOptions {
  duration?: number;
  action?: string;
  panelClass?: string[];
  horizontalPosition?: 'start' | 'center' | 'end' | 'left' | 'right';
  verticalPosition?: 'top' | 'bottom';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private defaultConfig: MatSnackBarConfig = {
    duration: 4000,
    horizontalPosition: 'end',
    verticalPosition: 'top'
  };

  constructor(private snackBar: MatSnackBar) {}

  /**
   * Exibe notificação de sucesso
   */
  success(message: string, options?: NotificationOptions): void {
    this.show(message, {
      ...options,
      panelClass: ['success-snackbar', ...(options?.panelClass || [])]
    });
  }

  /**
   * Exibe notificação de erro
   */
  error(message: string, options?: NotificationOptions): void {
    this.show(message, {
      ...options,
      duration: 6000, // Erros ficam mais tempo na tela
      panelClass: ['error-snackbar', ...(options?.panelClass || [])]
    });
  }

  /**
   * Exibe notificação de aviso
   */
  warning(message: string, options?: NotificationOptions): void {
    this.show(message, {
      ...options,
      panelClass: ['warning-snackbar', ...(options?.panelClass || [])]
    });
  }

  /**
   * Exibe notificação de informação
   */
  info(message: string, options?: NotificationOptions): void {
    this.show(message, {
      ...options,
      panelClass: ['info-snackbar', ...(options?.panelClass || [])]
    });
  }

  /**
   * Exibe notificação genérica
   */
  show(message: string, options?: NotificationOptions): void {
    const config: MatSnackBarConfig = {
      ...this.defaultConfig,
      ...options,
      panelClass: options?.panelClass || []
    };

    this.snackBar.open(message, options?.action || 'Fechar', config);
  }

  /**
   * Exibe notificação com ação personalizada
   */
  showWithAction(
    message: string, 
    action: string, 
    callback: () => void,
    options?: NotificationOptions
  ): void {
    const config: MatSnackBarConfig = {
      ...this.defaultConfig,
      ...options,
      duration: 8000 // Mais tempo para ações
    };

    const snackBarRef = this.snackBar.open(message, action, config);
    
    snackBarRef.onAction().subscribe(() => {
      callback();
    });
  }

  /**
   * Exibe notificação de confirmação com ação de desfazer
   */
  showUndo(
    message: string,
    undoCallback: () => void,
    options?: NotificationOptions
  ): void {
    this.showWithAction(
      message,
      'Desfazer',
      undoCallback,
      {
        ...options,
        duration: 5000,
        panelClass: ['undo-snackbar', ...(options?.panelClass || [])]
      }
    );
  }

  /**
   * Fecha todas as notificações
   */
  dismiss(): void {
    this.snackBar.dismiss();
  }

  /**
   * Exibe notificação de loading (sem duração)
   */
  showLoading(message: string = 'Processando...'): void {
    this.show(message, {
      duration: 0, // Infinito até ser dismissal manual
      panelClass: ['loading-snackbar']
    });
  }

  /**
   * Helpers para mensagens comuns
   */
  
  // Operações CRUD
  savedSuccessfully(entity: string = 'Item'): void {
    this.success(`${entity} salvo com sucesso!`);
  }

  updatedSuccessfully(entity: string = 'Item'): void {
    this.success(`${entity} atualizado com sucesso!`);
  }

  deletedSuccessfully(entity: string = 'Item'): void {
    this.success(`${entity} excluído com sucesso!`);
  }

  // Erros comuns
  saveError(): void {
    this.error('Erro ao salvar. Tente novamente.');
  }

  loadError(): void {
    this.error('Erro ao carregar dados. Verifique sua conexão.');
  }

  validationError(): void {
    this.warning('Verifique os dados informados.');
  }

  networkError(): void {
    this.error('Erro de conexão. Verifique sua internet.');
  }

  unauthorized(): void {
    this.warning('Sessão expirada. Faça login novamente.');
  }

  forbidden(): void {
    this.warning('Você não tem permissão para esta ação.');
  }
}
