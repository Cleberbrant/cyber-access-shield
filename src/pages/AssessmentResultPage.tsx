import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SecureAppShell } from "@/components/secure-app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  FileText,
  Home,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { ResultQuestionRenderer } from "@/components/assessment/ResultQuestionRenderer";
import { useToast } from "@/hooks/use-toast";

interface AssessmentResult {
  id: string;
  title: string;
  description: string;
  score: number;
  maxScore: number;
  percentageScore: number;
  completedAt: string;
  isCancelled?: boolean;
  cancellationReason?: string;
  warningCount?: number;
  attemptNumber?: number;
  maxAttempts?: number;
  questionsResults: {
    id: string;
    text: string;
    correct: boolean;
    userAnswer: string;
    correctAnswer: string;
    explanation?: string;
    type?: string;
    options?: string[];
  }[];
}

const getJsonProperty = <T,>(
  obj: Json | null | undefined,
  key: string
): T | undefined => {
  if (typeof obj === "object" && obj !== null && key in obj) {
    return obj[key] as unknown as T;
  }
  return undefined;
};

export default function AssessmentResultPage() {
  const navigate = useNavigate();
  const { assessmentId } = useParams();
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);

        if (!assessmentId) {
          throw new Error("ID da avaliação não encontrado");
        }

        // Primeiro, buscamos os dados básicos da avaliação (incluindo max_attempts)
        const { data: assessmentData, error: assessmentError } = await supabase
          .from("assessments")
          .select("id, title, description, max_attempts")
          .eq("id", assessmentId)
          .single();

        if (assessmentError || !assessmentData) {
          console.error("Erro ao buscar avaliação:", assessmentError);
          throw new Error("Avaliação não encontrada");
        }

        // Buscar o usuário atual
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("Usuário não autenticado");
        }

        // Buscar TODAS as sessões completas do usuário para contar tentativas
        const { data: allSessions, error: allSessionsError } = await supabase
          .from("assessment_sessions")
          .select("id, completed_at")
          .eq("assessment_id", assessmentId)
          .eq("user_id", user.id)
          .is("is_completed", true)
          .order("completed_at", { ascending: true });

        if (allSessionsError) {
          console.error("Erro ao buscar todas as sessões:", allSessionsError);
        }

        console.log(
          "Total de sessões completas encontradas:",
          allSessions?.length || 0
        );

        // Buscamos a sessão mais recente desta avaliação
        const { data: sessionData, error: sessionError } = await supabase
          .from("assessment_sessions")
          .select(
            "id, score, completed_at, is_completed, is_cancelled, cancellation_reason, warning_count"
          )
          .eq("assessment_id", assessmentId)
          .eq("user_id", user.id)
          .is("is_completed", true)
          .order("completed_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (sessionError) {
          console.error("Erro ao buscar sessão:", sessionError);
          throw new Error("Erro ao carregar resultados da sessão");
        }

        if (!sessionData) {
          console.warn("Nenhuma sessão completada para esta avaliação");
          console.log(
            "Debug - Verificando todas as sessões sem filtro de is_completed:"
          );

          // Debug: buscar sessões sem filtro para ver o que existe
          const { data: debugSessions } = await supabase
            .from("assessment_sessions")
            .select("id, is_completed, completed_at, score")
            .eq("assessment_id", assessmentId)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          console.log("Sessões encontradas (todas):", debugSessions);

          setError("Nenhuma sessão completada encontrada para esta avaliação.");
          setLoading(false);
          return;
        }

        // Determinar número da tentativa
        const attemptNumber = allSessions
          ? allSessions.findIndex((s) => s.id === sessionData.id) + 1
          : 1;

        console.log("Dados da sessão básica:", {
          ...sessionData,
          assessment: assessmentData,
          attemptNumber,
          totalAttempts: allSessions?.length || 0,
        });

        // Buscamos as questões da avaliação
        console.log(`🔍 Buscando questões para assessment_id: ${assessmentId}`);

        const { data: questionsData, error: questionsError } = await supabase
          .from("questions")
          .select("id, question_text, correct_answer, options, question_type")
          .eq("assessment_id", assessmentId);

        if (questionsError) {
          console.error("❌ Erro ao buscar questões:", questionsError);
          throw new Error("Erro ao carregar questões da avaliação");
        }

        console.log(`📝 Questões encontradas: ${questionsData?.length || 0}`);

        if (!questionsData || questionsData.length === 0) {
          console.error("❌ Nenhuma questão encontrada para a avaliação");
          setError(
            "Os dados das questões estão incompletos para esta avaliação."
          );
          setLoading(false);
          return;
        }

        // Agora buscamos as respostas do usuário para esta sessão
        const { data: userAnswersData, error: userAnswersError } =
          await supabase
            .from("user_answers")
            .select("question_id, answer")
            .eq("session_id", sessionData.id);

        if (userAnswersError) {
          console.error(
            "Erro ao buscar respostas do usuário:",
            userAnswersError
          );
          throw new Error("Erro ao carregar respostas do usuário");
        }

        console.log(
          `💬 Respostas do usuário encontradas: ${userAnswersData?.length || 0}`
        );

        const userAnswers = userAnswersData.reduce(
          (acc: Record<string, any>, item: any) => {
            acc[item.question_id] = item.answer;
            return acc;
          },
          {}
        );

        const questionsResults = questionsData.map((question: any) => {
          const userAnswer = userAnswers[question.id] || "";
          const correct =
            String(userAnswer).trim() ===
            String(question.correct_answer).trim();

          // Extrair opções se for múltipla escolha
          let options: string[] | undefined;
          if (question.options && typeof question.options === "object") {
            options = question.options.options || [];
          }

          return {
            id: question.id,
            text: question.question_text,
            correct,
            userAnswer,
            correctAnswer: question.correct_answer,
            explanation: question.options?.explanation || "",
            type: question.question_type,
            options,
          };
        });

        const correctAnswersCount = questionsResults.filter(
          (q: any) => q.correct
        ).length;
        const percentageScore =
          questionsResults.length > 0
            ? (correctAnswersCount / questionsResults.length) * 100
            : 0;

        console.log(
          `📊 Resultado calculado: ${correctAnswersCount}/${
            questionsResults.length
          } (${percentageScore.toFixed(1)}%)`
        );
        console.log("✅ Definindo resultado no estado...");

        setResult({
          id: assessmentData.id,
          title: assessmentData.title,
          description: assessmentData.description,
          score: correctAnswersCount,
          maxScore: questionsResults.length,
          percentageScore,
          completedAt: sessionData.completed_at,
          isCancelled: sessionData.is_cancelled || false,
          cancellationReason: sessionData.cancellation_reason || undefined,
          warningCount: sessionData.warning_count || 0,
          attemptNumber,
          maxAttempts: assessmentData.max_attempts || 1,
          questionsResults,
        });

        console.log("🎉 Resultado definido com sucesso!");
      } catch (error: any) {
        console.error("Erro ao carregar resultado:", error);
        setError(
          error.message ||
            "Ocorreu um erro ao carregar os resultados da avaliação"
        );
        toast({
          title: "Erro ao carregar resultados",
          description:
            error.message ||
            "Ocorreu um erro ao carregar os resultados da avaliação",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [assessmentId, toast]);

  if (loading) {
    return (
      <SecureAppShell>
        <div className="container py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
              <p>Carregando resultados...</p>
            </div>
          </div>
        </div>
      </SecureAppShell>
    );
  }

  if (error || !result || result.questionsResults.length === 0) {
    return (
      <SecureAppShell>
        <div className="container py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">
                Resultado não encontrado
              </h2>
              <p className="text-muted-foreground mb-4">
                {error ||
                  "Não foi possível encontrar o resultado da avaliação solicitada ou os dados das questões estão incompletos."}
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
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao Dashboard
        </Button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{result?.title} - Resultado</h1>
            {result && result.maxAttempts > 1 && (
              <Badge variant="secondary" className="text-base px-3 py-1">
                Tentativa {result.attemptNumber}/{result.maxAttempts}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">{result?.description}</p>
        </div>

        {/* Aviso de prova cancelada */}
        {result?.isCancelled && (
          <Card className="mb-6 border-destructive bg-destructive/10">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                Avaliação Cancelada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Esta avaliação foi cancelada automaticamente por violações de
                segurança.
              </p>
              {result.cancellationReason && (
                <p className="text-sm mt-2 font-medium">
                  Motivo: {result.cancellationReason}
                </p>
              )}
              {result.warningCount > 0 && (
                <p className="text-sm mt-2 text-muted-foreground">
                  Total de avisos recebidos: {result.warningCount}
                </p>
              )}
              <p className="text-sm mt-4 text-destructive font-semibold">
                Pontuação registrada: 0 pontos
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Pontuação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Resultado</span>
                  <span className="font-bold">
                    {result?.isCancelled ? 0 : result?.score} de{" "}
                    {result?.maxScore} pontos
                  </span>
                </div>
                <Progress
                  value={result?.isCancelled ? 0 : result?.percentageScore}
                  className="h-3"
                />
                <div className="flex justify-end mt-1 text-sm text-muted-foreground">
                  {result?.isCancelled ? 0 : result?.percentageScore}%
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {result?.isCancelled ? "Status" : "Conclusão"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {result?.isCancelled
                      ? "Cancelada"
                      : result?.percentageScore && result.percentageScore >= 70
                      ? "Aprovado"
                      : "Reprovado"}
                  </p>
                </div>
                {result?.isCancelled ? (
                  <div className="h-10 w-10 rounded-full bg-destructive/20 flex items-center justify-center">
                    <XCircle className="h-6 w-6 text-destructive" />
                  </div>
                ) : result?.percentageScore && result.percentageScore >= 70 ? (
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center dark:bg-green-900/20">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center dark:bg-red-900/20">
                    <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalhes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Data de conclusão
                </span>
                <span className="text-sm font-medium">
                  {result?.completedAt &&
                    new Date(result.completedAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Questões corretas
                </span>
                <span className="text-sm font-medium">
                  {result?.score} de {result?.maxScore}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Tempo médio por questão
                </span>
                <span className="text-sm font-medium">≈ 7 minutos</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Resumo das Questões</h2>

          {result?.questionsResults.map((question, index) => (
            <ResultQuestionRenderer
              key={question.id}
              index={index}
              question={question}
            />
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Button
            variant="outline"
            className="flex gap-2"
            onClick={() => navigate(`/assessment/${result?.id}`)}
          >
            <FileText className="h-4 w-4" />
            Refazer Avaliação
          </Button>
          <Button
            className="cyber-button"
            onClick={() => navigate("/dashboard")}
          >
            <Home className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    </SecureAppShell>
  );
}
