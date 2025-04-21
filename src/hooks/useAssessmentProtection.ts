
import { useLocation } from "react-router-dom";
import { enableAssessmentProtection, disableAssessmentProtection } from "@/utils/secure-utils";
import { useKeyboardProtection } from "./useKeyboardProtection";
import { useMouseProtection } from "./useMouseProtection";
import { useBeforeUnloadProtection } from "./useBeforeUnloadProtection";
import { useEffect } from "react";

export function useAssessmentProtection() {
  const location = useLocation();
  const isAssessmentRoute = location.pathname.includes('/assessment/') && !location.pathname.includes('/assessment-result/');
  const isAssessmentInProgress = localStorage.getItem("assessmentInProgress") === "true";
  const isActive = isAssessmentRoute && isAssessmentInProgress;

  // Efeito para garantir que a flag de avaliação em andamento seja consistente
  useEffect(() => {
    if (isAssessmentRoute && !isAssessmentInProgress) {
      // Se estamos na rota de avaliação mas a flag não está definida,
      // vamos defini-la para garantir consistência
      localStorage.setItem("assessmentInProgress", "true");
      console.log("Flag de avaliação em andamento definida por useAssessmentProtection");
    } else if (!isAssessmentRoute && isAssessmentInProgress) {
      // Se saímos da rota de avaliação mas a flag ainda está definida,
      // é possível que seja um caso de navegação entre rotas não relacionadas à avaliação
      // Vamos verificar se a rota atual é o dashboard ou resultado
      if (location.pathname.includes('/dashboard') || location.pathname.includes('/assessment-result')) {
        // Aqui podemos limpar com segurança
        console.log("Flag de avaliação em andamento removida por useAssessmentProtection - navegação para dashboard/result");
        localStorage.removeItem("assessmentInProgress");
      }
    }
  }, [isAssessmentRoute, isAssessmentInProgress, location.pathname]);

  // Apply all protection mechanisms
  useKeyboardProtection(isActive);
  useMouseProtection(isActive);
  useBeforeUnloadProtection(isAssessmentRoute);

  return { isAssessmentRoute, isActive };
}
