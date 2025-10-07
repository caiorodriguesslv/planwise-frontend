/**
 * Constantes específicas do módulo de dashboard
 */
export const DASHBOARD_CONSTANTS = {
  // Configurações de cards de estatísticas
  STATS_CARDS: {
    INCOME: {
      TITLE: 'Receitas',
      ICON: 'trending_up',
      COLOR: '#4ecdc4',
      GRADIENT: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)'
    },
    EXPENSES: {
      TITLE: 'Despesas',
      ICON: 'trending_down',
      COLOR: '#ff6b6b',
      GRADIENT: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)'
    },
    BALANCE: {
      TITLE: 'Saldo',
      ICON: 'account_balance',
      COLOR: '#8b5cf6',
      GRADIENT: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
    },
    GOALS: {
      TITLE: 'Metas',
      ICON: 'flag',
      COLOR: '#f59e0b',
      GRADIENT: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    }
  },
  
  // Configurações de ações rápidas
  QUICK_ACTIONS: {
    NEW_EXPENSE: {
      TITLE: 'Nova Despesa',
      ICON: 'add',
      ROUTE: '/dashboard/expenses/new',
      COLOR: '#ff6b6b'
    },
    NEW_INCOME: {
      TITLE: 'Nova Receita',
      ICON: 'add',
      ROUTE: '/dashboard/income/new',
      COLOR: '#4ecdc4'
    },
    NEW_CATEGORY: {
      TITLE: 'Nova Categoria',
      ICON: 'category',
      ROUTE: '/dashboard/categories/new',
      COLOR: '#8b5cf6'
    },
    REPORTS: {
      TITLE: 'Relatórios',
      ICON: 'analytics',
      ROUTE: '/dashboard/reports',
      COLOR: '#f59e0b'
    }
  },
  
  // Configurações de atividades recentes
  RECENT_ACTIVITIES: {
    MAX_ITEMS: 10,
    REFRESH_INTERVAL: 30000, // 30 segundos
    TYPES: {
      EXPENSE_CREATED: 'expense_created',
      EXPENSE_UPDATED: 'expense_updated',
      EXPENSE_DELETED: 'expense_deleted',
      INCOME_CREATED: 'income_created',
      INCOME_UPDATED: 'income_updated',
      INCOME_DELETED: 'income_deleted',
      CATEGORY_CREATED: 'category_created',
      CATEGORY_UPDATED: 'category_updated',
      CATEGORY_DELETED: 'category_deleted'
    }
  },
  
  // Configurações de gráficos
  CHARTS: {
    EXPENSES_BY_CATEGORY: {
      TYPE: 'doughnut',
      TITLE: 'Despesas por Categoria',
      COLORS: [
        '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
        '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'
      ]
    },
    MONTHLY_TRENDS: {
      TYPE: 'line',
      TITLE: 'Tendências Mensais',
      COLORS: {
        INCOME: '#4ecdc4',
        EXPENSES: '#ff6b6b',
        BALANCE: '#8b5cf6'
      }
    },
    YEARLY_SUMMARY: {
      TYPE: 'bar',
      TITLE: 'Resumo Anual',
      COLORS: {
        INCOME: '#4ecdc4',
        EXPENSES: '#ff6b6b'
      }
    }
  },
  
  // Configurações de filtros
  FILTERS: {
    DATE_RANGE: {
      LAST_7_DAYS: 'last_7_days',
      LAST_30_DAYS: 'last_30_days',
      LAST_3_MONTHS: 'last_3_months',
      LAST_6_MONTHS: 'last_6_months',
      LAST_YEAR: 'last_year',
      CUSTOM: 'custom'
    },
    DEFAULT_DATE_RANGE: 'last_30_days'
  },
  
  // Configurações de notificações
  NOTIFICATIONS: {
    GOAL_ACHIEVED: {
      TYPE: 'success',
      TITLE: 'Meta Alcançada!',
      MESSAGE: 'Parabéns! Você alcançou sua meta financeira.'
    },
    BUDGET_EXCEEDED: {
      TYPE: 'warning',
      TITLE: 'Orçamento Excedido',
      MESSAGE: 'Atenção! Você excedeu seu orçamento mensal.'
    },
    LARGE_EXPENSE: {
      TYPE: 'info',
      TITLE: 'Despesa Elevada',
      MESSAGE: 'Você registrou uma despesa acima da média.'
    }
  },
  
  // Configurações de métricas
  METRICS: {
    SAVINGS_RATE: {
      TITLE: 'Taxa de Poupança',
      DESCRIPTION: 'Percentual da receita que você está poupando',
      TARGET: 20, // 20%
      WARNING_THRESHOLD: 10, // 10%
      SUCCESS_THRESHOLD: 30 // 30%
    },
    EXPENSE_RATIO: {
      TITLE: 'Proporção de Despesas',
      DESCRIPTION: 'Percentual da receita gasta em despesas',
      TARGET: 70, // 70%
      WARNING_THRESHOLD: 90, // 90%
      SUCCESS_THRESHOLD: 50 // 50%
    }
  },
  
  // Configurações de layout
  LAYOUT: {
    GRID_COLUMNS: {
      DESKTOP: 4,
      TABLET: 2,
      MOBILE: 1
    },
    CARD_SPACING: 24,
    SECTION_SPACING: 32
  },
  
  // Configurações de refresh
  REFRESH: {
    AUTO_REFRESH: true,
    INTERVAL: 60000, // 1 minuto
    MANUAL_REFRESH: true,
    PULL_TO_REFRESH: true
  },
  
  // Configurações de cache
  CACHE: {
    STATS_TTL: 300000, // 5 minutos
    ACTIVITIES_TTL: 60000, // 1 minuto
    CHARTS_TTL: 900000 // 15 minutos
  },
  
  // Configurações de exportação
  EXPORT: {
    FORMATS: ['pdf', 'excel', 'csv'],
    DEFAULT_FORMAT: 'pdf',
    INCLUDE_CHARTS: true,
    INCLUDE_STATS: true,
    INCLUDE_ACTIVITIES: true
  },
  
  // Configurações de personalização
  CUSTOMIZATION: {
    ALLOW_WIDGET_REORDER: true,
    ALLOW_WIDGET_HIDE: true,
    DEFAULT_WIDGETS: ['stats', 'quick_actions', 'recent_activities', 'charts'],
    AVAILABLE_WIDGETS: ['stats', 'quick_actions', 'recent_activities', 'charts', 'goals', 'budget']
  }
} as const;
