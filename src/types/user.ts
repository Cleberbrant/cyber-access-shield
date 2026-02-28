// =============================================================================
// TIPOS PARA GERENCIAMENTO DE USUÁRIOS
// =============================================================================

/**
 * Usuário completo (do banco de dados)
 */
export interface User {
  id: string;
  email: string;
  display_name: string | null;
  is_admin: boolean;
  is_active: boolean;
  temp_password: string | null; // Senha temporária (se resetada)
  temp_password_created_at: string | null; // Quando foi resetada
  created_at: string;
  last_sign_in_at: string | null;
  confirmed_at: string | null;
}

/**
 * Estatísticas de usuários
 */
export interface UserStats {
  total: number;
  admins: number;
  students: number;
  inactive: number;
}

/**
 * Filtros para busca de usuários
 */
export type UserFilter = "all" | "admins" | "students" | "inactive";

/**
 * Parâmetros para busca de usuários
 */
export interface UserSearchParams {
  filter: UserFilter;
  searchQuery: string;
  page: number;
  pageSize: number;
}

/**
 * Resultado paginado de usuários
 */
export interface UsersPaginatedResult {
  users: User[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

/**
 * Dados para editar outro usuário (admin editando alguém)
 */
export interface UserEditData {
  display_name?: string;
  is_admin?: boolean;
  is_active?: boolean;
}

/**
 * Dados para editar própria conta (admin editando a si mesmo)
 */
export interface SelfEditData {
  display_name: string;
  current_password?: string; // Obrigatório se for mudar senha
  new_password?: string;
  confirm_password?: string;
}

/**
 * Log de auditoria de gerenciamento de usuários
 */
export interface UserManagementLog {
  id: string;
  admin_id: string;
  admin_email: string;
  target_user_id: string;
  target_user_email: string;
  action: UserManagementAction;
  old_value: any;
  new_value: any;
  created_at: string;
}

/**
 * Tipos de ações de gerenciamento
 */
export type UserManagementAction =
  | "edit_role" // Mudou tipo de conta (admin/aluno)
  | "edit_display_name" // Mudou nome de exibição
  | "reset_password" // Admin resetou senha de outro
  | "self_password_change" // Admin mudou própria senha
  | "self_display_name_change" // Admin mudou próprio nome
  | "deactivate" // Desativou conta
  | "activate"; // Reativou conta

/**
 * Filtros para logs de auditoria
 */
export type AuditLogFilter =
  | "all"
  | "edit_role"
  | "reset_password"
  | "activation";

/**
 * Parâmetros para busca de logs de auditoria
 */
export interface AuditLogSearchParams {
  filter: AuditLogFilter;
  searchQuery: string; // Busca por email do usuário alvo
  page: number;
  pageSize: number;
}

/**
 * Resultado paginado de logs
 */
export interface AuditLogsPaginatedResult {
  logs: UserManagementLog[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

/**
 * Dados para reset de senha
 */
export interface PasswordResetData {
  userId: string;
  tempPassword: string;
}

/**
 * Resposta do gerador de senha temporária
 */
export interface TempPasswordGenerated {
  password: string;
  strength: "strong" | "medium";
}
