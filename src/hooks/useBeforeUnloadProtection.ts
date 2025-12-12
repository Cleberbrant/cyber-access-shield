import { useEffect } from "react";

/**
 * Hook para proteger contra saída acidental da página durante avaliação
 * Mostra popup do navegador apenas quando usuário tenta fechar aba/janela ou navegar via URL
 * @param isActive - Se a proteção deve estar ativa
 * @param showWarning - Se deve mostrar o popup de confirmação (default: true)
 */
export function useBeforeUnloadProtection(
  isActive: boolean,
  showWarning: boolean = true
) {
  useEffect(() => {
    if (!isActive) {
      return;
    }

    // Marcar que há uma avaliação em andamento
    localStorage.setItem("assessmentInProgress", "true");

    // Handler para prevenir fechamento acidental da aba/janela
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Apenas mostrar popup se showWarning estiver ativo
      if (showWarning) {
        const message =
          "Você está em uma avaliação. Se sair, suas respostas podem ser perdidas.";
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup function
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Limpar flag quando componente desmontar
      localStorage.removeItem("assessmentInProgress");
    };
  }, [isActive, showWarning]);
}
