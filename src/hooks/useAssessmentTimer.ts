import { useState, useEffect, useCallback, useRef } from "react";

export function useAssessmentTimer(
  initialTimeInMinutes: number,
  initialTimeElapsed: number = 0,
  onTimeUp: () => void,
  onProgressUpdate?: (timeElapsed: number) => void
) {
  // Garantir que initialTimeInMinutes seja um número válido
  // Se for zero, undefined ou NaN, será tratado como 1 minuto (valor mínimo)
  const validTime =
    typeof initialTimeInMinutes === "number" &&
    !isNaN(initialTimeInMinutes) &&
    initialTimeInMinutes > 0
      ? initialTimeInMinutes
      : 1; // Valor mínimo de 1 minuto como fallback

  // Calcular tempo restante baseado no tempo decorrido
  const totalTimeSeconds = validTime * 60;
  const initialTimeRemaining = Math.max(
    0,
    totalTimeSeconds - initialTimeElapsed
  );

  const [timeLeft, setTimeLeft] = useState(initialTimeRemaining);
  const [timeElapsed, setTimeElapsed] = useState(initialTimeElapsed);
  const initialTimeRef = useRef(validTime);
  const onTimeUpRef = useRef(onTimeUp);
  const onProgressUpdateRef = useRef(onProgressUpdate);

  // Atualizar a referência do callback quando ele mudar
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
    onProgressUpdateRef.current = onProgressUpdate;
  }, [onTimeUp, onProgressUpdate]);

  useEffect(() => {
    // Se o valor mudou e é válido, atualizar o timer
    if (
      typeof initialTimeInMinutes === "number" &&
      !isNaN(initialTimeInMinutes) &&
      initialTimeInMinutes > 0
    ) {
      const newTotalSeconds = initialTimeInMinutes * 60;
      const newTimeRemaining = Math.max(
        0,
        newTotalSeconds - initialTimeElapsed
      );
      setTimeLeft(newTimeRemaining);
      setTimeElapsed(initialTimeElapsed);
      initialTimeRef.current = initialTimeInMinutes;
    }
  }, [initialTimeInMinutes, initialTimeElapsed]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Verificar se o callback existe antes de chamá-lo
          if (typeof onTimeUpRef.current === "function") {
            onTimeUpRef.current();
          }
          return 0;
        }
        return prev - 1;
      });

      // Atualizar tempo decorrido
      setTimeElapsed((prev) => {
        const newElapsed = prev + 1;

        // Callback de progresso a cada segundo
        if (typeof onProgressUpdateRef.current === "function") {
          onProgressUpdateRef.current(newElapsed);
        }

        return newElapsed;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTimeLeft = useCallback(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }, [timeLeft]);

  return { timeLeft, timeElapsed, formatTimeLeft };
}
