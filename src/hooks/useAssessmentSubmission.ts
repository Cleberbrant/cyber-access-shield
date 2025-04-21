
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useAssessmentSubmission(assessmentId: string, sessionId: string | null) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmitAssessment = async (answers: Record<string, any>, questions: any[]) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
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
      
      if (sessionId) {
        await supabase
          .from("assessment_sessions")
          .update({
            is_completed: true,
            completed_at: new Date().toISOString(),
          })
          .eq("id", sessionId);
      }
      
      navigate(`/assessment-result/${assessmentId}`);
      
      toast({
        title: "Avaliação concluída",
        description: "Suas respostas foram enviadas com sucesso."
      });
    } catch (error: any) {
      console.error("Erro ao enviar avaliação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar suas respostas. Tente novamente.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmitAssessment
  };
}
