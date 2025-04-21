
import { useEffect } from "react";

export function useBeforeUnloadProtection(isActive: boolean) {
  useEffect(() => {
    if (!isActive) {
      localStorage.removeItem("assessmentInProgress");
      return;
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const isAssessmentInProgress = localStorage.getItem("assessmentInProgress");
      if (isAssessmentInProgress === "true") {
        e.preventDefault();
        e.returnValue = "Você tem uma avaliação em andamento. Sair desta página pode resultar em perda de progresso.";
        return e.returnValue;
      }
    };
    
    window.addEventListener("beforeunload", handleBeforeUnload);
    
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isActive]);
}
