
import { useState, useEffect, useCallback } from "react";

export function useAssessmentTimer(initialTimeInMinutes: number, onTimeUp: () => void) {
  const [timeLeft, setTimeLeft] = useState(initialTimeInMinutes * 60);

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
