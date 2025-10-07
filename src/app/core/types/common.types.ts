/**
 * Tipos comuns da aplicação
 */

/**
 * Estado de loading (re-exported from models)
 */

/**
 * Resposta da API (re-exported from models)
 */

/**
 * Resposta paginada da API (re-exported from models)
 */

/**
 * Parâmetros de paginação
 */
export interface PaginationParams {
  page: number;
  size: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Parâmetros de filtro
 */
export interface FilterParams {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  category?: string;
  type?: string;
  status?: string;
}

/**
 * Parâmetros de busca
 */
export interface SearchParams extends PaginationParams, FilterParams {}

/**
 * Opções de ordenação
 */
export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
  label: string;
}

/**
 * Opções de filtro
 */
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

/**
 * Estado de erro
 */
export interface ErrorState {
  hasError: boolean;
  message: string;
  code?: string;
  details?: any;
}

/**
 * Estado de sucesso
 */
export interface SuccessState {
  isSuccess: boolean;
  message: string;
  data?: any;
}

/**
 * Estado de formulário
 */
export interface FormState {
  isDirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
  errors: { [key: string]: string };
}

/**
 * Configurações de notificação
 */
export interface NotificationConfig {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    callback: () => void;
  };
}

/**
 * Configurações de modal
 */
export interface ModalConfig {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  showCancel?: boolean;
  cancelText?: string;
  confirmText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

/**
 * Configurações de toast
 */
export interface ToastConfig {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  position?: 'top' | 'bottom' | 'center';
  action?: {
    label: string;
    callback: () => void;
  };
}

/**
 * Configurações de breadcrumb
 */
export interface BreadcrumbItem {
  label: string;
  route?: string;
  active?: boolean;
}

/**
 * Configurações de menu
 */
export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  children?: MenuItem[];
  disabled?: boolean;
  badge?: string;
  permission?: string;
}

/**
 * Configurações de tabela
 */
export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  type?: 'text' | 'number' | 'date' | 'currency' | 'boolean' | 'action';
}

/**
 * Configurações de ação
 */
export interface ActionConfig {
  label: string;
  icon: string;
  color: string;
  disabled?: boolean;
  visible?: boolean;
  onClick: () => void;
}

/**
 * Configurações de validação
 */
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message: string;
}

/**
 * Configurações de campo de formulário
 */
export interface FormFieldConfig {
  key: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'radio';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  options?: { value: any; label: string }[];
  validation?: ValidationRule[];
}

/**
 * Configurações de tema
 */
export interface ThemeConfig {
  name: string;
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  surface: string;
  text: string;
}

/**
 * Configurações de idioma
 */
export interface LanguageConfig {
  code: string;
  name: string;
  flag: string;
  direction: 'ltr' | 'rtl';
}

/**
 * Configurações de usuário
 */
export interface UserPreferences {
  theme: string;
  language: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
  notifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

/**
 * Configurações de aplicação
 */
export interface AppSettings {
  version: string;
  environment: string;
  apiUrl: string;
  uploadUrl: string;
  maxFileSize: number;
  allowedFileTypes: string[];
  features: {
    [key: string]: boolean;
  };
}

/**
 * Estado de cache
 */
export interface CacheState {
  key: string;
  data: any;
  timestamp: number;
  ttl: number;
  expired: boolean;
}

/**
 * Configurações de cache
 */
export interface CacheConfig {
  key: string;
  ttl: number;
  refresh?: boolean;
  fallback?: any;
}

/**
 * Estado de rota
 */
export interface RouteState {
  current: string;
  previous?: string;
  params: { [key: string]: any };
  query: { [key: string]: any };
  data?: any;
}

/**
 * Configurações de rota
 */
export interface RouteConfig {
  path: string;
  component: any;
  title: string;
  subtitle?: string;
  icon?: string;
  permission?: string;
  guards?: any[];
  data?: any;
}

/**
 * Estado de navegação
 */
export interface NavigationState {
  isOpen: boolean;
  collapsed: boolean;
  current: string;
  breadcrumbs: BreadcrumbItem[];
}

/**
 * Configurações de navegação
 */
export interface NavigationConfig {
  items: MenuItem[];
  showBreadcrumbs: boolean;
  showSearch: boolean;
  showNotifications: boolean;
  showUserMenu: boolean;
}
