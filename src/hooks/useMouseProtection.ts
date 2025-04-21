
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export function useMouseProtection(isActive: boolean) {
  const { toast } = useToast();

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (isActive && e.clientY <= 0) {
        toast({
          title: "Ação Bloqueada",
          description: "Por favor, mantenha o foco na avaliação.",
          variant: "destructive"
        });
      }
    };
    
    const handleContextMenu = (e: MouseEvent) => {
      if (isActive) {
        e.preventDefault();
        toast({
          title: "Ação Bloqueada",
          description: "Menu de contexto está desativado durante a avaliação.",
          variant: "destructive"
        });
        return false;
      }
    };
    
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("contextmenu", handleContextMenu);
    
    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [isActive, toast]);
}
