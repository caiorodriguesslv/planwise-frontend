/**
 * Constantes específicas do módulo de despesas
 */
export const EXPENSES_CONSTANTS = {
  // Validação de formulário
  VALIDATION: {
    TITLE_MIN_LENGTH: 3,
    TITLE_MAX_LENGTH: 100,
    DESCRIPTION_MAX_LENGTH: 500,
    AMOUNT_MIN: 0.01,
    AMOUNT_MAX: 999999.99
  },
  
  // Mensagens de erro
  ERROR_MESSAGES: {
    REQUIRED_FIELD: 'Este campo é obrigatório',
    TITLE_TOO_SHORT: 'Título deve ter no mínimo 3 caracteres',
    TITLE_TOO_LONG: 'Título deve ter no máximo 100 caracteres',
    DESCRIPTION_TOO_LONG: 'Descrição deve ter no máximo 500 caracteres',
    AMOUNT_INVALID: 'Valor deve ser maior que zero',
    AMOUNT_TOO_HIGH: 'Valor muito alto',
    DATE_INVALID: 'Data inválida',
    CATEGORY_REQUIRED: 'Categoria é obrigatória',
    CREATE_FAILED: 'Erro ao criar despesa',
    UPDATE_FAILED: 'Erro ao atualizar despesa',
    DELETE_FAILED: 'Erro ao excluir despesa',
    LOAD_FAILED: 'Erro ao carregar despesas'
  },
  
  // Mensagens de sucesso
  SUCCESS_MESSAGES: {
    CREATED: 'Despesa criada com sucesso',
    UPDATED: 'Despesa atualizada com sucesso',
    DELETED: 'Despesa excluída com sucesso',
    BULK_DELETED: 'Despesas excluídas com sucesso'
  },
  
  // Configurações de formulário
  FORM_CONFIG: {
    TITLE_FIELD: 'title',
    DESCRIPTION_FIELD: 'description',
    AMOUNT_FIELD: 'amount',
    DATE_FIELD: 'date',
    CATEGORY_FIELD: 'categoryId',
    TYPE_FIELD: 'type',
    STATUS_FIELD: 'status'
  },
  
  // Configurações de rota
  ROUTES: {
    LIST: '/dashboard/expenses',
    NEW: '/dashboard/expenses/new',
    DETAIL: '/dashboard/expenses/:id',
    EDIT: '/dashboard/expenses/:id/edit'
  },
  
  // Configurações de tabela
  TABLE_CONFIG: {
    DEFAULT_PAGE_SIZE: 20,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
    SORTABLE_COLUMNS: ['title', 'amount', 'date', 'category', 'status'],
    FILTERABLE_COLUMNS: ['title', 'category', 'status', 'date']
  },
  
  // Configurações de filtro
  FILTER_CONFIG: {
    DATE_RANGE: {
      LAST_7_DAYS: 'last_7_days',
      LAST_30_DAYS: 'last_30_days',
      LAST_3_MONTHS: 'last_3_months',
      LAST_6_MONTHS: 'last_6_months',
      LAST_YEAR: 'last_year',
      CUSTOM: 'custom'
    },
    STATUS: {
      ALL: 'all',
      PENDING: 'pending',
      COMPLETED: 'completed',
      CANCELLED: 'cancelled'
    },
    TYPE: {
      ALL: 'all',
      FIXED: 'fixed',
      VARIABLE: 'variable',
      OCCASIONAL: 'occasional'
    }
  },
  
  // Configurações de exportação
  EXPORT_CONFIG: {
    FORMATS: ['csv', 'excel', 'pdf'],
    DEFAULT_FORMAT: 'csv',
    INCLUDE_HEADERS: true,
    DATE_FORMAT: 'dd/MM/yyyy'
  },
  
  // Configurações de notificação
  NOTIFICATION_CONFIG: {
    CREATED: {
      TYPE: 'success',
      TITLE: 'Despesa criada',
      MESSAGE: 'Sua despesa foi criada com sucesso'
    },
    UPDATED: {
      TYPE: 'success',
      TITLE: 'Despesa atualizada',
      MESSAGE: 'Sua despesa foi atualizada com sucesso'
    },
    DELETED: {
      TYPE: 'success',
      TITLE: 'Despesa excluída',
      MESSAGE: 'Sua despesa foi excluída com sucesso'
    }
  },
  
  // Configurações de validação de valor
  AMOUNT_VALIDATION: {
    MIN: 0.01,
    MAX: 999999.99,
    DECIMAL_PLACES: 2,
    CURRENCY_SYMBOL: 'R$'
  },
  
  // Configurações de data
  DATE_CONFIG: {
    FORMAT: 'dd/MM/yyyy',
    DISPLAY_FORMAT: 'dd/MM/yyyy',
    API_FORMAT: 'yyyy-MM-dd',
    MIN_DATE: '1900-01-01',
    MAX_DATE: '2099-12-31'
  },
  
  // Configurações de categoria
  CATEGORY_CONFIG: {
    DEFAULT_CATEGORY: 'outros',
    REQUIRED: true,
    ALLOW_CUSTOM: true
  },
  
  // Configurações de status
  STATUS_CONFIG: {
    DEFAULT: 'pending',
    OPTIONS: [
      { value: 'pending', label: 'Pendente' },
      { value: 'completed', label: 'Concluída' },
      { value: 'cancelled', label: 'Cancelada' }
    ]
  },
  
  // Configurações de tipo
  TYPE_CONFIG: {
    DEFAULT: 'variable',
    OPTIONS: [
      { value: 'fixed', label: 'Fixa' },
      { value: 'variable', label: 'Variável' },
      { value: 'occasional', label: 'Ocasional' }
    ]
  }
} as const;
