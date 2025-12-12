import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { logSecurityEvent, SecurityEventType } from "@/utils/secure-utils";

/**
 * Hook para proteger contra menu de contexto (botão direito)
 * Registra tentativas de fraude para painel do administrador
 * @param isActive - Se a proteção deve estar ativa
 */
export function useMouseProtection(isActive: boolean) {
  const { toast } = useToast();
  const isPopupVisible = useRef(false);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (isActive) {
        // SEMPRE bloqueia o menu de contexto se proteção está ativa
        e.preventDefault();

        // Apenas mostra toast e loga se não estiver em cooldown
        // Isso evita spam de notificações mas mantém o bloqueio
        if (!isPopupVisible.current) {
          isPopupVisible.current = true;

          // Log de segurança
          logSecurityEvent({
            type: SecurityEventType.CONTEXT_MENU_ATTEMPT,
            timestamp: new Date().toISOString(),
            details:
              "Tentativa de abrir menu de contexto (botão direito) bloqueada",
          });

          toast({
            title: "Ação Bloqueada",
            description:
              "Menu de contexto está desativado durante a avaliação.",
            variant: "destructive",
          });

          // Cooldown de 3 segundos apenas para notificações
          setTimeout(() => {
            isPopupVisible.current = false;
          }, 3000);
        }

        return false;
      }
    };
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [isActive, toast]);
}
