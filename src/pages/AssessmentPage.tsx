import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { SecureAppShell } from "@/components/secure-app-shell";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Importar componentes
import { AssessmentHeader } from "@/components/assessment/AssessmentHeader";
import { QuestionNavigation } from "@/components/assessment/QuestionNavigation";
import { QuestionRenderer } from "@/components/assessment/QuestionRenderer";

// Importar hooks personalizados
import { useAssessmentLoader } from "@/hooks/useAssessmentLoader";
import { useAssessmentTimer } from "@/hooks/useAssessmentTimer";
import { useAssessmentAnswers } from "@/hooks/useAssessmentAnswers";
import { useAssessmentSubmission } from "@/hooks/useAssessmentSubmission";
import { useSessionProgress } from "@/hooks/useSessionProgress";

export default function AssessmentPage() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [retryCount, setRetryCount] = useState(0);

  // Obter o sessionId da URL
  const sessionIdParam = searchParams.get("session");

  // Carregar dados da avaliação
  const { assessment, loading, sessionId, sessionProgress, loadError } =
    useAssessmentLoader(assessmentId, sessionIdParam);

  // Inicializar índice da questão com progresso salvo
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(
    sessionProgress?.currentQuestionIndex || 0
  );

  // Atualizar quando o progresso for carregado
  useEffect(() => {
    if (sessionProgress) {
      setCurrentQuestionIndex(sessionProgress.currentQuestionIndex);
    }
  }, [sessionProgress]);

  // Hooks personalizados para gerenciar o estado e comportamento
  const { answers, matchPairs, handleAnswerChange, handleMatchPairChange } =
    useAssessmentAnswers(sessionId);

  // IMPORTANTE: Definir handleSubmitAssessment antes de usá-lo em outros hooks
  const { isSubmitting, handleSubmitAssessment } = useAssessmentSubmission(
    assessmentId || "",
    sessionId
  );

  // Usar a duração exata da avaliação como configurada no banco de dados
  const duration = assessment?.duration;

  // Timer com tempo decorrido inicial
  const initialTimeElapsed = sessionProgress?.timeElapsedSeconds || 0;

  // Callback para atualização de progresso (não usado ainda, mas preparado)
  const handleProgressUpdate = (timeElapsed: number) => {
    // Progresso será salvo pelo hook useSessionProgress
  };

  // Usar handleSubmitAssessment depois que ele foi definido
  const { timeLeft, timeElapsed, formatTimeLeft } = useAssessmentTimer(
    duration || 1,
    initialTimeElapsed,
    () => {
      if (assessment && handleSubmitAssessment) {
handleSubmitAssessment(answers, assessment.questions, true); // autoSubmit = true
      }
    },
    handleProgressUpdate
  );

  // Hook para salvar progresso automaticamente
  useSessionProgress(
    sessionId,
    currentQuestionIndex,
    timeElapsed,
    !isSubmitting // Desabilitar durante submissão
  );

  // Função para tentar novamente caso ocorra um erro
  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    navigate(
      `/assessment/${assessmentId}?session=${sessionIdParam}&retry=${Date.now()}`
    );
  };

  // Ativar flag de avaliação em andamento quando componente montar
  useEffect(() => {
    // Definir flag apenas quando entrar na página de avaliação
    localStorage.setItem("assessmentInProgress", "true");
    // Notificar o usuário
    toast({
      title: "Modo Avaliação Ativado",
      description: "Proteções de segurança foram ativadas para a avaliação.",
      duration: 4000,
    });

    // Limpar quando o componente for desmontado
    return () => {
      localStorage.removeItem("assessmentInProgress");
};
  }, [toast]);

  if (loading) {
    return (
      <SecureAppShell>
        <div className="container py-8">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
              <p className="text-xl font-medium">Carregando avaliação...</p>
              <p className="text-muted-foreground mt-2">
                Aguarde enquanto preparamos sua avaliação
              </p>
            </div>
          </div>
        </div>
      </SecureAppShell>
    );
  }

  if (loadError || !assessment) {
    return (
      <SecureAppShell>
        <div className="container py-8">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">
                Erro ao carregar avaliação
              </h2>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                {loadError ||
                  "Não foi possível encontrar a avaliação solicitada."}
              </p>
              <div className="space-x-4">
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                >
                  Voltar para o Dashboard
                </Button>
                {retryCount < 3 && (
                  <Button onClick={handleRetry}>Tentar novamente</Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </SecureAppShell>
    );
  }

  if (!sessionId) {
    return (
      <SecureAppShell>
        <div className="container py-8">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Sessão não encontrada</h2>
              <p className="text-muted-foreground mb-4">
                Não foi possível encontrar ou criar uma sessão para esta
                avaliação.
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
              onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>

            {currentQuestionIndex === assessment.questions.length - 1 ? (
              <Button
                onClick={() =>
                  handleSubmitAssessment(answers, assessment.questions, false)
                }
                className="cyber-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Finalizar"
                )}
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                disabled={
                  currentQuestionIndex === assessment.questions.length - 1
                }
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
          questionsMap={assessment.questions.map((q) => q.id)}
          onQuestionChange={setCurrentQuestionIndex}
        />

        <div className="flex justify-end">
          <Button
            onClick={() =>
              handleSubmitAssessment(answers, assessment.questions, false)
            }
            className="cyber-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
