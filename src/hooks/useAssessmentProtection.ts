import { useLocation } from "react-router-dom";
import { useKeyboardProtection } from "./useKeyboardProtection";
import { useMouseProtection } from "./useMouseProtection";
import { useBeforeUnloadProtection } from "./useBeforeUnloadProtection";
import { useWindowBlurProtection } from "./useWindowBlurProtection";
import { useEffect, useState } from "react";
import {
  isAdmin,
  logSecurityEvent,
  SecurityEventType,
} from "@/utils/secure-utils";
import { supabase } from "@/integrations/supabase/client";
import { isElectron } from "@/utils/electron";

/**
 * Hook central para gerenciar proteções de segurança
 * Aplica proteções baseadas na rota e perfil do usuário
 *
 * REGRAS:
 * - ALUNOS: Proteções de teclado/mouse ativas em todo sistema autenticado
 * - ADMINS: Sem proteções (para facilitar desenvolvimento/debug)
 * - Popup beforeunload: APENAS em rotas /assessment/:id (durante avaliação)
 */
export function useAssessmentProtection() {
  const location = useLocation();
  const [isUserAdmin, setIsUserAdmin] = useState<boolean | null>(null);

  // Verificar se é rota de avaliação (não inclui resultado)
  const isAssessmentRoute =
    location.pathname.includes("/assessment/") &&
    !location.pathname.includes("/assessment-result/");

  // Verificar se há avaliação em andamento
  const isAssessmentInProgress =
    localStorage.getItem("assessmentInProgress") === "true";

  // Verificar perfil do usuário
  useEffect(() => {
    const checkAdminStatus = async () => {
      const adminStatus = await isAdmin();
      setIsUserAdmin(adminStatus);
    };

    // Checar imediatamente
    checkAdminStatus();

    // Listener de mudança de autenticação do Supabase
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setIsUserAdmin(null);
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        checkAdminStatus();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Determinar se proteções de teclado/mouse devem estar ativas
  // OPÇÃO C: Proteger por padrão, exceto admins confirmados
  // Isso garante que nunca há período desprotegido para alunos
  const shouldProtect = isUserAdmin !== true; // Protege se não for admin confirmado

  // Determinar se popup beforeunload deve estar ativo
  // ATIVO apenas dentro da rota de avaliação
  const shouldShowBeforeUnload = isAssessmentRoute && isAssessmentInProgress;

  // Determinar se detecção de blur/focus deve estar ativa
  // ATIVO apenas durante avaliação em andamento (OPÇÃO A da Decisão 1)
  const shouldDetectBlur =
    isAssessmentRoute && isAssessmentInProgress && isUserAdmin !== true;

  // Obter assessmentId e sessionId da URL para passar aos hooks
  const assessmentId = /\/assessment\/([^/?]+)/.exec(location.pathname)?.[1];
  const searchParams = new URLSearchParams(location.search);
  const sessionId = searchParams.get("session");

  // Desktop (Electron): kiosk total durante a prova, liberado fora dela.
  // Cobre início (flag + rota → on), término normal (navega p/ resultado → off)
  // e cancelamento por 3 avisos (flag removida → off).
  useEffect(() => {
    if (!isElectron()) return;
    if (shouldDetectBlur) {
      window.electronAPI?.enterKioskMode();
    } else {
      window.electronAPI?.exitKioskMode();
    }
    return () => {
      window.electronAPI?.exitKioskMode();
    };
  }, [shouldDetectBlur]);

  // Desktop (Electron): loga eventos do processo main (atalhos bloqueados,
  // refocus em blur, tentativa de fechar) reusando o RPC existente.
  useEffect(() => {
    if (!isElectron() || !shouldDetectBlur) return;
    const unsubscribe = window.electronAPI?.onSecurityEvent((event) => {
      const type =
        event.type === "WINDOW_BLUR_ELECTRON"
          ? SecurityEventType.WINDOW_BLUR
          : SecurityEventType.KEYBOARD_SHORTCUT;
      logSecurityEvent({
        type,
        timestamp: new Date().toISOString(),
        details: `electron:${event.type}${event.details ? `:${event.details}` : ""}`,
        assessmentId,
        sessionId: sessionId || undefined,
      });
    });
    return unsubscribe;
  }, [shouldDetectBlur, assessmentId, sessionId]);

  // Aplicar proteções via hooks
  useKeyboardProtection(shouldProtect, assessmentId, sessionId || undefined);
  useMouseProtection(shouldProtect, assessmentId, sessionId || undefined);
  useBeforeUnloadProtection(shouldShowBeforeUnload, shouldShowBeforeUnload);
  useWindowBlurProtection(
    shouldDetectBlur,
    assessmentId,
    sessionId || undefined
  );

  // Log para debug
  useEffect(() => {
  }, [
    location.pathname,
    isUserAdmin,
    shouldProtect,
    shouldShowBeforeUnload,
    shouldDetectBlur,
    isAssessmentRoute,
    isAssessmentInProgress,
    assessmentId,
    sessionId,
  ]);

  return {
    isAssessmentRoute,
    isActive: shouldProtect,
    isAdmin: isUserAdmin,
  };
}
