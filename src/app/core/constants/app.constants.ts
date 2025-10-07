/**
 * Constantes gerais da aplicação
 */
export const APP_CONFIG = {
  NAME: 'PlanWise',
  VERSION: '1.0.0',
  DESCRIPTION: 'Sistema de controle financeiro pessoal',
  AUTHOR: 'PlanWise Team',
  SUPPORT_EMAIL: 'suporte@planwise.com',
  WEBSITE: 'https://planwise.com'
} as const;

/**
 * Constantes de ambiente
 */
export const ENVIRONMENT = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TESTING: 'testing'
} as const;

/**
 * Constantes de tema
 */
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
} as const;

/**
 * Constantes de idioma
 */
export const LANGUAGE = {
  PT_BR: 'pt-BR',
  EN_US: 'en-US',
  ES_ES: 'es-ES'
} as const;

/**
 * Constantes de moeda
 */
export const CURRENCY = {
  BRL: 'BRL',
  USD: 'USD',
  EUR: 'EUR'
} as const;

/**
 * Constantes de formato de data
 */
export const DATE_FORMATS = {
  SHORT: 'dd/MM/yyyy',
  MEDIUM: 'dd/MM/yyyy HH:mm',
  LONG: 'dd/MM/yyyy HH:mm:ss',
  ISO: 'yyyy-MM-dd',
  ISO_DATETIME: 'yyyy-MM-ddTHH:mm:ss'
} as const;

/**
 * Constantes de validação
 */
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 50,
  NAME_MIN_LENGTH: 3,
  NAME_MAX_LENGTH: 50,
  EMAIL_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  TITLE_MAX_LENGTH: 100
} as const;

/**
 * Constantes de regex
 */
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
  CPF: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  CNPJ: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
  PHONE: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
  CEP: /^\d{5}-\d{3}$/,
  CURRENCY: /^\d{1,3}(\.\d{3})*,\d{2}$/
} as const;

/**
 * Constantes de storage
 */
export const STORAGE_KEYS = {
  TOKEN: 'planwise_token',
  USER: 'planwise_user',
  THEME: 'planwise_theme',
  LANGUAGE: 'planwise_language',
  SETTINGS: 'planwise_settings',
  CACHE: 'planwise_cache'
} as const;

/**
 * Constantes de notificação
 */
export const NOTIFICATION = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
} as const;

/**
 * Constantes de loading
 */
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
} as const;

/**
 * Constantes de breakpoints
 */
export const BREAKPOINTS = {
  XS: 0,
  SM: 576,
  MD: 768,
  LG: 992,
  XL: 1200,
  XXL: 1400
} as const;

/**
 * Constantes de z-index
 */
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080
} as const;

/**
 * Constantes de animação
 */
export const ANIMATION = {
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
  },
  EASING: {
    EASE: 'ease',
    EASE_IN: 'ease-in',
    EASE_OUT: 'ease-out',
    EASE_IN_OUT: 'ease-in-out'
  }
} as const;

/**
 * Constantes de cores
 */
export const COLORS = {
  PRIMARY: '#ff6b6b',
  SECONDARY: '#e84393',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#3b82f6',
  LIGHT: '#f8fafc',
  DARK: '#1e293b'
} as const;

/**
 * Constantes de tamanhos
 */
export const SIZES = {
  XS: 'xs',
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl'
} as const;

/**
 * Constantes de direção
 */
export const DIRECTIONS = {
  LTR: 'ltr',
  RTL: 'rtl'
} as const;
