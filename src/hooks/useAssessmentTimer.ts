
import { useState, useEffect, useCallback } from "react";

export function useAssessmentTimer(initialTimeInMinutes: number, onTimeUp: () => void) {
  // Garantir que initialTimeInMinutes seja um número válido
  // Se for zero, undefined ou NaN, será tratado como 0
  const validTime = typeof initialTimeInMinutes === 'number' && !isNaN(initialTimeInMinutes) && initialTimeInMinutes > 0 
    ? initialTimeInMinutes 
    : 0;
  
  const [timeLeft, setTimeLeft] = useState(validTime * 60);
  
  console.log("Timer recebeu duração:", initialTimeInMinutes, "minutos");
  console.log("Timer usando duração validada:", validTime, "minutos");
  console.log("Tempo total em segundos:", validTime * 60);

  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const formatTimeLeft = useCallback(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  return { timeLeft, formatTimeLeft };
}
