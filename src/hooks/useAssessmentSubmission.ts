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
      // Verificar sessão
      if (!sessionId) {
        throw new Error("Sessão de avaliação não encontrada.");
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user.id) {
        throw new Error("Você não está autenticado.");
      }

      // Montar array de respostas para a RPC
      const answersPayload = questions
        .filter((q) => q && q.id)
        .map((question) => {
          const userAnswer = answers[question.id] || "";
          const answerStr =
            typeof userAnswer === "object"
              ? JSON.stringify(userAnswer)
              : String(userAnswer);
          return {
            question_id: question.id,
            answer: answerStr,
          };
        });

      // Chamar RPC server-side — a correção acontece no banco
      // O correct_answer NUNCA é enviado ao frontend
      const { data, error } = await supabase.rpc(
        "submit_and_grade_assessment",
        {
          p_session_id: sessionId,
          p_answers: answersPayload as any,
        }
      );

      if (error) {
        throw new Error(error.message || "Erro ao submeter avaliação.");
      }

      const result = data as any;
      if (result && !result.success) {
        throw new Error(result.error || "Erro ao processar avaliação.");
      }

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
