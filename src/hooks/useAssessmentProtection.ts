
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
      localStorage.setItem("assessmentInProgress", "true");
    }
  }, [isAssessmentRoute, isAssessmentInProgress]);

  // Apply all protection mechanisms
  useKeyboardProtection(isActive);
  useMouseProtection(isActive);
  useBeforeUnloadProtection(isAssessmentRoute);

  // Remover a verificação adicional de beforeunload
  return { isAssessmentRoute };
}
