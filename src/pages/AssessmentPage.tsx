
import { useState } from "react";
import { useParams } from "react-router-dom";
import { SecureAppShell } from "@/components/secure-app-shell";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AlertCircle } from "lucide-react";

// Importar componentes
import { AssessmentHeader } from "@/components/assessment/AssessmentHeader";
import { QuestionNavigation } from "@/components/assessment/QuestionNavigation";
import { QuestionRenderer } from "@/components/assessment/QuestionRenderer";

// Importar hooks personalizados
import { useAssessmentLoader } from "@/hooks/useAssessmentLoader";
import { useAssessmentTimer } from "@/hooks/useAssessmentTimer";
import { useAssessmentAnswers } from "@/hooks/useAssessmentAnswers";
import { useAssessmentSubmission } from "@/hooks/useAssessmentSubmission";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function AssessmentPage() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Carregar dados da avaliação
  const { assessment, loading, sessionId } = useAssessmentLoader(assessmentId);
  
  // Hooks personalizados para gerenciar o estado e comportamento
  const { answers, matchPairs, handleAnswerChange, handleMatchPairChange } = 
    useAssessmentAnswers(sessionId);
  const { isSubmitting, handleSubmitAssessment } = 
    useAssessmentSubmission(assessmentId || '', sessionId);
  const { formatTimeLeft } = useAssessmentTimer(
    assessment?.duration || 0,
    () => assessment && handleSubmitAssessment(answers, assessment.questions)
  );

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
            <QuestionRenderer
              question={assessment.questions[currentQuestionIndex]}
              value={answers[assessment.questions[currentQuestionIndex].id]}
              onAnswerChange={handleAnswerChange}
              onMatchPairChange={handleMatchPairChange}
            />
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
                onClick={() => handleSubmitAssessment(answers, assessment.questions)}
                className="cyber-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
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
            onClick={() => handleSubmitAssessment(answers, assessment.questions)}
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
