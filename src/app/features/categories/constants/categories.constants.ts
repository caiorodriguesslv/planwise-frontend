/**
 * Constantes específicas do módulo de categorias
 */
export const CATEGORIES_CONSTANTS = {
  // Validação de formulário
  VALIDATION: {
    NAME_MIN_LENGTH: 3,
    NAME_MAX_LENGTH: 50,
    DESCRIPTION_MAX_LENGTH: 200,
    COLOR_PATTERN: /^#[0-9A-Fa-f]{6}$/
  },
  
  // Mensagens de erro
  ERROR_MESSAGES: {
    REQUIRED_FIELD: 'Este campo é obrigatório',
    NAME_TOO_SHORT: 'Nome deve ter no mínimo 3 caracteres',
    NAME_TOO_LONG: 'Nome deve ter no máximo 50 caracteres',
    DESCRIPTION_TOO_LONG: 'Descrição deve ter no máximo 200 caracteres',
    INVALID_COLOR: 'Cor inválida',
    NAME_ALREADY_EXISTS: 'Já existe uma categoria com este nome',
    CREATE_FAILED: 'Erro ao criar categoria',
    UPDATE_FAILED: 'Erro ao atualizar categoria',
    DELETE_FAILED: 'Erro ao excluir categoria',
    LOAD_FAILED: 'Erro ao carregar categorias'
  },
  
  // Mensagens de sucesso
  SUCCESS_MESSAGES: {
    CREATED: 'Categoria criada com sucesso',
    UPDATED: 'Categoria atualizada com sucesso',
    DELETED: 'Categoria excluída com sucesso',
    BULK_DELETED: 'Categorias excluídas com sucesso'
  },
  
  // Configurações de formulário
  FORM_CONFIG: {
    NAME_FIELD: 'name',
    DESCRIPTION_FIELD: 'description',
    COLOR_FIELD: 'color',
    TYPE_FIELD: 'type',
    STATUS_FIELD: 'status',
    ICON_FIELD: 'icon'
  },
  
  // Configurações de rota
  ROUTES: {
    LIST: '/dashboard/categories',
    NEW: '/dashboard/categories/new',
    EDIT: '/dashboard/categories/:id/edit'
  },
  
  // Configurações de tabela
  TABLE_CONFIG: {
    DEFAULT_PAGE_SIZE: 20,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
    SORTABLE_COLUMNS: ['name', 'type', 'status', 'createdAt'],
    FILTERABLE_COLUMNS: ['name', 'type', 'status']
  },
  
  // Configurações de filtro
  FILTER_CONFIG: {
    TYPE: {
      ALL: 'all',
      EXPENSE: 'expense',
      INCOME: 'income',
      BOTH: 'both'
    },
    STATUS: {
      ALL: 'all',
      ACTIVE: 'active',
      INACTIVE: 'inactive',
      ARCHIVED: 'archived'
    }
  },
  
  // Configurações de cores
  COLOR_CONFIG: {
    DEFAULT_COLORS: [
      '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
      '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
      '#ee5a24', '#0abde3', '#006ba6', '#f8b500', '#e74c3c'
    ],
    DEFAULT_COLOR: '#ff6b6b',
    ALLOW_CUSTOM: true
  },
  
  // Configurações de ícones
  ICON_CONFIG: {
    DEFAULT_ICONS: [
      'shopping_cart', 'restaurant', 'local_gas_station', 'home',
      'directions_car', 'flight', 'hotel', 'local_hospital',
      'school', 'work', 'fitness_center', 'movie',
      'sports_esports', 'music_note', 'book', 'pets'
    ],
    DEFAULT_ICON: 'category',
    ALLOW_CUSTOM: true
  },
  
  // Configurações de tipo
  TYPE_CONFIG: {
    DEFAULT: 'expense',
    OPTIONS: [
      { value: 'expense', label: 'Despesa', color: '#ff6b6b' },
      { value: 'income', label: 'Receita', color: '#4ecdc4' },
      { value: 'both', label: 'Ambos', color: '#96ceb4' }
    ]
  },
  
  // Configurações de status
  STATUS_CONFIG: {
    DEFAULT: 'active',
    OPTIONS: [
      { value: 'active', label: 'Ativa', color: '#10b981' },
      { value: 'inactive', label: 'Inativa', color: '#6b7280' },
      { value: 'archived', label: 'Arquivada', color: '#f59e0b' }
    ]
  },
  
  // Configurações de notificação
  NOTIFICATION_CONFIG: {
    CREATED: {
      TYPE: 'success',
      TITLE: 'Categoria criada',
      MESSAGE: 'Sua categoria foi criada com sucesso'
    },
    UPDATED: {
      TYPE: 'success',
      TITLE: 'Categoria atualizada',
      MESSAGE: 'Sua categoria foi atualizada com sucesso'
    },
    DELETED: {
      TYPE: 'success',
      TITLE: 'Categoria excluída',
      MESSAGE: 'Sua categoria foi excluída com sucesso'
    }
  },
  
  // Configurações de validação de nome
  NAME_VALIDATION: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-ZÀ-ÿ\s]+$/,
    UNIQUE: true
  },
  
  // Configurações de validação de cor
  COLOR_VALIDATION: {
    PATTERN: /^#[0-9A-Fa-f]{6}$/,
    REQUIRED: true,
    ALLOW_CUSTOM: true
  },
  
  // Configurações de exportação
  EXPORT_CONFIG: {
    FORMATS: ['csv', 'excel', 'pdf'],
    DEFAULT_FORMAT: 'csv',
    INCLUDE_HEADERS: true,
    INCLUDE_COLORS: true,
    INCLUDE_ICONS: true
  },
  
  // Configurações de importação
  IMPORT_CONFIG: {
    SUPPORTED_FORMATS: ['csv', 'excel'],
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    REQUIRED_FIELDS: ['name', 'type'],
    OPTIONAL_FIELDS: ['description', 'color', 'icon']
  }
} as const;
