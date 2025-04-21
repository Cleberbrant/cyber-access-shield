
import { useState, useEffect } from "react";
import { sanitizeInput } from "@/utils/secure-utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useAssessmentAnswers(sessionId: string | null) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [matchPairs, setMatchPairs] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Carregar respostas existentes quando o sessionId mudar
  useEffect(() => {
    const loadExistingAnswers = async () => {
      if (!sessionId) return;
      
      try {
        const { data, error } = await supabase
          .from("user_answers")
          .select("question_id, answer")
          .eq("session_id", sessionId);
        
        if (error) {
          console.error("Erro ao carregar respostas:", error);
          return;
        }
        
        if (data && data.length > 0) {
          const loadedAnswers: Record<string, any> = {};
          data.forEach(item => {
            try {
              // Tentar converter para objeto se for JSON
              loadedAnswers[item.question_id] = 
                item.answer.startsWith('{') ? JSON.parse(item.answer) : item.answer;
            } catch (e) {
              // Se falhar ao converter, use o valor original
              loadedAnswers[item.question_id] = item.answer;
            }
          });
          
          setAnswers(loadedAnswers);
        }
      } catch (error) {
        console.error("Erro ao processar respostas:", error);
      }
    };
    
    loadExistingAnswers();
  }, [sessionId]);

  const handleAnswerChange = async (questionId: string, value: any) => {
    const sanitizedValue = typeof value === 'string' ? sanitizeInput(value) : value;
    
    setAnswers(prev => ({
      ...prev,
      [questionId]: sanitizedValue
    }));
    
    if (sessionId) {
      await saveAnswer(questionId, sanitizedValue);
    }
  };

  const handleMatchPairChange = (questionId: string, leftItem: string, rightItem: string) => {
    const sanitizedLeftItem = sanitizeInput(leftItem);
    const sanitizedRightItem = sanitizeInput(rightItem);
    
    setMatchPairs(prev => ({
      ...prev,
      [sanitizedLeftItem]: sanitizedRightItem
    }));
    
    const allPairs = { ...matchPairs, [sanitizedLeftItem]: sanitizedRightItem };
    handleAnswerChange(questionId, allPairs);
  };

  const saveAnswer = async (questionId: string, answer: any) => {
    if (!sessionId) return;
    
    try {
      const stringAnswer = typeof answer === 'object' ? JSON.stringify(answer) : String(answer);
      
      // Primeiro, verificar se o usuário tem permissão e se a sessão existe
      const { data: sessionData, error: sessionError } = await supabase
        .from("assessment_sessions")
        .select("id, user_id")
        .eq("id", sessionId)
        .single();
        
      if (sessionError) {
        console.error("Erro ao verificar sessão:", sessionError);
        toast({
          title: "Erro ao salvar resposta",
          description: "Não foi possível verificar a sessão de avaliação.",
          variant: "destructive"
        });
        return;
      }
      
      // Verificar se a sessão pertence ao usuário atual
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user.id !== sessionData.user_id) {
        toast({
          title: "Erro de permissão",
          description: "Você não tem permissão para responder esta avaliação.",
          variant: "destructive"
        });
        return;
      }
      
      const answerData = {
        session_id: sessionId,
        question_id: questionId,
        answer: stringAnswer
      };
      
      const { error } = await supabase
        .from("user_answers")
        .upsert(answerData, {
          onConflict: 'session_id,question_id'
        });
      
      if (error) {
        console.error("Erro ao salvar resposta:", error);
        toast({
          title: "Erro ao salvar resposta",
          description: error.message || "Não foi possível salvar sua resposta.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Erro ao processar resposta:", error);
      toast({
        title: "Erro ao processar resposta",
        description: error.message || "Ocorreu um erro ao processar sua resposta.",
        variant: "destructive"
      });
    }
  };

  return {
    answers,
    matchPairs,
    handleAnswerChange,
    handleMatchPairChange
  };
}
