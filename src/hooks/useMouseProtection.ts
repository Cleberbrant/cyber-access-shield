import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export function useMouseProtection(isActive: boolean) {
  const { toast } = useToast();
  const isPopupVisible = useRef(false);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (isActive && !isPopupVisible.current) {
        e.preventDefault();
        isPopupVisible.current = true;
        toast({
          title: "Ação Bloqueada",
          description: "Menu de contexto está desativado durante a avaliação.",
          variant: "destructive",
        });

        setTimeout(() => {
          isPopupVisible.current = false;
        }, 3000); // Tempo para evitar múltiplos popups

        return false;
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [isActive, toast]);
}
