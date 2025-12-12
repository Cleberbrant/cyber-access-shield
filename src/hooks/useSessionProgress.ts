import { useEffect, useRef } from "react";
import { saveSessionProgress } from "@/utils/session-progress";

/**
 * Hook para salvar automaticamente o progresso da sessão
 * Salva periodicamente (a cada 5 segundos) e quando questão muda
 *
 * @param sessionId ID da sessão atual
 * @param currentQuestionIndex Índice da questão atual
 * @param timeElapsed Tempo decorrido em segundos
 * @param enabled Se o salvamento automático está habilitado
 */
export function useSessionProgress(
  sessionId: string | null,
  currentQuestionIndex: number,
  timeElapsed: number,
  enabled: boolean = true
) {
  const lastSavedTime = useRef<number>(0);
  const lastSavedQuestion = useRef<number>(-1);
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Função para salvar progresso
  const saveProgress = async () => {
    if (!sessionId || !enabled) return;

    const success = await saveSessionProgress(
      sessionId,
      currentQuestionIndex,
      timeElapsed
    );

    if (success) {
      lastSavedTime.current = timeElapsed;
      lastSavedQuestion.current = currentQuestionIndex;
    }
  };

  // Salvar quando a questão muda
  useEffect(() => {
    if (currentQuestionIndex !== lastSavedQuestion.current) {
      saveProgress();
    }
  }, [currentQuestionIndex]);

  // Salvar periodicamente (a cada 5 segundos)
  useEffect(() => {
    if (!sessionId || !enabled) return;

    // Limpar intervalo anterior se existir
    if (saveIntervalRef.current) {
      clearInterval(saveIntervalRef.current);
    }

    // Criar novo intervalo
    saveIntervalRef.current = setInterval(() => {
      // Só salvar se houve mudança significativa (mais de 3 segundos)
      if (Math.abs(timeElapsed - lastSavedTime.current) >= 3) {
        saveProgress();
      }
    }, 5000); // A cada 5 segundos

    // Cleanup
    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, [sessionId, timeElapsed, enabled]);

  // Salvar ao desmontar o componente
  useEffect(() => {
    return () => {
      if (sessionId && enabled) {
        saveSessionProgress(sessionId, currentQuestionIndex, timeElapsed);
      }
    };
  }, []);

  // Retornar função para forçar salvamento manual
  return {
    forceSave: saveProgress,
  };
}
