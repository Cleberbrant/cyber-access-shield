
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { enableAssessmentProtection, disableAssessmentProtection } from "@/utils/secure-utils";

export function useAssessmentProtection() {
  const location = useLocation();
  const { toast } = useToast();
  const isAssessmentRoute = location.pathname.includes('/assessment/') && !location.pathname.includes('/assessment-result/');

  useEffect(() => {
    // Se NÃO estiver em uma rota de avaliação, garantir que as proteções estejam desabilitadas
    if (!isAssessmentRoute) {
      disableAssessmentProtection();
      localStorage.removeItem("assessmentInProgress");
    }
    
    // Apenas configurar o listener de beforeunload se estiver em uma rota de avaliação
    if (isAssessmentRoute) {
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
    }
  }, [isAssessmentRoute]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isAssessmentInProgress = localStorage.getItem("assessmentInProgress") === "true";
      
      if (isAssessmentInProgress && isAssessmentRoute) {
        if ((e.ctrlKey || e.metaKey) && 
            (e.key === "c" || e.key === "v" || e.key === "x" || 
             e.key === "p" || e.key === "s" || e.key === "a")) {
          e.preventDefault();
          toast({
            title: "Ação Bloqueada",
            description: "Atalhos de teclado estão desativados durante a avaliação.",
            variant: "destructive"
          });
          return false;
        }
        
        if (e.altKey && e.key === "Tab") {
          e.preventDefault();
          toast({
            title: "Ação Bloqueada",
            description: "Alternar janelas não é permitido durante a avaliação.",
            variant: "destructive"
          });
          return false;
        }
        
        if (e.key === "F12") {
          e.preventDefault();
          toast({
            title: "Ação Bloqueada",
            description: "Ferramentas de desenvolvedor não são permitidas durante a avaliação.",
            variant: "destructive"
          });
          return false;
        }
      }
    };
    
    const handleMouseLeave = (e: MouseEvent) => {
      const isAssessmentInProgress = localStorage.getItem("assessmentInProgress") === "true";
      
      if (isAssessmentInProgress && isAssessmentRoute && e.clientY <= 0) {
        toast({
          title: "Ação Bloqueada",
          description: "Por favor, mantenha o foco na avaliação.",
          variant: "destructive"
        });
      }
    };
    
    const handleContextMenu = (e: MouseEvent) => {
      const isAssessmentInProgress = localStorage.getItem("assessmentInProgress") === "true";
      
      if (isAssessmentInProgress && isAssessmentRoute) {
        e.preventDefault();
        toast({
          title: "Ação Bloqueada",
          description: "Menu de contexto está desativado durante a avaliação.",
          variant: "destructive"
        });
        return false;
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("contextmenu", handleContextMenu);
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [toast, isAssessmentRoute]);

  return { isAssessmentRoute };
}
