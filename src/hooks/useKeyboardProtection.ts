import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { logSecurityEvent, SecurityEventType } from "@/utils/secure-utils";

/**
 * Hook para proteger contra atalhos de teclado durante avaliação
 * Bloqueia: Ctrl+C/V/X/P/S/A, Alt+Tab, F12, Ctrl+Shift+I
 * Registra tentativas de fraude para painel do administrador
 * @param isActive - Se a proteção deve estar ativa
 */
export function useKeyboardProtection(isActive: boolean) {
  const { toast } = useToast();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive) return;

      // Detectar Ctrl+C, Ctrl+V, Ctrl+X (copiar/colar/recortar)
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "c" || e.key === "v" || e.key === "x")
      ) {
        e.preventDefault();

        // Log de segurança
        const eventType =
          e.key === "c"
            ? SecurityEventType.COPY_ATTEMPT
            : e.key === "v"
            ? SecurityEventType.PASTE_ATTEMPT
            : SecurityEventType.CUT_ATTEMPT;

        logSecurityEvent({
          type: eventType,
          timestamp: new Date().toISOString(),
          details: `Tentativa de ${
            e.key === "c" ? "copiar" : e.key === "v" ? "colar" : "recortar"
          } bloqueada`,
        });

        toast({
          title: "Ação Bloqueada",
          description:
            "Copiar, colar e recortar estão desativados durante a avaliação.",
          variant: "destructive",
        });
        return false;
      }

      // Detectar Ctrl+P (imprimir)
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();

        logSecurityEvent({
          type: SecurityEventType.PRINT_ATTEMPT,
          timestamp: new Date().toISOString(),
          details: "Tentativa de imprimir bloqueada",
        });

        toast({
          title: "Ação Bloqueada",
          description: "Imprimir não é permitido durante a avaliação.",
          variant: "destructive",
        });
        return false;
      }

      // Detectar Ctrl+S (salvar) e Ctrl+A (selecionar tudo)
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "a")) {
        e.preventDefault();

        logSecurityEvent({
          type: SecurityEventType.KEYBOARD_SHORTCUT,
          timestamp: new Date().toISOString(),
          details: `Atalho Ctrl+${e.key.toUpperCase()} bloqueado`,
        });

        toast({
          title: "Ação Bloqueada",
          description:
            "Atalhos de teclado estão desativados durante a avaliação.",
          variant: "destructive",
        });
        return false;
      }

      // Detectar Alt+Tab (trocar de janela)
      if (e.altKey && e.key === "Tab") {
        e.preventDefault();

        logSecurityEvent({
          type: SecurityEventType.TAB_SWITCH,
          timestamp: new Date().toISOString(),
          details: "Tentativa de alternar janelas (Alt+Tab) bloqueada",
        });

        toast({
          title: "Ação Bloqueada",
          description: "Alternar janelas não é permitido durante a avaliação.",
          variant: "destructive",
        });
        return false;
      }

      // Detectar F12 ou Ctrl+Shift+I (DevTools)
      if (e.key === "F12" || (e.ctrlKey && e.shiftKey && e.key === "I")) {
        e.preventDefault();

        logSecurityEvent({
          type: SecurityEventType.DEVTOOLS_OPENED,
          timestamp: new Date().toISOString(),
          details: "Tentativa de abrir DevTools bloqueada",
        });

        toast({
          title: "Ação Bloqueada",
          description:
            "Ferramentas de desenvolvedor não são permitidas durante a avaliação.",
          variant: "destructive",
        });
        return false;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isActive, toast]);
}
