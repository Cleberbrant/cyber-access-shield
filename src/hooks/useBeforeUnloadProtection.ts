
import { useEffect } from "react";

export function useBeforeUnloadProtection(isActive: boolean) {
  useEffect(() => {
    if (!isActive) {
      return;
    }

    // Aqui apenas configuramos o localStorage para persistir informação
    // de que há uma avaliação em andamento, sem diálogos
    localStorage.setItem("assessmentInProgress", "true");
    
    // Adicionamos um handler simples para tentar prevenir fechamento acidental
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const message = "Você está em uma avaliação. Se sair, suas respostas podem ser perdidas.";
      e.returnValue = message;
      return message;
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Cleanup function
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isActive]);
}
