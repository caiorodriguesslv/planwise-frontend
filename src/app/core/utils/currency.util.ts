/**
 * Utilitários para manipulação de moeda
 */
export class CurrencyUtil {
  
  /**
   * Formata um valor para o padrão brasileiro (R$ 1.234,56)
   */
  static formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  /**
   * Formata um valor para o padrão brasileiro sem símbolo (1.234,56)
   */
  static formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  /**
   * Formata um valor para o padrão brasileiro com símbolo de moeda personalizado
   */
  static formatCurrencyWithSymbol(value: number, symbol: string = 'R$'): string {
    return `${symbol} ${this.formatNumber(value)}`;
  }

  /**
   * Converte string de moeda para número
   */
  static parseCurrency(value: string): number {
    // Remove todos os caracteres não numéricos exceto vírgula e ponto
    const cleanValue = value.replace(/[^\d,.-]/g, '');
    
    // Substitui vírgula por ponto para conversão
    const numericValue = cleanValue.replace(',', '.');
    
    return parseFloat(numericValue) || 0;
  }

  /**
   * Formata um valor para exibição compacta (1,2K, 1,5M)
   */
  static formatCompactCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  }

  /**
   * Formata um valor para exibição compacta sem símbolo (1,2K, 1,5M)
   */
  static formatCompactNumber(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  }

  /**
   * Calcula a diferença percentual entre dois valores
   */
  static calculatePercentageChange(oldValue: number, newValue: number): number {
    if (oldValue === 0) return 0;
    return ((newValue - oldValue) / oldValue) * 100;
  }

  /**
   * Formata a diferença percentual com sinal
   */
  static formatPercentageChange(oldValue: number, newValue: number): string {
    const change = this.calculatePercentageChange(oldValue, newValue);
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  }

  /**
   * Verifica se um valor é positivo
   */
  static isPositive(value: number): boolean {
    return value > 0;
  }

  /**
   * Verifica se um valor é negativo
   */
  static isNegative(value: number): boolean {
    return value < 0;
  }

  /**
   * Verifica se um valor é zero
   */
  static isZero(value: number): boolean {
    return value === 0;
  }

  /**
   * Arredonda um valor para 2 casas decimais
   */
  static round(value: number): number {
    return Math.round(value * 100) / 100;
  }

  /**
   * Calcula o valor absoluto
   */
  static abs(value: number): number {
    return Math.abs(value);
  }

  /**
   * Calcula a soma de um array de valores
   */
  static sum(values: number[]): number {
    return values.reduce((sum, value) => sum + value, 0);
  }

  /**
   * Calcula a média de um array de valores
   */
  static average(values: number[]): number {
    if (values.length === 0) return 0;
    return this.sum(values) / values.length;
  }

  /**
   * Calcula o valor máximo de um array
   */
  static max(values: number[]): number {
    return Math.max(...values);
  }

  /**
   * Calcula o valor mínimo de um array
   */
  static min(values: number[]): number {
    return Math.min(...values);
  }

  /**
   * Formata um valor para exibição em tabela
   */
  static formatTableValue(value: number, showSign: boolean = false): string {
    const formatted = this.formatCurrency(value);
    if (showSign && value > 0) {
      return `+${formatted}`;
    }
    return formatted;
  }

  /**
   * Formata um valor para exibição em card
   */
  static formatCardValue(value: number): string {
    if (Math.abs(value) >= 1000000) {
      return this.formatCompactCurrency(value);
    }
    return this.formatCurrency(value);
  }
}
