
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SecureAppShell } from "@/components/secure-app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle, XCircle, FileText, Home, Loader2 } from "lucide-react";
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
  questionsResults: {
    id: string;
    text: string;
    correct: boolean;
    userAnswer: string;
    correctAnswer: string;
    explanation?: string;
  }[];
}

const getJsonProperty = <T,>(obj: Json | null | undefined, key: string): T | undefined => {
  if (typeof obj === 'object' && obj !== null && key in obj) {
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

        // Primeiro, buscamos os dados básicos da avaliação
        const { data: assessmentData, error: assessmentError } = await supabase
          .from("assessments")
          .select("id, title, description")
          .eq("id", assessmentId)
          .single();

        if (assessmentError || !assessmentData) {
          console.error("Erro ao buscar avaliação:", assessmentError);
          throw new Error("Avaliação não encontrada");
        }

        // Buscamos a sessão mais recente desta avaliação
        const { data: sessionData, error: sessionError } = await supabase
          .from("assessment_sessions")
          .select("id, score, completed_at")
          .eq("assessment_id", assessmentId)
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
          setError("Nenhuma sessão completada encontrada para esta avaliação.");
          setLoading(false);
          return;
        }

        console.log("Dados da sessão básica:", {
          ...sessionData,
          assessment: assessmentData
        });

        // Buscamos as questões da avaliação
        const { data: questionsData, error: questionsError } = await supabase
          .from("questions")
          .select("id, question_text, correct_answer, options")
          .eq("assessment_id", assessmentId);

        if (questionsError) {
          console.error("Erro ao buscar questões:", questionsError);
          throw new Error("Erro ao carregar questões da avaliação");
        }

        // Agora buscamos as respostas do usuário para esta sessão
        const { data: userAnswersData, error: userAnswersError } = await supabase
          .from("user_answers")
          .select("id, answer, is_correct, question_id")
          .eq("session_id", sessionData.id);

        if (userAnswersError) {
          console.error("Erro ao carregar respostas:", userAnswersError);
          throw new Error("Erro ao carregar respostas do usuário");
        }

        console.log("Dados das respostas:", userAnswersData);
        console.log("Dados das questões:", questionsData);

        if (!userAnswersData || userAnswersData.length === 0) {
          toast({
            title: "Aviso",
            description: "Nenhuma resposta foi encontrada para esta avaliação.",
            variant: "default"
          });
        }

        // Combinamos as respostas com as questões correspondentes
        const questionsResults = userAnswersData
          .map((answer) => {
            // Encontramos a questão correspondente pelo question_id
            const question = questionsData?.find(q => q.id === answer.question_id);
            
            // Se não encontrou a questão, pulamos
            if (!question) {
              console.warn(`Questão não encontrada para a resposta ${answer.id} (question_id: ${answer.question_id})`);
              return null;
            }

            console.log(`
              Questão ID: ${question.id}
              Texto: ${question.question_text}
              Resposta do usuário: "${answer.answer || "Sem resposta"}"
              Resposta correta: "${question.correct_answer || "Não definida"}"
              Está correta no BD?: ${answer.is_correct ? 'Sim' : 'Não'}
            `);
            
            const explanation = getJsonProperty<string>(question.options, 'explanation');
            
            return {
              id: question.id,
              text: question.question_text,
              correct: answer.is_correct || false,
              userAnswer: answer.answer || "Sem resposta",
              correctAnswer: question.correct_answer || "",
              explanation: explanation
            };
          })
          .filter(Boolean);

        const totalQuestions = questionsResults.length;
        const correctAnswers = questionsResults.filter(q => q?.correct).length;
        const percentageScore = totalQuestions > 0 
          ? Math.round((correctAnswers / totalQuestions) * 100) 
          : 0;

        const formattedResult: AssessmentResult = {
          id: assessmentData.id,
          title: assessmentData.title,
          description: assessmentData.description,
          score: correctAnswers,
          maxScore: totalQuestions,
          percentageScore,
          completedAt: sessionData.completed_at,
          questionsResults: questionsResults as any[]
        };

        setResult(formattedResult);
      } catch (error: any) {
        console.error("Erro ao carregar resultado:", error);
        setError(error.message || "Ocorreu um erro ao carregar os resultados da avaliação");
        toast({
          title: "Erro ao carregar resultados",
          description: error.message || "Ocorreu um erro ao carregar os resultados da avaliação",
          variant: "destructive"
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
              <h2 className="text-2xl font-bold mb-2">Resultado não encontrado</h2>
              <p className="text-muted-foreground mb-4">
                {error || "Não foi possível encontrar o resultado da avaliação solicitada ou os dados das questões estão incompletos."}
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
          <h1 className="text-3xl font-bold mb-2">{result?.title} - Resultado</h1>
          <p className="text-muted-foreground">{result?.description}</p>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Pontuação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Resultado</span>
                  <span className="font-bold">{result?.score} de {result?.maxScore} pontos</span>
                </div>
                <Progress value={result?.percentageScore} className="h-3" />
                <div className="flex justify-end mt-1 text-sm text-muted-foreground">
                  {result?.percentageScore}%
                </div>
              </div>
              
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Conclusão</p>
                  <p className="text-sm text-muted-foreground">
                    {result?.percentageScore && result.percentageScore >= 70 ? "Aprovado" : "Reprovado"}
                  </p>
                </div>
                {result?.percentageScore && result.percentageScore >= 70 ? (
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
                <span className="text-sm text-muted-foreground">Data de conclusão</span>
                <span className="text-sm font-medium">
                  {result?.completedAt && new Date(result.completedAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Questões corretas</span>
                <span className="text-sm font-medium">
                  {result?.score} de {result?.maxScore}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tempo médio por questão</span>
                <span className="text-sm font-medium">
                  ≈ 7 minutos
                </span>
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
