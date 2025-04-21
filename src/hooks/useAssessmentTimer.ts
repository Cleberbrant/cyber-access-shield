
import { useState, useEffect, useCallback } from "react";

export function useAssessmentTimer(initialTimeInMinutes: number, onTimeUp: () => void) {
  // Garantir que initialTimeInMinutes não seja zero ou negativo
  // Converter explicitamente para número para garantir que não seja string
  const validTime = Math.max(Number(initialTimeInMinutes) || 1, 1);
  const [timeLeft, setTimeLeft] = useState(validTime * 60);
  
  // Log para debug da duração inicial
  console.log("Duração inicial recebida:", initialTimeInMinutes, "minutos");
  console.log("Duração validada para uso:", validTime, "minutos");
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
