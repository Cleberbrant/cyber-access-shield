
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SecureAppShell } from "@/components/secure-app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle, XCircle, FileText, Home } from "lucide-react";

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

// Dados de exemplo para simulação
const demoResult: AssessmentResult = {
  id: "1",
  title: "Fundamentos de Segurança Web",
  description: "Avaliação sobre conceitos básicos de segurança na web, incluindo XSS, CSRF e SQL Injection.",
  score: 4,
  maxScore: 6,
  percentageScore: 67,
  completedAt: new Date().toISOString(),
  questionsResults: [
    {
      id: "q1",
      text: "Qual das seguintes não é uma técnica adequada para prevenção de ataques XSS?",
      correct: true,
      userAnswer: "Usar a propriedade innerHTML para renderizar conteúdo dinâmico",
      correctAnswer: "Usar a propriedade innerHTML para renderizar conteúdo dinâmico",
      explanation: "O uso de innerHTML para renderizar conteúdo dinâmico é perigoso, pois permite a execução de código malicioso. Em vez disso, use textContent ou frameworks seguros que escapam automaticamente o conteúdo."
    },
    {
      id: "q2",
      text: "SQL Injection pode ser completamente prevenido usando apenas validação do lado do cliente.",
      correct: true,
      userAnswer: "Falso",
      correctAnswer: "Falso",
      explanation: "Validação do lado do cliente pode ser facilmente contornada. SQL Injection deve ser prevenido com prepared statements, validação do lado do servidor e escaping adequado."
    },
    {
      id: "q3",
      text: "Qual das seguintes técnicas é mais eficaz para prevenir ataques CSRF?",
      correct: true,
      userAnswer: "Implementar tokens anti-CSRF",
      correctAnswer: "Implementar tokens anti-CSRF",
      explanation: "Tokens anti-CSRF são a forma mais eficaz de prevenir ataques CSRF, pois garantem que apenas requisições legítimas do site sejam aceitas."
    },
    {
      id: "q4",
      text: "Explique brevemente o conceito de Same-Origin Policy e sua importância para a segurança web.",
      correct: false,
      userAnswer: "É uma política que impede que scripts de um site acessem dados de outro site.",
      correctAnswer: "É uma política de segurança crítica que restringe como documentos ou scripts de uma origem podem interagir com recursos de outra origem, impedindo acesso não autorizado a dados entre diferentes origens (esquema, host e porta).",
      explanation: "Same-Origin Policy é uma barreira de segurança fundamental que impede que scripts de uma origem (esquema + host + porta) acessem ou modifiquem propriedades de recursos de uma origem diferente, protegendo os usuários contra ataques XSS e roubo de dados."
    },
    {
      id: "q5",
      text: "Identifique e corrija a vulnerabilidade de SQL Injection no seguinte código.",
      correct: false,
      userAnswer: "Não consegui identificar a vulnerabilidade",
      correctAnswer: "function getUserData(userId) {\n  // Usando prepared statements para evitar SQL Injection\n  const query = \"SELECT * FROM users WHERE id = ?\";\n  return db.execute(query, [userId]);\n}",
      explanation: "O código original é vulnerável a SQL Injection porque concatena diretamente o valor do userId à query. A correção envolve usar prepared statements ou parâmetros que escapam os valores adequadamente."
    },
    {
      id: "q6",
      text: "Relacione os conceitos de segurança com suas descrições.",
      correct: true,
      userAnswer: "Todas as correspondências estão corretas",
      correctAnswer: "Todas as correspondências estão corretas",
      explanation: "XSS, CSRF, SQLi e CORS são conceitos fundamentais de segurança web que todo desenvolvedor deve compreender."
    }
  ]
};

export default function AssessmentResultPage() {
  const navigate = useNavigate();
  const { assessmentId } = useParams();
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        
        // Simulando uma chamada de API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Usar dados de exemplo para simulação
        setResult(demoResult);
      } catch (error) {
        console.error("Erro ao carregar resultado:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResult();
  }, [assessmentId]);
  
  if (loading) {
    return (
      <SecureAppShell>
        <div className="container py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="h-8 w-8 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p>Carregando resultados...</p>
            </div>
          </div>
        </div>
      </SecureAppShell>
    );
  }
  
  if (!result) {
    return (
      <SecureAppShell>
        <div className="container py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Resultado não encontrado</h2>
              <p className="text-muted-foreground mb-4">
                Não foi possível encontrar o resultado da avaliação solicitada.
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
          <h1 className="text-3xl font-bold mb-2">{result.title} - Resultado</h1>
          <p className="text-muted-foreground">{result.description}</p>
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
                  <span className="font-bold">{result.score} de {result.maxScore} pontos</span>
                </div>
                <Progress value={result.percentageScore} className="h-3" />
                <div className="flex justify-end mt-1 text-sm text-muted-foreground">
                  {result.percentageScore}%
                </div>
              </div>
              
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Conclusão</p>
                  <p className="text-sm text-muted-foreground">
                    {result.percentageScore >= 70 ? "Aprovado" : "Reprovado"}
                  </p>
                </div>
                {result.percentageScore >= 70 ? (
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
                  {new Date(result.completedAt).toLocaleDateString('pt-BR', {
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
                  {result.questionsResults.filter(q => q.correct).length} de {result.maxScore}
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
          
          {result.questionsResults.map((question, index) => (
            <Card key={question.id} className="overflow-hidden">
              <div className={`h-1 ${question.correct ? 'bg-green-500' : 'bg-red-500'}`} />
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base font-medium">Questão {index + 1}</CardTitle>
                  {question.correct ? (
                    <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />
                      Correta
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      <XCircle className="h-3.5 w-3.5 mr-1" />
                      Incorreta
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="py-3">
                <p className="mb-3">{question.text}</p>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Sua resposta: </span>
                    <span className={question.correct ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                      {question.userAnswer}
                    </span>
                  </div>
                  
                  {!question.correct && (
                    <div>
                      <span className="font-medium">Resposta correta: </span>
                      <span className="text-green-600 dark:text-green-400">{question.correctAnswer}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              {question.explanation && (
                <CardFooter className="bg-muted/50 pt-3 pb-3">
                  <div className="text-sm">
                    <span className="font-medium">Explicação: </span>
                    <span className="text-muted-foreground">{question.explanation}</span>
                  </div>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
        
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Button 
            variant="outline"
            className="flex gap-2" 
            onClick={() => navigate(`/assessment/${result.id}`)}
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
