import { useLocation } from "react-router-dom";
import { useKeyboardProtection } from "./useKeyboardProtection";
import { useMouseProtection } from "./useMouseProtection";
import { useBeforeUnloadProtection } from "./useBeforeUnloadProtection";
import { useWindowBlurProtection } from "./useWindowBlurProtection";
import { useEffect, useState } from "react";
import { isAdminSync } from "@/utils/secure-utils";
import { supabase } from "@/integrations/supabase/client";

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
    const checkAdminStatus = () => {
      const adminStatus = isAdminSync();
      setIsUserAdmin(adminStatus);
    };

    // Checar imediatamente
    checkAdminStatus();

    // Recheck quando localStorage mudar (após login, logout, etc)
    window.addEventListener("storage", checkAdminStatus);

    // Listener de mudança de autenticação do Supabase
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔑 Auth state change:", event);

      if (event === "SIGNED_OUT") {
        // Limpar estado de admin ao fazer logout
        localStorage.removeItem("isAdmin");
        setIsUserAdmin(null);
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        // Revalidar status de admin ao fazer login ou refresh
        checkAdminStatus();
      }
    });

    return () => {
      window.removeEventListener("storage", checkAdminStatus);
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

  // Aplicar proteções via hooks
  useKeyboardProtection(shouldProtect);
  useMouseProtection(shouldProtect);
  useBeforeUnloadProtection(shouldShowBeforeUnload, shouldShowBeforeUnload);

  // Obter assessmentId e sessionId da URL para passar ao hook de blur
  const assessmentId = location.pathname.match(/\/assessment\/([^/?]+)/)?.[1];
  const searchParams = new URLSearchParams(location.search);
  const sessionId = searchParams.get("session");

  useWindowBlurProtection(shouldDetectBlur, assessmentId, sessionId);

  // Log para debug
  useEffect(() => {
    console.log("useAssessmentProtection:", {
      route: location.pathname,
      isAdmin: isUserAdmin,
      shouldProtect,
      shouldShowBeforeUnload,
      isAssessmentRoute,
      isAssessmentInProgress,
    });
  }, [
    location.pathname,
    isUserAdmin,
    shouldProtect,
    shouldShowBeforeUnload,
    isAssessmentRoute,
    isAssessmentInProgress,
  ]);

  return {
    isAssessmentRoute,
    isActive: shouldProtect,
    isAdmin: isUserAdmin,
  };
}
