/**
 * Utilitários para manipulação e exibição de logs de fraude
 */

/**
 * Mascara um endereço IP para privacidade
 * Exemplo: 192.168.1.100 -> 192.168.*.**
 */
export function maskIP(ip: string | null): string {
  if (!ip) return "N/A";

  const parts = ip.split(".");

  // IPv4
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.*.***`;
  }

  // IPv6 (simplificado)
  if (ip.includes(":")) {
    const segments = ip.split(":");
    return segments.slice(0, 3).join(":") + ":****";
  }

  return ip.substring(0, 8) + "****";
}

/**
 * Formata tipo de evento para exibição em português
 */
export function formatEventType(eventType: string): string {
  const eventNames: Record<string, string> = {
    devtools_opened: "DevTools Aberto",
    context_menu_attempt: "Menu de Contexto",
    copy_attempt: "Tentativa de Cópia",
    paste_attempt: "Tentativa de Colar",
    cut_attempt: "Tentativa de Recorte",
    print_attempt: "Tentativa de Impressão",
    keyboard_shortcut: "Atalho de Teclado",
    tab_switch: "Troca de Aba",
    window_blur: "Saiu da Janela",
    window_focus: "Retornou à Janela",
    fullscreen_exit: "Saiu de Tela Cheia",
    assessment_cancelled: "Avaliação Cancelada",
    assessment_started: "Avaliação Iniciada",
  };

  return eventNames[eventType] || eventType;
}

/**
 * Retorna cor/severidade do evento
 */
export function getEventSeverity(eventType: string): {
  color: string;
  badge: "destructive" | "default" | "secondary";
} {
  const critical = ["devtools_opened", "tab_switch", "assessment_cancelled"];
  const medium = [
    "copy_attempt",
    "context_menu_attempt",
    "print_attempt",
    "cut_attempt",
    "paste_attempt",
  ];

  if (critical.includes(eventType)) {
    return { color: "text-destructive", badge: "destructive" };
  }

  if (medium.includes(eventType)) {
    return { color: "text-yellow-600 dark:text-yellow-500", badge: "default" };
  }

  return { color: "text-cyber-blue", badge: "secondary" };
}

/**
 * Formata timestamp para exibição
 */
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

/**
 * Formata timestamp de forma relativa (ex: "há 5 minutos")
 */
export function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "agora mesmo";
  if (diffMins < 60) return `há ${diffMins} minuto${diffMins > 1 ? "s" : ""}`;
  if (diffHours < 24) return `há ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
  if (diffDays < 7) return `há ${diffDays} dia${diffDays > 1 ? "s" : ""}`;

  return formatTimestamp(timestamp);
}
