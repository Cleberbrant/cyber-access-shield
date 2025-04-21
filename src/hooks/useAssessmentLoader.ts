
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { Assessment, AssessmentQuestion } from "@/types/assessment";
import { enableAssessmentProtection } from "@/utils/secure-utils";

const getJsonProperty = <T,>(obj: Json | null | undefined, key: string): T | undefined => {
  if (typeof obj === 'object' && obj !== null && key in obj) {
    return obj[key] as unknown as T;
  }
  return undefined;
};

export function useAssessmentLoader(assessmentId: string | undefined, existingSessionId: string | null = null) {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(existingSessionId);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadAssessment = async () => {
      if (!assessmentId) {
        toast({
          title: "Erro",
          description: "ID da avaliação não encontrado.",
          variant: "destructive"
        });
        navigate("/dashboard");
        return;
      }

      try {
        setLoading(true);
        
        // Ativar proteções de ambiente de avaliação
        enableAssessmentProtection();
        
        // Buscar dados da avaliação
        const { data: assessmentData, error: assessmentError } = await supabase
          .from("assessments")
          .select("*")
          .eq("id", assessmentId)
          .single();
          
        if (assessmentError || !assessmentData) {
          throw new Error(assessmentError?.message || "Avaliação não encontrada");
        }

        // Garantir que a duração seja um número positivo
        const duration = Math.max(1, assessmentData.duration_minutes || 1);
        console.log("Duração carregada:", duration, "minutos");

        // Buscar questões
        const { data: questionsData, error: questionsError } = await supabase
          .from("questions")
          .select("*")
          .eq("assessment_id", assessmentId)
          .order("order_index");
          
        if (questionsError) {
          throw new Error(questionsError.message || "Erro ao carregar questões");
        }

        // Converter dados para o formato esperado pelo componente
        const formattedQuestions: AssessmentQuestion[] = questionsData.map(mapQuestionType);

        const mappedAssessment: Assessment = {
          id: assessmentData.id,
          title: assessmentData.title,
          description: assessmentData.description || "",
          duration: duration,
          questions: formattedQuestions
        };
        
        setAssessment(mappedAssessment);
        
        // Verificar sessão existente ou criar nova
        if (existingSessionId) {
          // Usar a sessão fornecida na URL
          console.log("Usando sessão existente:", existingSessionId);
          setSessionId(existingSessionId);
        } else {
          // Criar sessão da avaliação
          const { data: userSession } = await supabase.auth.getSession();
          if (userSession && userSession.session) {
            const { data: sessionData, error: sessionError } = await supabase
              .from("assessment_sessions")
              .insert({
                assessment_id: assessmentId,
                user_id: userSession.session.user.id,
                started_at: new Date().toISOString(),
                is_completed: false
              })
              .select('id')
              .single();
              
            if (sessionError) {
              console.error("Erro ao criar sessão de avaliação:", sessionError);
            } else if (sessionData) {
              console.log("Nova sessão criada:", sessionData.id);
              setSessionId(sessionData.id);
            }
          }
        }
      } catch (error: any) {
        console.error("Erro ao carregar avaliação:", error);
        toast({
          title: "Erro",
          description: error.message || "Não foi possível carregar a avaliação.",
          variant: "destructive"
        });
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    
    loadAssessment();
  }, [assessmentId, navigate, toast, existingSessionId]);

  return { assessment, loading, sessionId };
}

const mapQuestionType = (questao: any): AssessmentQuestion => {
  const tipoBase: AssessmentQuestion = {
    id: questao.id,
    text: questao.question_text,
    type: mapQuestionTypeString(questao.question_type)
  };

  // Tratar diferentes tipos de questões
  switch (questao.question_type) {
    case 'multiple_choice':
      const opcoes = getJsonProperty<string[]>(questao.options, 'options');
      return opcoes ? { ...tipoBase, options: opcoes } : tipoBase;
    
    case 'code':
      const codigo = getJsonProperty<string>(questao.options, 'code');
      return codigo ? { ...tipoBase, code: codigo } : tipoBase;
    
    case 'matching':
      const correspondencias = getJsonProperty<Array<{left: string, right: string}>>(questao.options, 'matches');
      return correspondencias ? { ...tipoBase, matches: correspondencias } : tipoBase;
    
    default:
      return tipoBase;
  }
};

// Função auxiliar para mapear tipos de questões
const mapQuestionTypeString = (dbType: string): AssessmentQuestion["type"] => {
  const typeMap: Record<string, AssessmentQuestion["type"]> = {
    "multiple_choice": "multiple-choice",
    "true_false": "true-false",
    "text": "short-answer",
    "code": "code",
    "matching": "matching"
  };
  
  return typeMap[dbType] || "multiple-choice";
};
