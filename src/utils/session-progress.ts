import { supabase } from "@/integrations/supabase/client";

/**
 * Interface para o progresso da sessão
 */
export interface SessionProgress {
  currentQuestionIndex: number;
  timeElapsedSeconds: number;
  lastActivityAt: string;
}

/**
 * Salva o progresso atual da sessão de avaliação
 * @param sessionId ID da sessão
 * @param questionIndex Índice da questão atual (0-based)
 * @param timeElapsed Tempo decorrido em segundos
 * @returns True se salvou com sucesso
 */
export async function saveSessionProgress(
  sessionId: string,
  questionIndex: number,
  timeElapsed: number
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("assessment_sessions")
      .update({
        current_question_index: questionIndex,
        time_elapsed_seconds: timeElapsed,
        last_activity_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    if (error) {
      console.error("Erro ao salvar progresso da sessão:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao processar salvamento de progresso:", error);
    return false;
  }
}

/**
 * Carrega o progresso salvo de uma sessão
 * @param sessionId ID da sessão
 * @returns Objeto com o progresso ou null
 */
export async function loadSessionProgress(
  sessionId: string
): Promise<SessionProgress | null> {
  try {
    const { data, error } = await supabase
      .from("assessment_sessions")
      .select("current_question_index, time_elapsed_seconds, last_activity_at")
      .eq("id", sessionId)
      .single();

    if (error) {
      console.error("Erro ao carregar progresso da sessão:", error);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      currentQuestionIndex: data.current_question_index || 0,
      timeElapsedSeconds: data.time_elapsed_seconds || 0,
      lastActivityAt: data.last_activity_at || new Date().toISOString(),
    };
  } catch (error) {
    console.error("Erro ao processar progresso da sessão:", error);
    return null;
  }
}

/**
 * Verifica se uma sessão expirou por timeout (tempo total da avaliação esgotado)
 * @param timeElapsedSeconds Tempo decorrido em segundos
 * @param durationMinutes Duração total da avaliação em minutos
 * @returns True se o tempo esgotou
 */
export function isSessionTimeExpired(
  timeElapsedSeconds: number,
  durationMinutes: number
): boolean {
  const totalTimeSeconds = durationMinutes * 60;
  return timeElapsedSeconds >= totalTimeSeconds;
}

/**
 * Calcula o tempo restante de uma sessão
 * @param timeElapsedSeconds Tempo decorrido em segundos
 * @param durationMinutes Duração total em minutos
 * @returns Tempo restante em segundos (mínimo 0)
 */
export function calculateTimeRemaining(
  timeElapsedSeconds: number,
  durationMinutes: number
): number {
  const totalTimeSeconds = durationMinutes * 60;
  const remaining = totalTimeSeconds - timeElapsedSeconds;
  return Math.max(0, remaining);
}
