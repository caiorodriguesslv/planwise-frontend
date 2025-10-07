/**
 * Constantes específicas do módulo de autenticação
 */
export const AUTH_CONSTANTS = {
  // Validação de formulário
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 6,
    PASSWORD_MAX_LENGTH: 50,
    NAME_MIN_LENGTH: 3,
    NAME_MAX_LENGTH: 50,
    EMAIL_MAX_LENGTH: 100
  },
  
  // Mensagens de erro
  ERROR_MESSAGES: {
    REQUIRED_FIELD: 'Este campo é obrigatório',
    INVALID_EMAIL: 'Email inválido',
    PASSWORD_TOO_SHORT: 'Senha deve ter no mínimo 6 caracteres',
    PASSWORD_TOO_LONG: 'Senha deve ter no máximo 50 caracteres',
    NAME_TOO_SHORT: 'Nome deve ter no mínimo 3 caracteres',
    NAME_TOO_LONG: 'Nome deve ter no máximo 50 caracteres',
    PASSWORDS_DONT_MATCH: 'As senhas não coincidem',
    LOGIN_FAILED: 'Email ou senha incorretos',
    REGISTER_FAILED: 'Erro ao criar conta',
    LOGOUT_FAILED: 'Erro ao fazer logout'
  },
  
  // Mensagens de sucesso
  SUCCESS_MESSAGES: {
    LOGIN_SUCCESS: 'Login realizado com sucesso',
    REGISTER_SUCCESS: 'Conta criada com sucesso',
    LOGOUT_SUCCESS: 'Logout realizado com sucesso',
    PASSWORD_CHANGED: 'Senha alterada com sucesso'
  },
  
  // Configurações de formulário
  FORM_CONFIG: {
    LOGIN_FORM: {
      EMAIL_FIELD: 'email',
      PASSWORD_FIELD: 'password'
    },
    REGISTER_FORM: {
      NAME_FIELD: 'name',
      EMAIL_FIELD: 'email',
      PASSWORD_FIELD: 'password',
      CONFIRM_PASSWORD_FIELD: 'confirmPassword'
    }
  },
  
  // Configurações de rota
  ROUTES: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    DASHBOARD: '/dashboard'
  },
  
  // Configurações de storage
  STORAGE: {
    TOKEN_KEY: 'planwise_token',
    USER_KEY: 'planwise_user',
    REFRESH_TOKEN_KEY: 'planwise_refresh_token'
  },
  
  // Configurações de timeout
  TIMEOUTS: {
    LOGIN_TIMEOUT: 30000, // 30 segundos
    REGISTER_TIMEOUT: 30000, // 30 segundos
    LOGOUT_TIMEOUT: 10000 // 10 segundos
  },
  
  // Configurações de validação de senha
  PASSWORD_VALIDATION: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 50,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: false
  },
  
  // Configurações de sessão
  SESSION: {
    TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 horas
    REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 dias
    AUTO_REFRESH_THRESHOLD: 5 * 60 * 1000 // 5 minutos
  }
} as const;
