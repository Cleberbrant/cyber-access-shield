import { UserManagementAction, TempPasswordGenerated } from "@/types/user";

// =============================================================================
// UTILITÁRIOS PARA GERENCIAMENTO DE USUÁRIOS
// =============================================================================

/**
 * Gera senha temporária forte no formato: Temp2025@Abc123
 * - Começa com "Temp"
 * - Ano atual
 * - Símbolo @
 * - 3 letras maiúsculas aleatórias
 * - 3 números aleatórios
 */
export function generateTempPassword(): TempPasswordGenerated {
  const year = new Date().getFullYear();

  // Gerar 3 letras maiúsculas aleatórias
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const randomLetters = Array.from({ length: 3 }, () =>
    letters.charAt(Math.floor(Math.random() * letters.length)),
  ).join("");

  // Gerar 3 números aleatórios
  const randomNumbers = Array.from({ length: 3 }, () =>
    Math.floor(Math.random() * 10),
  ).join("");

  const password = `Temp${year}@${randomLetters}${randomNumbers}`;

  return {
    password,
    strength: "strong",
  };
}

/**
 * Valida se senha atende aos requisitos mínimos
 * - Mínimo 8 caracteres
 * - Pelo menos 1 maiúscula
 * - Pelo menos 1 minúscula
 * - Pelo menos 1 número
 * - Pelo menos 1 caractere especial
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Senha deve ter no mínimo 8 caracteres");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Senha deve conter pelo menos 1 letra maiúscula");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Senha deve conter pelo menos 1 letra minúscula");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Senha deve conter pelo menos 1 número");
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("Senha deve conter pelo menos 1 caractere especial");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Formata data para exibição (PT-BR)
 */
export function formatDate(dateString: string | null): string {
  if (!dateString) return "Nunca";

  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Formata data curta (apenas data, sem hora)
 */
export function formatShortDate(dateString: string | null): string {
  if (!dateString) return "—";

  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

/**
 * Formata data relativa (há X tempo)
 */
export function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return "Nunca";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Agora mesmo";
  if (diffMins < 60) return `Há ${diffMins} minuto${diffMins > 1 ? "s" : ""}`;
  if (diffHours < 24) return `Há ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
  if (diffDays < 30) return `Há ${diffDays} dia${diffDays > 1 ? "s" : ""}`;

  return formatShortDate(dateString);
}

/**
 * Gera display_name a partir do email (parte antes do @)
 */
export function generateDisplayNameFromEmail(email: string): string {
  const username = email.split("@")[0];

  // Capitalizar primeira letra de cada palavra (separadas por . _ -)
  return username
    .split(/[._-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Traduz ação de auditoria para português
 */
export function translateAction(action: UserManagementAction): string {
  const translations: Record<UserManagementAction, string> = {
    edit_role: "Alterou tipo de conta",
    edit_display_name: "Alterou nome de exibição",
    reset_password: "Resetou senha",
    self_password_change: "Alterou própria senha",
    self_display_name_change: "Alterou próprio nome",
    deactivate: "Desativou conta",
    activate: "Reativou conta",
  };

  return translations[action] || action;
}

/**
 * Formata valores antigos/novos do log de auditoria
 */
export function formatLogValue(
  action: UserManagementAction,
  value: any,
): string {
  if (value === null || value === undefined) return "—";

  // Para mudança de tipo de conta
  if (action === "edit_role") {
    return value.is_admin ? "Administrador" : "Aluno";
  }

  // Para mudança de status
  if (action === "deactivate" || action === "activate") {
    return value.is_active ? "Ativa" : "Inativa";
  }

  // Para display_name
  if (action === "edit_display_name" || action === "self_display_name_change") {
    return value.display_name || "—";
  }

  // Para senha (não mostrar a senha em si)
  if (action === "reset_password") {
    return "••••••••";
  }

  // Genérico
  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

/**
 * Valida display_name
 */
export function validateDisplayName(name: string): {
  isValid: boolean;
  error?: string;
} {
  if (!name || name.trim().length === 0) {
    return {
      isValid: false,
      error: "Nome de exibição não pode ser vazio",
    };
  }

  if (name.length < 2) {
    return {
      isValid: false,
      error: "Nome deve ter no mínimo 2 caracteres",
    };
  }

  if (name.length > 100) {
    return {
      isValid: false,
      error: "Nome deve ter no máximo 100 caracteres",
    };
  }

  return { isValid: true };
}

/**
 * Copia texto para área de transferência
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Erro ao copiar para área de transferência:", error);
    return false;
  }
}

/**
 * Verifica se senha temporária está expirada (mais de 30 dias)
 */
export function isTempPasswordExpired(createdAt: string | null): boolean {
  if (!createdAt) return false;

  const created = new Date(createdAt);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - created.getTime()) / 86400000);

  return diffDays > 30;
}

/**
 * Valida email
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitiza entrada de texto
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}
