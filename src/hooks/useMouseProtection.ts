
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export function useMouseProtection(isActive: boolean) {
  const { toast } = useToast();

  useEffect(() => {
    // Removendo o evento de mouse leave para evitar o popup
    
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
    
    // Mantemos apenas o bloqueio do menu de contexto, mas removemos o evento mouseleave
    document.addEventListener("contextmenu", handleContextMenu);
    
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [isActive, toast]);
}
