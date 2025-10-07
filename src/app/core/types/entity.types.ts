/**
 * Tipos de entidades da aplicação
 */

/**
 * Tipo de transação
 */
export type TransactionType = 'expense' | 'income';

/**
 * Status de transação
 */
export type TransactionStatus = 'pending' | 'completed' | 'cancelled';

/**
 * Tipo de categoria (re-exported from models)
 */

/**
 * Status de categoria
 */
export type CategoryStatus = 'active' | 'inactive' | 'archived';

/**
 * Tipo de meta
 */
export type GoalType = 'savings' | 'debt' | 'investment' | 'purchase';

/**
 * Status de meta
 */
export type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled';

/**
 * Tipo de orçamento
 */
export type BudgetType = 'monthly' | 'yearly' | 'custom';

/**
 * Status de orçamento
 */
export type BudgetStatus = 'active' | 'completed' | 'cancelled';

/**
 * Tipo de relatório
 */
export type ReportType = 'financial_summary' | 'expenses_by_category' | 'income_by_category' | 'monthly_trends' | 'yearly_summary';

/**
 * Formato de relatório
 */
export type ReportFormat = 'pdf' | 'excel' | 'csv' | 'json';

/**
 * Tipo de notificação
 */
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

/**
 * Tipo de evento
 */
export type EventType = 'created' | 'updated' | 'deleted' | 'viewed' | 'exported' | 'imported';

/**
 * Tipo de arquivo
 */
export type FileType = 'image' | 'document' | 'spreadsheet' | 'pdf' | 'other';

/**
 * Status de arquivo
 */
export type FileStatus = 'uploading' | 'uploaded' | 'processing' | 'processed' | 'error';

/**
 * Tipo de permissão
 */
export type PermissionType = 'read' | 'write' | 'delete' | 'admin';

/**
 * Tipo de role
 */
export type RoleType = 'user' | 'admin' | 'moderator';

/**
 * Status de usuário
 */
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

/**
 * Tipo de autenticação
 */
export type AuthType = 'email' | 'google' | 'facebook' | 'apple';

/**
 * Status de autenticação
 */
export type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading' | 'error';

/**
 * Tipo de sessão
 */
export type SessionType = 'web' | 'mobile' | 'api';

/**
 * Status de sessão
 */
export type SessionStatus = 'active' | 'expired' | 'revoked';

/**
 * Tipo de log
 */
export type LogType = 'info' | 'warning' | 'error' | 'debug';

/**
 * Nível de log
 */
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/**
 * Tipo de métrica
 */
export type MetricType = 'counter' | 'gauge' | 'histogram' | 'summary';

/**
 * Tipo de alerta
 */
export type AlertType = 'info' | 'success' | 'warning' | 'error' | 'critical';

/**
 * Status de alerta
 */
export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'dismissed';

/**
 * Tipo de webhook
 */
export type WebhookType = 'transaction_created' | 'transaction_updated' | 'transaction_deleted' | 'user_created' | 'user_updated';

/**
 * Status de webhook
 */
export type WebhookStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'retrying';

/**
 * Tipo de integração
 */
export type IntegrationType = 'bank' | 'credit_card' | 'investment' | 'crypto' | 'other';

/**
 * Status de integração
 */
export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'pending' | 'expired';

/**
 * Tipo de sincronização
 */
export type SyncType = 'manual' | 'automatic' | 'scheduled';

/**
 * Status de sincronização
 */
export type SyncStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

/**
 * Tipo de backup
 */
export type BackupType = 'full' | 'incremental' | 'differential';

/**
 * Status de backup
 */
export type BackupStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

/**
 * Tipo de restauração
 */
export type RestoreType = 'full' | 'partial' | 'selective';

/**
 * Status de restauração
 */
export type RestoreStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

/**
 * Tipo de exportação
 */
export type ExportType = 'csv' | 'excel' | 'pdf' | 'json' | 'xml';

/**
 * Status de exportação
 */
export type ExportStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

/**
 * Tipo de importação
 */
export type ImportType = 'csv' | 'excel' | 'json' | 'xml' | 'ofx' | 'qif';

/**
 * Status de importação
 */
export type ImportStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

/**
 * Tipo de validação
 */
export type ValidationType = 'required' | 'email' | 'phone' | 'cpf' | 'cnpj' | 'cep' | 'currency' | 'date' | 'custom';

/**
 * Status de validação
 */
export type ValidationStatus = 'pending' | 'valid' | 'invalid' | 'error';

/**
 * Tipo de transformação
 */
export type TransformType = 'uppercase' | 'lowercase' | 'capitalize' | 'trim' | 'replace' | 'format' | 'parse';

/**
 * Status de transformação
 */
export type TransformStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

/**
 * Tipo de agregação
 */
export type AggregationType = 'sum' | 'avg' | 'min' | 'max' | 'count' | 'distinct';

/**
 * Tipo de agrupamento
 */
export type GroupingType = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'category' | 'type' | 'status';

/**
 * Tipo de ordenação
 */
export type SortingType = 'asc' | 'desc' | 'none';

/**
 * Tipo de filtro
 */
export type FilterType = 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in';

/**
 * Tipo de operação
 */
export type OperationType = 'create' | 'read' | 'update' | 'delete' | 'export' | 'import' | 'sync' | 'backup' | 'restore';

/**
 * Status de operação
 */
export type OperationStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'timeout';
