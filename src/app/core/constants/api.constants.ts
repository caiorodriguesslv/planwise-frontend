/**
 * Constantes relacionadas à API
 */
export const API_ENDPOINTS = {
  // Autenticação
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password'
  },
  
  // Usuários
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    GET_BY_ID: '/users/:id',
    UPDATE: '/users/:id',
    DELETE: '/users/:id',
    UPDATE_PROFILE: '/users/profile'
  },
  
  // Categorias
  CATEGORIES: {
    LIST: '/categories',
    CREATE: '/categories',
    GET_BY_ID: '/categories/:id',
    UPDATE: '/categories/:id',
    DELETE: '/categories/:id',
    BY_TYPE: '/categories/type/:type'
  },
  
  // Despesas
  EXPENSES: {
    LIST: '/expenses',
    CREATE: '/expenses',
    GET_BY_ID: '/expenses/:id',
    UPDATE: '/expenses/:id',
    DELETE: '/expenses/:id',
    BY_CATEGORY: '/expenses/category/:categoryId',
    BY_DATE_RANGE: '/expenses/date-range',
    SUMMARY: '/expenses/summary'
  },
  
  // Receitas
  incomes: '/incomes',
  INCOME: {
    LIST: '/incomes',
    CREATE: '/incomes',
    GET_BY_ID: '/incomes/:id',
    UPDATE: '/incomes/:id',
    DELETE: '/incomes/:id',
    BY_CATEGORY: '/incomes/category/:categoryId',
    BY_DATE_RANGE: '/incomes/date-range',
    SUMMARY: '/incomes/summary',
    STATS: '/incomes/stats'
  },
  
  // Relatórios
  REPORTS: {
    FINANCIAL_SUMMARY: '/reports/financial-summary',
    EXPENSES_BY_CATEGORY: '/reports/expenses-by-category',
    INCOME_BY_CATEGORY: '/reports/income-by-category',
    MONTHLY_TRENDS: '/reports/monthly-trends',
    YEARLY_SUMMARY: '/reports/yearly-summary'
  },
  
  // Dashboard
  DASHBOARD: {
    STATS: '/dashboard/stats',
    RECENT_ACTIVITIES: '/dashboard/recent-activities',
    QUICK_ACTIONS: '/dashboard/quick-actions'
  }
} as const;

/**
 * Constantes de status HTTP
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
} as const;

/**
 * Constantes de timeout
 */
export const TIMEOUTS = {
  DEFAULT: 30000, // 30 segundos
  UPLOAD: 60000, // 1 minuto
  DOWNLOAD: 120000, // 2 minutos
  LONG_REQUEST: 300000 // 5 minutos
} as const;

/**
 * Constantes de retry
 */
export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  DELAY: 1000, // 1 segundo
  BACKOFF_FACTOR: 2
} as const;

/**
 * Constantes de paginação
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1
} as const;

/**
 * Constantes de cache
 */
export const CACHE_KEYS = {
  USER_PROFILE: 'user_profile',
  CATEGORIES: 'categories',
  EXPENSES: 'expenses',
  INCOME: 'income',
  DASHBOARD_STATS: 'dashboard_stats'
} as const;

/**
 * Constantes de cache TTL (Time To Live)
 */
export const CACHE_TTL = {
  SHORT: 300000, // 5 minutos
  MEDIUM: 900000, // 15 minutos
  LONG: 3600000, // 1 hora
  VERY_LONG: 86400000 // 24 horas
} as const;
