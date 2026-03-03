import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useAssessmentSubmission(
  assessmentId: string,
  sessionId: string | null
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmitAssessment = async (
    answers: Record<string, any>,
    questions: any[],
    autoSubmit: boolean = false
  ) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Verificar sessão e permissões
      if (!sessionId) {
        throw new Error("Sessão de avaliação não encontrada.");
      }

      const { data: sessionData, error: sessionError } = await supabase
        .from("assessment_sessions")
        .select("id, user_id")
        .eq("id", sessionId)
        .single();

      if (sessionError || !sessionData) {
        throw new Error("Sessão de avaliação não encontrada ou expirada.");
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user.id || session.user.id !== sessionData.user_id) {
        throw new Error("Você não tem permissão para enviar esta avaliação.");
      }

      // Remover dialog de confirmação - sempre finalizar quando solicitado
// Verificar e salvar respostas pendentes e calcular se estão corretas
      for (const question of questions) {
        if (!question || !question.id) {
          continue; // Pular questões inválidas
        }

        const userAnswer = answers[question.id] || "";
        const answerStr =
          typeof userAnswer === "object"
            ? JSON.stringify(userAnswer)
            : String(userAnswer);

        // Verificar se a resposta está correta comparando com correct_answer
        let isCorrect = false;

        if (
          question.correct_answer !== undefined &&
          question.correct_answer !== null
        ) {
          // Normalizar ambas as respostas para string e remover espaços
          const normalizedUserAnswer = String(answerStr).trim();
          const normalizedCorrectAnswer = String(
            question.correct_answer
          ).trim();

          isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
}

        // Garantir que question_id seja salvo corretamente
        const { error: answerError } = await supabase
          .from("user_answers")
          .upsert(
            {
              session_id: sessionId,
              question_id: question.id,
              answer: answerStr,
              is_correct: isCorrect,
            },
            {
              onConflict: "session_id,question_id",
            }
          );

        if (answerError) {
}
      }

      // Calcular pontuação - usar o total de questões, não apenas as respondidas
      const { data: userAnswers } = await supabase
        .from("user_answers")
        .select("is_correct")
        .eq("session_id", sessionId);

      const correctCount =
        userAnswers?.filter((a) => a.is_correct === true)?.length || 0;
      const totalQuestions = questions.length;
const score = correctCount;

      // Marcar sessão como concluída
const { data: updateData, error: updateError } = await supabase
        .from("assessment_sessions")
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
          score: score,
        })
        .eq("id", sessionId)
        .select();

      if (updateError) {
        throw new Error("Erro ao finalizar avaliação.");
      }
      // Verificar se realmente salvou
      const { data: verifyData } = await supabase
        .from("assessment_sessions")
        .select("id, is_completed, completed_at, score")
        .eq("id", sessionId)
        .single();
      // Limpar flag de avaliação em andamento
      localStorage.removeItem("assessmentInProgress");

      // Navegar para a página de resultados
      navigate(`/assessment-result/${assessmentId}`);

      toast({
        title: "Avaliação concluída",
        description: "Suas respostas foram enviadas com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description:
          error.message ||
          "Não foi possível enviar suas respostas. Tente novamente.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  // Função para cancelar a avaliação atual
  const cancelAssessment = () => {
    // Limpar qualquer flag de avaliação em andamento
    localStorage.removeItem("assessmentInProgress");
    sessionStorage.removeItem("assessmentInProgress");

    // Redirecionar para o dashboard
    navigate("/dashboard");

    toast({
      title: "Avaliação cancelada",
      description: "Você saiu da avaliação e suas respostas não foram salvas.",
    });
  };

  return {
    isSubmitting,
    handleSubmitAssessment,
    cancelAssessment,
  };
}
