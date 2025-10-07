/**
 * Utilitários para manipulação de strings
 */
export class StringUtil {
  
  /**
   * Capitaliza a primeira letra de uma string
   */
  static capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Capitaliza todas as palavras de uma string
   */
  static capitalizeWords(str: string): string {
    if (!str) return '';
    return str.split(' ').map(word => this.capitalize(word)).join(' ');
  }

  /**
   * Converte uma string para camelCase
   */
  static toCamelCase(str: string): string {
    if (!str) return '';
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, '');
  }

  /**
   * Converte uma string para kebab-case
   */
  static toKebabCase(str: string): string {
    if (!str) return '';
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  /**
   * Converte uma string para snake_case
   */
  static toSnakeCase(str: string): string {
    if (!str) return '';
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toLowerCase();
  }

  /**
   * Converte uma string para PascalCase
   */
  static toPascalCase(str: string): string {
    if (!str) return '';
    return str
      .split(/[\s-_]+/)
      .map(word => this.capitalize(word))
      .join('');
  }

  /**
   * Remove acentos de uma string
   */
  static removeAccents(str: string): string {
    if (!str) return '';
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Remove caracteres especiais de uma string
   */
  static removeSpecialChars(str: string): string {
    if (!str) return '';
    return str.replace(/[^\w\s]/gi, '');
  }

  /**
   * Remove espaços extras de uma string
   */
  static trimExtraSpaces(str: string): string {
    if (!str) return '';
    return str.replace(/\s+/g, ' ').trim();
  }

  /**
   * Trunca uma string para um tamanho específico
   */
  static truncate(str: string, length: number, suffix: string = '...'): string {
    if (!str || str.length <= length) return str;
    return str.substring(0, length) + suffix;
  }

  /**
   * Trunca uma string no meio, mantendo início e fim
   */
  static truncateMiddle(str: string, maxLength: number, separator: string = '...'): string {
    if (!str || str.length <= maxLength) return str;
    
    const startLength = Math.ceil((maxLength - separator.length) / 2);
    const endLength = Math.floor((maxLength - separator.length) / 2);
    
    return str.substring(0, startLength) + separator + str.substring(str.length - endLength);
  }

  /**
   * Gera um slug a partir de uma string
   */
  static generateSlug(str: string): string {
    if (!str) return '';
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Verifica se uma string é um email válido
   */
  static isValidEmail(email: string): boolean {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Verifica se uma string é uma URL válida
   */
  static isValidUrl(url: string): boolean {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Verifica se uma string é um CPF válido
   */
  static isValidCPF(cpf: string): boolean {
    if (!cpf) return false;
    
    // Remove caracteres não numéricos
    const cleanCpf = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos
    if (cleanCpf.length !== 11) return false;
    
    // Verifica se não são todos os dígitos iguais
    if (/^(\d)\1{10}$/.test(cleanCpf)) return false;
    
    // Validação do CPF
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf.charAt(10))) return false;
    
    return true;
  }

  /**
   * Verifica se uma string é um CNPJ válido
   */
  static isValidCNPJ(cnpj: string): boolean {
    if (!cnpj) return false;
    
    // Remove caracteres não numéricos
    const cleanCnpj = cnpj.replace(/\D/g, '');
    
    // Verifica se tem 14 dígitos
    if (cleanCnpj.length !== 14) return false;
    
    // Verifica se não são todos os dígitos iguais
    if (/^(\d)\1{13}$/.test(cleanCnpj)) return false;
    
    // Validação do CNPJ
    let sum = 0;
    let weight = 2;
    for (let i = 11; i >= 0; i--) {
      sum += parseInt(cleanCnpj.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    let remainder = sum % 11;
    const firstDigit = remainder < 2 ? 0 : 11 - remainder;
    if (firstDigit !== parseInt(cleanCnpj.charAt(12))) return false;
    
    sum = 0;
    weight = 2;
    for (let i = 12; i >= 0; i--) {
      sum += parseInt(cleanCnpj.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    remainder = sum % 11;
    const secondDigit = remainder < 2 ? 0 : 11 - remainder;
    if (secondDigit !== parseInt(cleanCnpj.charAt(13))) return false;
    
    return true;
  }

  /**
   * Formata um CPF (xxx.xxx.xxx-xx)
   */
  static formatCPF(cpf: string): string {
    if (!cpf) return '';
    const cleanCpf = cpf.replace(/\D/g, '');
    return cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  /**
   * Formata um CNPJ (xx.xxx.xxx/xxxx-xx)
   */
  static formatCNPJ(cnpj: string): string {
    if (!cnpj) return '';
    const cleanCnpj = cnpj.replace(/\D/g, '');
    return cleanCnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  /**
   * Formata um telefone (xx) xxxxx-xxxx
   */
  static formatPhone(phone: string): string {
    if (!phone) return '';
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 11) {
      return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (cleanPhone.length === 10) {
      return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  }

  /**
   * Formata um CEP (xxxxx-xxx)
   */
  static formatCEP(cep: string): string {
    if (!cep) return '';
    const cleanCep = cep.replace(/\D/g, '');
    return cleanCep.replace(/(\d{5})(\d{3})/, '$1-$2');
  }

  /**
   * Gera uma string aleatória
   */
  static generateRandomString(length: number, chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Gera um UUID v4
   */
  static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
