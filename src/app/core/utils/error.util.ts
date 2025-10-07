/**
 * Utilitários para manipulação de erros
 */
export class ErrorUtil {
  
  /**
   * Obtém a mensagem de erro de forma segura
   */
  static getErrorMessage(error: any): string {
    if (!error) return 'Erro desconhecido';
    
    // Se é uma string, retorna diretamente
    if (typeof error === 'string') {
      return error;
    }
    
    // Se tem propriedade message
    if (error.message) {
      return error.message;
    }
    
    // Se tem propriedade error.message (erro aninhado)
    if (error.error?.message) {
      return error.error.message;
    }
    
    // Se tem propriedade error (erro HTTP)
    if (error.error) {
      return typeof error.error === 'string' ? error.error : 'Erro na requisição';
    }
    
    // Se tem propriedade statusText
    if (error.statusText) {
      return error.statusText;
    }
    
    // Se tem propriedade status
    if (error.status) {
      return this.getHttpErrorMessage(error.status);
    }
    
    // Se é um objeto, tenta converter para string
    if (typeof error === 'object') {
      try {
        return JSON.stringify(error);
      } catch {
        return 'Erro desconhecido';
      }
    }
    
    return 'Erro desconhecido';
  }

  /**
   * Obtém mensagem de erro baseada no status HTTP
   */
  static getHttpErrorMessage(status: number): string {
    const errorMessages: { [key: number]: string } = {
      400: 'Requisição inválida',
      401: 'Não autorizado',
      403: 'Acesso negado',
      404: 'Recurso não encontrado',
      409: 'Conflito de dados',
      422: 'Dados inválidos',
      429: 'Muitas requisições',
      500: 'Erro interno do servidor',
      502: 'Servidor indisponível',
      503: 'Serviço temporariamente indisponível',
      504: 'Timeout da requisição'
    };
    
    return errorMessages[status] || `Erro HTTP ${status}`;
  }

  /**
   * Verifica se é um erro de rede
   */
  static isNetworkError(error: any): boolean {
    return error?.status === 0 || error?.status >= 500;
  }

  /**
   * Verifica se é um erro de autenticação
   */
  static isAuthError(error: any): boolean {
    return error?.status === 401 || error?.status === 403;
  }

  /**
   * Verifica se é um erro de validação
   */
  static isValidationError(error: any): boolean {
    return error?.status === 422 || error?.status === 400;
  }

  /**
   * Verifica se é um erro de servidor
   */
  static isServerError(error: any): boolean {
    return error?.status >= 500;
  }

  /**
   * Verifica se é um erro de cliente
   */
  static isClientError(error: any): boolean {
    return error?.status >= 400 && error?.status < 500;
  }

  /**
   * Obtém o tipo de erro
   */
  static getErrorType(error: any): 'network' | 'auth' | 'validation' | 'server' | 'client' | 'unknown' {
    if (this.isNetworkError(error)) return 'network';
    if (this.isAuthError(error)) return 'auth';
    if (this.isValidationError(error)) return 'validation';
    if (this.isServerError(error)) return 'server';
    if (this.isClientError(error)) return 'client';
    return 'unknown';
  }

  /**
   * Obtém a severidade do erro
   */
  static getErrorSeverity(error: any): 'low' | 'medium' | 'high' | 'critical' {
    const errorType = this.getErrorType(error);
    
    switch (errorType) {
      case 'network':
        return 'high';
      case 'auth':
        return 'medium';
      case 'validation':
        return 'low';
      case 'server':
        return 'critical';
      case 'client':
        return 'medium';
      default:
        return 'medium';
    }
  }

  /**
   * Obtém a cor do erro baseada na severidade
   */
  static getErrorColor(error: any): string {
    const severity = this.getErrorSeverity(error);
    
    switch (severity) {
      case 'low':
        return '#f59e0b'; // yellow
      case 'medium':
        return '#ef4444'; // red
      case 'high':
        return '#dc2626'; // dark red
      case 'critical':
        return '#991b1b'; // darker red
      default:
        return '#6b7280'; // gray
    }
  }

  /**
   * Obtém o ícone do erro baseado no tipo
   */
  static getErrorIcon(error: any): string {
    const errorType = this.getErrorType(error);
    
    switch (errorType) {
      case 'network':
        return 'wifi_off';
      case 'auth':
        return 'lock';
      case 'validation':
        return 'warning';
      case 'server':
        return 'error';
      case 'client':
        return 'info';
      default:
        return 'help';
    }
  }

  /**
   * Obtém a mensagem de erro amigável
   */
  static getFriendlyErrorMessage(error: any): string {
    const errorType = this.getErrorType(error);
    
    switch (errorType) {
      case 'network':
        return 'Verifique sua conexão com a internet e tente novamente.';
      case 'auth':
        return 'Sua sessão expirou. Faça login novamente.';
      case 'validation':
        return 'Verifique os dados informados e tente novamente.';
      case 'server':
        return 'O servidor está temporariamente indisponível. Tente novamente em alguns minutos.';
      case 'client':
        return 'Ocorreu um erro na requisição. Tente novamente.';
      default:
        return 'Ocorreu um erro inesperado. Tente novamente.';
    }
  }

  /**
   * Obtém detalhes do erro para debug
   */
  static getErrorDetails(error: any): any {
    return {
      message: this.getErrorMessage(error),
      type: this.getErrorType(error),
      severity: this.getErrorSeverity(error),
      status: error?.status,
      statusText: error?.statusText,
      url: error?.url,
      timestamp: new Date().toISOString(),
      stack: error?.stack
    };
  }

  /**
   * Loga o erro no console
   */
  static logError(error: any, context?: string): void {
    const details = this.getErrorDetails(error);
    
    console.group(`🚨 Error${context ? ` in ${context}` : ''}`);
    console.error('Message:', details.message);
    console.error('Type:', details.type);
    console.error('Severity:', details.severity);
    console.error('Status:', details.status);
    console.error('Timestamp:', details.timestamp);
    if (details.stack) {
      console.error('Stack:', details.stack);
    }
    console.groupEnd();
  }

  /**
   * Cria um erro personalizado
   */
  static createError(message: string, type: string = 'custom', status?: number): Error {
    const error = new Error(message);
    (error as any).type = type;
    (error as any).status = status;
    return error;
  }

  /**
   * Verifica se um erro é recuperável
   */
  static isRecoverableError(error: any): boolean {
    const errorType = this.getErrorType(error);
    return errorType === 'network' || errorType === 'server';
  }

  /**
   * Obtém o tempo de retry baseado no tipo de erro
   */
  static getRetryDelay(error: any): number {
    const errorType = this.getErrorType(error);
    
    switch (errorType) {
      case 'network':
        return 2000; // 2 segundos
      case 'server':
        return 5000; // 5 segundos
      case 'auth':
        return 0; // Não retry
      case 'validation':
        return 0; // Não retry
      default:
        return 1000; // 1 segundo
    }
  }
}
