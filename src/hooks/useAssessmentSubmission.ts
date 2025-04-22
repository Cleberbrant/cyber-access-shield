
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
      
      // Verificar e salvar respostas pendentes e calcular se estão corretas
      for (const question of questions) {
        if (!question || !question.id) {
          console.warn("Questão inválida encontrada:", question);
          continue; // Pular questões inválidas
        }
        
        const userAnswer = answers[question.id] || "";
        const answerStr = typeof userAnswer === 'object' ? JSON.stringify(userAnswer) : String(userAnswer);
        
        // Verificar se a resposta está correta comparando com correct_answer
        let isCorrect = false;
        
        if (question.correct_answer) {
          // Comparar respostas (ignorando case e espaços extras)
          const normalizedUserAnswer = answerStr.trim().toLowerCase();
          const normalizedCorrectAnswer = question.correct_answer.trim().toLowerCase();
          isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
        }
        
        // Garantir que question_id seja salvo corretamente
        const { error: answerError } = await supabase
          .from("user_answers")
          .upsert({
            session_id: sessionId,
            question_id: question.id,
            answer: answerStr,
            is_correct: isCorrect
          }, {
            onConflict: 'session_id,question_id'
          });
          
        if (answerError) {
          console.error(`Erro ao salvar resposta para questão ${question.id}:`, answerError);
        }
      }
      
      // Calcular pontuação
      const { data: userAnswers } = await supabase
        .from("user_answers")
        .select("is_correct")
        .eq("session_id", sessionId);
      
      const correctCount = userAnswers?.filter(a => a.is_correct)?.length || 0;
      const total = userAnswers?.length || 0;
      const score = total > 0 ? (correctCount / total) * 100 : 0;
      
      // Marcar sessão como concluída
      const { error: updateError } = await supabase
        .from("assessment_sessions")
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
          score: score
        })
        .eq("id", sessionId);
        
      if (updateError) {
        console.error("Erro ao atualizar sessão:", updateError);
        throw new Error("Erro ao finalizar avaliação.");
      }
      
      // Desativar proteções
      disableAssessmentProtection();
      
      // Limpar flag de avaliação em andamento
      localStorage.removeItem("assessmentInProgress");
      
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
    console.log("Cancelando avaliação...");
    // Garantir que todas as proteções sejam desativadas ao cancelar
    disableAssessmentProtection();
    
    // Limpar qualquer flag de avaliação em andamento
    localStorage.removeItem("assessmentInProgress");
    sessionStorage.removeItem("assessmentInProgress");
    
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
