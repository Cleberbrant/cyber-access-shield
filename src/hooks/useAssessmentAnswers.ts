
import { useState } from "react";
import { sanitizeInput } from "@/utils/secure-utils";
import { supabase } from "@/integrations/supabase/client";

export function useAssessmentAnswers(sessionId: string | null) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [matchPairs, setMatchPairs] = useState<Record<string, string>>({});

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
      }
    } catch (error) {
      console.error("Erro ao processar resposta:", error);
    }
  };

  return {
    answers,
    matchPairs,
    handleAnswerChange,
    handleMatchPairChange
  };
}
