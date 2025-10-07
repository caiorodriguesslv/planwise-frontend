/**
 * Utilitários para manipulação de datas
 */
export class DateUtil {
  
  /**
   * Formata uma data para o padrão brasileiro (dd/mm/yyyy)
   */
  static formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('pt-BR');
  }

  /**
   * Formata uma data para o padrão brasileiro com hora (dd/mm/yyyy hh:mm)
   */
  static formatDateTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('pt-BR');
  }

  /**
   * Formata uma data para o padrão ISO (yyyy-mm-dd)
   */
  static formatDateISO(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString().split('T')[0];
  }

  /**
   * Formata uma data para exibição relativa (há 2 dias, há 1 semana)
   */
  static formatRelativeDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInMs = now.getTime() - dateObj.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Hoje';
    } else if (diffInDays === 1) {
      return 'Ontem';
    } else if (diffInDays < 7) {
      return `Há ${diffInDays} dias`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `Há ${weeks} semana${weeks > 1 ? 's' : ''}`;
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return `Há ${months} mês${months > 1 ? 'es' : ''}`;
    } else {
      const years = Math.floor(diffInDays / 365);
      return `Há ${years} ano${years > 1 ? 's' : ''}`;
    }
  }

  /**
   * Verifica se uma data é hoje
   */
  static isToday(date: Date | string): boolean {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    return dateObj.toDateString() === today.toDateString();
  }

  /**
   * Verifica se uma data é desta semana
   */
  static isThisWeek(date: Date | string): boolean {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    return dateObj >= startOfWeek && dateObj <= endOfWeek;
  }

  /**
   * Verifica se uma data é deste mês
   */
  static isThisMonth(date: Date | string): boolean {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    return dateObj.getMonth() === today.getMonth() && 
           dateObj.getFullYear() === today.getFullYear();
  }

  /**
   * Adiciona dias a uma data
   */
  static addDays(date: Date | string, days: number): Date {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const result = new Date(dateObj);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Adiciona meses a uma data
   */
  static addMonths(date: Date | string, months: number): Date {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const result = new Date(dateObj);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  /**
   * Adiciona anos a uma data
   */
  static addYears(date: Date | string, years: number): Date {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const result = new Date(dateObj);
    result.setFullYear(result.getFullYear() + years);
    return result;
  }

  /**
   * Obtém o primeiro dia do mês
   */
  static getFirstDayOfMonth(date: Date | string): Date {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
  }

  /**
   * Obtém o último dia do mês
   */
  static getLastDayOfMonth(date: Date | string): Date {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0);
  }

  /**
   * Obtém o primeiro dia da semana
   */
  static getFirstDayOfWeek(date: Date | string): Date {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const result = new Date(dateObj);
    const day = result.getDay();
    const diff = result.getDate() - day;
    return new Date(result.setDate(diff));
  }

  /**
   * Obtém o último dia da semana
   */
  static getLastDayOfWeek(date: Date | string): Date {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const result = new Date(dateObj);
    const day = result.getDay();
    const diff = result.getDate() - day + 6;
    return new Date(result.setDate(diff));
  }
}
