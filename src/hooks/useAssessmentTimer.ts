import { useState, useEffect, useCallback, useRef } from "react";

export function useAssessmentTimer(
  initialTimeInMinutes: number,
  onTimeUp: () => void
) {
  // Garantir que initialTimeInMinutes seja um número válido
  // Se for zero, undefined ou NaN, será tratado como 1 minuto (valor mínimo)
  const validTime =
    typeof initialTimeInMinutes === "number" &&
    !isNaN(initialTimeInMinutes) &&
    initialTimeInMinutes > 0
      ? initialTimeInMinutes
      : 1; // Valor mínimo de 1 minuto como fallback

  const [timeLeft, setTimeLeft] = useState(validTime * 60);
  const initialTimeRef = useRef(validTime);
  const onTimeUpRef = useRef(onTimeUp);

  // Atualizar a referência do callback quando ele mudar
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    // Se o valor mudou e é válido, atualizar o timer
    if (
      typeof initialTimeInMinutes === "number" &&
      !isNaN(initialTimeInMinutes) &&
      initialTimeInMinutes > 0
    ) {
      setTimeLeft(initialTimeInMinutes * 60);
      initialTimeRef.current = initialTimeInMinutes;
    }
  }, [initialTimeInMinutes]);

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

  return { timeLeft, formatTimeLeft };
}
