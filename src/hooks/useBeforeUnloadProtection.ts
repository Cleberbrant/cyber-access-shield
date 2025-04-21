
import { useEffect } from "react";

export function useBeforeUnloadProtection(isActive: boolean) {
  useEffect(() => {
    if (!isActive) {
      return;
    }

    // Aqui apenas configuramos o localStorage para persistir informação
    // de que há uma avaliação em andamento, sem diálogos
    localStorage.setItem("assessmentInProgress", "true");
    
    // Não precisamos de cleanup, pois a verificação do localStorage
    // será feita em outras partes da aplicação
  }, [isActive]);
}
