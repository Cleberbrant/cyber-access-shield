import { supabase } from "@/integrations/supabase/client";

// =============================================================================
// UTILITÁRIOS DE SEGURANÇA - FUNÇÕES AUXILIARES PURAS
// =============================================================================
// Este arquivo contém apenas funções auxiliares para detecção e validação.
// A APLICAÇÃO das proteções é feita pelos hooks (useKeyboardProtection, etc)
// =============================================================================

/**
 * Detecta se as ferramentas de desenvolvedor estão abertas
 * Baseado na diferença entre tamanho da janela interna e externa
 * @returns true se DevTools provavelmente está aberto
 */
export const detectDevTools = (): boolean => {
  const threshold = 160;
  const widthThreshold = window.outerWidth - window.innerWidth > threshold;
  const heightThreshold = window.outerHeight - window.innerHeight > threshold;

  return widthThreshold || heightThreshold;
};

/**
 * Previne seleção de texto e cópia visual
 * Usado para proteger conteúdo de avaliações
 */
export const preventScreenCapture = (): void => {
  document.documentElement.style.webkitUserSelect = "none";
  document.documentElement.style.userSelect = "none";

  // Adicionando classes CSS para prevenir impressão e cópia
  document.body.classList.add("secure-content", "no-print");
};

/**
 * Remove proteções visuais de seleção
 */
export const allowScreenCapture = (): void => {
  document.documentElement.style.webkitUserSelect = "";
  document.documentElement.style.userSelect = "";

  document.body.classList.remove("secure-content", "no-print");
};

/**
 * Sanitiza entrada de texto para prevenir XSS
 * @param input - String a ser sanitizada
 * @returns String segura para uso
 */
export const sanitizeInput = (input: string): string => {
  const div = document.createElement("div");
  div.textContent = input;
  return div.innerHTML;
};

/**
 * Garante que JavaScript está habilitado (remove avisos de noscript)
 */
export const ensureJavaScriptEnabled = (): void => {
  const noScriptElements = document.querySelectorAll("noscript");
  noScriptElements.forEach((el) => {
    (el as HTMLElement).style.display = "none";
  });

  const jsWarning = document.getElementById("js-disabled-warning");
  if (jsWarning) {
    jsWarning.style.display = "none";
  }
};

// =============================================================================
// FUNÇÕES DE AUTENTICAÇÃO E AUTORIZAÇÃO
// =============================================================================

/**
 * Verifica se o usuário está autenticado (versão assíncrona)
 * @returns Promise<boolean>
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return !!session;
};

/**
 * Verifica se o usuário é administrador
 * @returns Promise<boolean>
 */
export const isAdmin = async (): Promise<boolean> => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return false;

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", session.user.id)
      .single();

    if (error || !profile) {
      console.error("Erro ao verificar permissões de administrador:", error);
      return false;
    }

    return profile.is_admin === true;
  } catch (error) {
    console.error("Erro ao verificar permissões de administrador:", error);
    return false;
  }
};

/**
 * Verifica autenticação de forma síncrona (menos confiável)
 * Use apenas quando versão assíncrona não for viável
 */
export const isAuthenticatedSync = (): boolean => {
  const session = localStorage.getItem("sb-erbyxhjehrvpxvfycxwx-auth-token");
  return !!session;
};

/**
 * Verifica admin de forma síncrona via localStorage
 * Use apenas quando versão assíncrona não for viável
 */
export const isAdminSync = (): boolean => {
  try {
    const isAdminValue = localStorage.getItem("isAdmin");
    if (isAdminValue) {
      return isAdminValue === "true";
    }
    return false;
  } catch (error) {
    console.error("Erro ao verificar permissões de administrador:", error);
    return false;
  }
};

/**
 * Atualiza o status de admin no localStorage para acesso síncrono
 */
export const updateAdminStatus = async (): Promise<void> => {
  const adminStatus = await isAdmin();
  localStorage.setItem("isAdmin", adminStatus.toString());
};

// =============================================================================
// SISTEMA DE LOGGING DE FRAUDES (para painel do professor)
// =============================================================================

/**
 * Tipos de eventos de segurança que podem ser registrados
 */
export enum SecurityEventType {
  DEVTOOLS_OPENED = "devtools_opened",
  CONTEXT_MENU_ATTEMPT = "context_menu_attempt",
  COPY_ATTEMPT = "copy_attempt",
  PASTE_ATTEMPT = "paste_attempt",
  CUT_ATTEMPT = "cut_attempt",
  PRINT_ATTEMPT = "print_attempt",
  KEYBOARD_SHORTCUT = "keyboard_shortcut",
  TAB_SWITCH = "tab_switch",
  WINDOW_BLUR = "window_blur",
  WINDOW_FOCUS = "window_focus",
  FULLSCREEN_EXIT = "fullscreen_exit",
  ASSESSMENT_CANCELLED = "assessment_cancelled",
  ASSESSMENT_STARTED = "assessment_started",
}

/**
 * Interface para eventos de segurança
 */
export interface SecurityEvent {
  type: SecurityEventType;
  timestamp: string;
  details?: string;
  userId?: string;
  assessmentId?: string;
  sessionId?: string;
}

/**
 * Registra um evento de tentativa de fraude no banco de dados
 * Para uso futuro no painel do administrador
 * @param event - Evento de segurança a ser registrado
 */
export const logSecurityEvent = async (event: SecurityEvent): Promise<void> => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      console.warn("Tentativa de log sem sessão ativa");
      return;
    }

    // Log local para desenvolvimento/debug
    console.warn(`⚠️ EVENTO DE SEGURANÇA: ${event.type}`, {
      timestamp: event.timestamp,
      details: event.details,
      userId: session.user.id,
      assessmentId: event.assessmentId,
      sessionId: event.sessionId,
    });

    // Usar RPC para capturar IP automaticamente via inet_client_addr()
    const { error } = await supabase.rpc("insert_security_log", {
      p_event_type: event.type,
      p_event_details: event.details || null,
      p_assessment_id: event.assessmentId || null,
      p_session_id: event.sessionId || null,
    });

    if (error) {
      console.error("Erro ao registrar evento de segurança:", error);
    } else {
      console.log("✅ Evento de segurança registrado no banco de dados");
    }
  } catch (error) {
    console.error("Erro ao processar log de segurança:", error);
  }
};

/**
 * Obtém informações do usuário atual para logging
 * @returns Objeto com userId e email
 */
export const getCurrentUserInfo = async (): Promise<{
  userId: string;
  email: string;
} | null> => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return null;

    return {
      userId: session.user.id,
      email: session.user.email || "unknown",
    };
  } catch (error) {
    console.error("Erro ao obter informações do usuário:", error);
    return null;
  }
};
