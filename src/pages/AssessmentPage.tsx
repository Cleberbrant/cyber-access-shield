
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SecureAppShell } from "@/components/secure-app-shell";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sanitizeInput } from "@/utils/secure-utils";
import { supabase } from "@/integrations/supabase/client";

// Importar componentes de questões
import { MultipleChoiceQuestion } from "@/components/assessment/question-types/MultipleChoiceQuestion";
import { TrueFalseQuestion } from "@/components/assessment/question-types/TrueFalseQuestion";
import { CodeQuestion } from "@/components/assessment/question-types/CodeQuestion";
import { ShortAnswerQuestion } from "@/components/assessment/question-types/ShortAnswerQuestion";
import { MatchingQuestion } from "@/components/assessment/question-types/MatchingQuestion";

// Importar componentes de layout
import { AssessmentHeader } from "@/components/assessment/AssessmentHeader";
import { QuestionNavigation } from "@/components/assessment/QuestionNavigation";

// Importar hooks personalizados
import { useAssessmentLoader } from "@/hooks/useAssessmentLoader";
import { useAssessmentTimer } from "@/hooks/useAssessmentTimer";

export default function AssessmentPage() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Estados locais
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matchPairs, setMatchPairs] = useState<Record<string, string>>({});

  // Carregar dados da avaliação
  const { assessment, loading, sessionId } = useAssessmentLoader(assessmentId);
  
  // Configurar timer
  const { formatTimeLeft } = useAssessmentTimer(
    assessment?.duration || 0,
    handleSubmitAssessment
  );

  // Handlers
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

  async function handleSubmitAssessment() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      // Verificar questões não respondidas
      const unansweredQuestions = assessment?.questions.filter(q => !answers[q.id]);
      
      if (unansweredQuestions && unansweredQuestions.length > 0) {
        const confirm = window.confirm(
          `Você tem ${unansweredQuestions.length} questões não respondidas. Deseja enviar mesmo assim?`
        );
        
        if (!confirm) {
          setIsSubmitting(false);
          return;
        }
      }
      
      if (sessionId) {
        // Atualizar sessão como completa
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
  }

  async function saveAnswer(questionId: string, answer: any) {
    if (!sessionId) return;
    
    try {
      const stringAnswer = typeof answer === 'object' ? JSON.stringify(answer) : String(answer);
      
      await supabase
        .from("user_answers")
        .upsert({
          session_id: sessionId,
          question_id: questionId,
          answer: stringAnswer
        }, {
          onConflict: 'session_id,question_id'
        });
    } catch (error) {
      console.error("Erro ao salvar resposta:", error);
    }
  }

  // Renderizar questão atual
  const renderCurrentQuestion = () => {
    if (!assessment) return null;
    
    const question = assessment.questions[currentQuestionIndex];
    if (!question) return null;
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{question.text}</h3>
        
        {question.type === "multiple-choice" && question.options && (
          <MultipleChoiceQuestion
            id={question.id}
            options={question.options}
            value={answers[question.id]?.toString()}
            onChange={(value) => handleAnswerChange(question.id, value)}
          />
        )}
        
        {question.type === "true-false" && (
          <TrueFalseQuestion
            id={question.id}
            value={answers[question.id]?.toString()}
            onChange={(value) => handleAnswerChange(question.id, value)}
          />
        )}
        
        {question.type === "short-answer" && (
          <ShortAnswerQuestion
            value={answers[question.id]}
            onChange={(value) => handleAnswerChange(question.id, value)}
          />
        )}
        
        {question.type === "code" && question.code && (
          <CodeQuestion
            code={question.code}
            value={answers[question.id]}
            onChange={(value) => handleAnswerChange(question.id, value)}
          />
        )}
        
        {question.type === "matching" && question.matches && (
          <MatchingQuestion
            matches={question.matches}
            value={answers[question.id]}
            onChange={(leftItem, rightItem) => handleMatchPairChange(question.id, leftItem, rightItem)}
          />
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <SecureAppShell>
        <div className="container py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="h-8 w-8 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p>Carregando avaliação...</p>
            </div>
          </div>
        </div>
      </SecureAppShell>
    );
  }

  if (!assessment) {
    return (
      <SecureAppShell>
        <div className="container py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Avaliação não encontrada</h2>
              <p className="text-muted-foreground mb-4">
                Não foi possível encontrar a avaliação solicitada.
              </p>
              <Button onClick={() => navigate("/dashboard")}>
                Voltar para o Dashboard
              </Button>
            </div>
          </div>
        </div>
      </SecureAppShell>
    );
  }

  return (
    <SecureAppShell>
      <div className="container py-8">
        <AssessmentHeader
          title={assessment.title}
          description={assessment.description}
          timeLeft={formatTimeLeft()}
          currentQuestion={currentQuestionIndex}
          totalQuestions={assessment.questions.length}
        />
        
        <Card className="mb-6 secure-content no-select">
          <CardHeader>
            <CardTitle>Questão {currentQuestionIndex + 1}</CardTitle>
          </CardHeader>
          <CardContent>
            {renderCurrentQuestion()}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>
            
            {currentQuestionIndex === assessment.questions.length - 1 ? (
              <Button 
                onClick={handleSubmitAssessment}
                className="cyber-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate 

-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Enviando...
                  </>
                ) : (
                  "Finalizar"
                )}
              </Button>
            ) : (
              <Button 
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                disabled={currentQuestionIndex === assessment.questions.length - 1}
              >
                Próxima
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </Card>
        
        <QuestionNavigation
          currentQuestion={currentQuestionIndex}
          totalQuestions={assessment.questions.length}
          answers={answers}
          questionsMap={assessment.questions.map(q => q.id)}
          onQuestionChange={setCurrentQuestionIndex}
        />
        
        <div className="flex justify-end">
          <Button
            onClick={handleSubmitAssessment}
            className="cyber-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Enviando...
              </>
            ) : (
              "Finalizar Avaliação"
            )}
          </Button>
        </div>
      </div>
    </SecureAppShell>
  );
}
