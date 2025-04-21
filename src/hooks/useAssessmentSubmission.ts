import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { disableAssessmentProtection } from "@/utils/secure-utils";

export function useAssessmentSubmission(assessmentId: string, sessionId: string | null) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmitAssessment = async (answers: Record<string, any>, questions: any[]) => {
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
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user.id !== sessionData.user_id) {
        throw new Error("Você não tem permissão para enviar esta avaliação.");
      }
      
      const unansweredQuestions = questions.filter(q => !answers[q.id]);
      
      if (unansweredQuestions.length > 0) {
        const confirm = window.confirm(
          `Você tem ${unansweredQuestions.length} questões não respondidas. Deseja enviar mesmo assim?`
        );
        
        if (!confirm) {
          setIsSubmitting(false);
          return;
        }
      }
      
      // Verificar e salvar respostas pendentes
      for (const question of questions) {
        if (answers[question.id]) {
          const answer = answers[question.id];
          const stringAnswer = typeof answer === 'object' ? JSON.stringify(answer) : String(answer);
          
          await supabase
            .from("user_answers")
            .upsert({
              session_id: sessionId,
              question_id: question.id,
              answer: stringAnswer
            }, {
              onConflict: 'session_id,question_id'
            });
        }
      }
      
      // Marcar sessão como concluída
      await supabase
        .from("assessment_sessions")
        .update({
          is_completed: true,
          completed_at: new Date().toISOString()
        })
        .eq("id", sessionId);
      
      // Desativar proteções
      disableAssessmentProtection();
      
      // Navegar para a página de resultados
      navigate(`/assessment-result/${assessmentId}`);
      
      toast({
        title: "Avaliação concluída",
        description: "Suas respostas foram enviadas com sucesso."
      });
    } catch (error: any) {
      console.error("Erro ao enviar avaliação:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível enviar suas respostas. Tente novamente.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  // Função para cancelar a avaliação atual
  const cancelAssessment = () => {
    // Garantir que todas as proteções sejam desativadas ao cancelar
    disableAssessmentProtection();
    
    // Limpar qualquer flag de avaliação em andamento
    localStorage.removeItem("assessmentInProgress");
    
    // Redirecionar para o dashboard
    navigate("/dashboard");
    
    toast({
      title: "Avaliação cancelada",
      description: "Você saiu da avaliação e suas respostas não foram salvas."
    });
  };

  return {
    isSubmitting,
    handleSubmitAssessment,
    cancelAssessment
  };
}
