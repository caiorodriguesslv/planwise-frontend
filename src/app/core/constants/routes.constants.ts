/**
 * Constantes de rotas da aplicação
 */
export const ROUTES = {
  // Rotas públicas
  PUBLIC: {
    HOME: '/',
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password'
  },
  
  // Rotas protegidas
  PROTECTED: {
    DASHBOARD: '/dashboard',
    PROFILE: '/dashboard/profile',
    SETTINGS: '/dashboard/settings'
  },
  
  // Rotas de despesas
  EXPENSES: {
    LIST: '/dashboard/expenses',
    NEW: '/dashboard/expenses/new',
    DETAIL: '/dashboard/expenses/:id',
    EDIT: '/dashboard/expenses/:id/edit'
  },
  
  // Rotas de receitas
  INCOME: {
    LIST: '/dashboard/income',
    NEW: '/dashboard/income/new',
    DETAIL: '/dashboard/income/:id',
    EDIT: '/dashboard/income/:id/edit'
  },
  
  // Rotas de categorias
  CATEGORIES: {
    LIST: '/dashboard/categories',
    NEW: '/dashboard/categories/new',
    EDIT: '/dashboard/categories/:id/edit'
  },
  
  // Rotas de relatórios
  REPORTS: {
    FINANCIAL_SUMMARY: '/dashboard/reports/financial-summary',
    EXPENSES_BY_CATEGORY: '/dashboard/reports/expenses-by-category',
    INCOME_BY_CATEGORY: '/dashboard/reports/income-by-category',
    MONTHLY_TRENDS: '/dashboard/reports/monthly-trends',
    YEARLY_SUMMARY: '/dashboard/reports/yearly-summary'
  },
  
  // Rotas de metas
  GOALS: {
    LIST: '/dashboard/goals',
    NEW: '/dashboard/goals/new',
    DETAIL: '/dashboard/goals/:id',
    EDIT: '/dashboard/goals/:id/edit'
  },
  
  // Rotas de orçamento
  BUDGET: {
    LIST: '/dashboard/budget',
    NEW: '/dashboard/budget/new',
    DETAIL: '/dashboard/budget/:id',
    EDIT: '/dashboard/budget/:id/edit'
  }
} as const;

/**
 * Constantes de parâmetros de rota
 */
export const ROUTE_PARAMS = {
  ID: ':id',
  TYPE: ':type',
  CATEGORY: ':category',
  DATE: ':date',
  YEAR: ':year',
  MONTH: ':month'
} as const;

/**
 * Constantes de query parameters
 */
export const QUERY_PARAMS = {
  PAGE: 'page',
  SIZE: 'size',
  SORT: 'sort',
  ORDER: 'order',
  SEARCH: 'search',
  FILTER: 'filter',
  DATE_FROM: 'dateFrom',
  DATE_TO: 'dateTo',
  CATEGORY: 'category',
  TYPE: 'type',
  STATUS: 'status'
} as const;

/**
 * Constantes de navegação
 */
export const NAVIGATION = {
  SIDEBAR: {
    DASHBOARD: 'dashboard',
    EXPENSES: 'expenses',
    INCOME: 'income',
    CATEGORIES: 'categories',
    REPORTS: 'reports',
    GOALS: 'goals',
    BUDGET: 'budget',
    PROFILE: 'profile',
    SETTINGS: 'settings'
  },
  
  BREADCRUMBS: {
    DASHBOARD: 'Dashboard',
    EXPENSES: 'Despesas',
    INCOME: 'Receitas',
    CATEGORIES: 'Categorias',
    REPORTS: 'Relatórios',
    GOALS: 'Metas',
    BUDGET: 'Orçamento',
    PROFILE: 'Perfil',
    SETTINGS: 'Configurações'
  }
} as const;

/**
 * Constantes de títulos de página
 */
export const PAGE_TITLES = {
  DASHBOARD: 'Dashboard - PlanWise',
  EXPENSES: 'Despesas - PlanWise',
  EXPENSES_LIST: 'Lista de Despesas - PlanWise',
  EXPENSES_NEW: 'Nova Despesa - PlanWise',
  EXPENSES_EDIT: 'Editar Despesa - PlanWise',
  EXPENSES_DETAIL: 'Detalhes da Despesa - PlanWise',
  INCOME: 'Receitas - PlanWise',
  INCOME_LIST: 'Lista de Receitas - PlanWise',
  INCOME_NEW: 'Nova Receita - PlanWise',
  INCOME_EDIT: 'Editar Receita - PlanWise',
  INCOME_DETAIL: 'Detalhes da Receita - PlanWise',
  CATEGORIES: 'Categorias - PlanWise',
  CATEGORIES_LIST: 'Lista de Categorias - PlanWise',
  CATEGORIES_NEW: 'Nova Categoria - PlanWise',
  CATEGORIES_EDIT: 'Editar Categoria - PlanWise',
  REPORTS: 'Relatórios - PlanWise',
  GOALS: 'Metas - PlanWise',
  BUDGET: 'Orçamento - PlanWise',
  PROFILE: 'Meu Perfil - PlanWise',
  SETTINGS: 'Configurações - PlanWise',
  LOGIN: 'Login - PlanWise',
  REGISTER: 'Criar Conta - PlanWise'
} as const;

/**
 * Constantes de subtítulos de página
 */
export const PAGE_SUBTITLES = {
  DASHBOARD: 'Visão geral do seu planejamento financeiro',
  EXPENSES: 'Gerencie e monitore todos os seus gastos',
  EXPENSES_LIST: 'Todas as suas despesas organizadas',
  EXPENSES_NEW: 'Adicione uma nova despesa ao seu controle',
  EXPENSES_EDIT: 'Modifique os dados da despesa selecionada',
  EXPENSES_DETAIL: 'Informações completas sobre a despesa selecionada',
  INCOME: 'Gerencie e monitore todas as suas receitas',
  INCOME_LIST: 'Todas as suas receitas organizadas',
  INCOME_NEW: 'Adicione uma nova receita ao seu controle',
  INCOME_EDIT: 'Modifique os dados da receita selecionada',
  INCOME_DETAIL: 'Informações completas sobre a receita selecionada',
  CATEGORIES: 'Organize suas despesas e receitas por categorias',
  CATEGORIES_LIST: 'Todas as suas categorias organizadas',
  CATEGORIES_NEW: 'Crie uma nova categoria para organizar suas transações',
  CATEGORIES_EDIT: 'Modifique os dados da categoria selecionada',
  REPORTS: 'Analise seus dados financeiros com relatórios detalhados',
  GOALS: 'Defina e acompanhe suas metas financeiras',
  BUDGET: 'Planeje e controle seu orçamento mensal',
  PROFILE: 'Gerencie suas informações pessoais',
  SETTINGS: 'Configure suas preferências e configurações'
} as const;
