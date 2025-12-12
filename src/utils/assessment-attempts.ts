import { supabase } from "@/integrations/supabase/client";

/**
 * Interface para o resultado da verificação de tentativas
 */
export interface AttemptCheckResult {
  canAttempt: boolean;
  currentAttempts: number;
  maxAttempts: number;
  reason?: string;
}

/**
 * Conta o número de tentativas completadas de um usuário em uma avaliação
 * @param userId ID do usuário
 * @param assessmentId ID da avaliação
 * @returns Número de tentativas completadas
 */
export async function getAttemptsCount(
  userId: string,
  assessmentId: string
): Promise<number> {
  try {
    const { data, error } = await supabase
      .from("assessment_sessions")
      .select("id", { count: "exact" })
      .eq("user_id", userId)
      .eq("assessment_id", assessmentId)
      .is("is_completed", true);

    if (error) {
      console.error("Erro ao contar tentativas:", error);
      return 0;
    }

    return data?.length || 0;
  } catch (error) {
    console.error("Erro ao processar contagem de tentativas:", error);
    return 0;
  }
}

/**
 * Verifica se um usuário pode tentar fazer uma avaliação
 * @param userId ID do usuário
 * @param assessmentId ID da avaliação
 * @param maxAttempts Número máximo de tentativas permitidas (0 = ilimitado)
 * @returns Objeto com informações sobre a possibilidade de tentativa
 */
export async function canAttemptAssessment(
  userId: string,
  assessmentId: string,
  maxAttempts: number
): Promise<AttemptCheckResult> {
  try {
    // Se maxAttempts = 0, tentativas ilimitadas
    if (maxAttempts === 0) {
      const currentAttempts = await getAttemptsCount(userId, assessmentId);
      return {
        canAttempt: true,
        currentAttempts,
        maxAttempts: 0,
        reason: "Tentativas ilimitadas",
      };
    }

    // Contar tentativas já realizadas
    const currentAttempts = await getAttemptsCount(userId, assessmentId);

    // Verificar se ainda pode tentar
    const canAttempt = currentAttempts < maxAttempts;

    const result: AttemptCheckResult = {
      canAttempt,
      currentAttempts,
      maxAttempts,
    };

    if (!canAttempt) {
      result.reason = `Você já realizou esta avaliação ${currentAttempts}/${maxAttempts} vezes.`;
    }

    return result;
  } catch (error) {
    console.error("Erro ao verificar tentativas:", error);
    return {
      canAttempt: false,
      currentAttempts: 0,
      maxAttempts,
      reason: "Erro ao verificar tentativas disponíveis",
    };
  }
}

/**
 * Verifica se o usuário tem uma sessão incompleta para uma avaliação
 * @param userId ID do usuário
 * @param assessmentId ID da avaliação
 * @returns Objeto da sessão incompleta ou null
 */
export async function getIncompleteSession(
  userId: string,
  assessmentId: string
) {
  try {
    const { data, error } = await supabase
      .from("assessment_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("assessment_id", assessmentId)
      .is("is_completed", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Erro ao buscar sessão incompleta:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Erro ao processar sessão incompleta:", error);
    return null;
  }
}

/**
 * Verifica se o usuário tem pelo menos uma tentativa completada
 * @param userId ID do usuário
 * @param assessmentId ID da avaliação
 * @returns True se tiver pelo menos uma tentativa completada
 */
export async function hasCompletedAttempt(
  userId: string,
  assessmentId: string
): Promise<boolean> {
  const count = await getAttemptsCount(userId, assessmentId);
  return count > 0;
}
