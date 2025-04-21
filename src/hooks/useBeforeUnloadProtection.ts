
import { useEffect } from "react";

export function useBeforeUnloadProtection(isActive: boolean) {
  useEffect(() => {
    if (!isActive) {
      localStorage.removeItem("assessmentInProgress");
      return;
    }

    // Aqui anteriormente verificávamos ao sair da página, agora vamos 
    // apenas configurar o localStorage sem mostrar diálogos de confirmação
    localStorage.setItem("assessmentInProgress", "true");
    
    return () => {
      // Limpar quando o componente for desmontado se não estiver mais ativo
      if (!isActive) {
        localStorage.removeItem("assessmentInProgress");
      }
    };
  }, [isActive]);
}
