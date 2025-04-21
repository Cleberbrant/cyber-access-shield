
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export function useKeyboardProtection(isActive: boolean) {
  const { toast } = useToast();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive) return;

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
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isActive, toast]);
}
