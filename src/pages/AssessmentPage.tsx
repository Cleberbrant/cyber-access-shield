
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SecureAppShell } from "@/components/secure-app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  enableAssessmentProtection, 
  disableAssessmentProtection,
  preventNavigation,
  sanitizeInput
} from "@/utils/secure-utils";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Clock, ArrowLeft, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Tipos
interface AssessmentQuestion {
  id: string;
  type: "multiple-choice" | "true-false" | "short-answer" | "code" | "matching";
  text: string;
  options?: string[];
  code?: string;
  matches?: { left: string; right: string }[];
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  questions: AssessmentQuestion[];
}

// Componente principal
export default function AssessmentPage() {
  const navigate = useNavigate();
  const { assessmentId } = useParams();
  const { toast } = useToast();
  
  // Estados
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [matchPairs, setMatchPairs] = useState<Record<string, string>>({});
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Carregar a avaliação do Supabase
  useEffect(() => {
    const fetchAssessment = async () => {
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
        
        // Buscar dados da avaliação
        const { data: assessmentData, error: assessmentError } = await supabase
          .from("assessments")
          .select("*")
          .eq("id", assessmentId)
          .single();
          
        if (assessmentError || !assessmentData) {
          throw new Error(assessmentError?.message || "Avaliação não encontrada");
        }

        // Buscar questões da avaliação
        const { data: questionsData, error: questionsError } = await supabase
          .from("questions")
          .select("*")
          .eq("assessment_id", assessmentId)
          .order("order_index");
          
        if (questionsError) {
          throw new Error(questionsError.message || "Erro ao carregar questões");
        }

        // Converter dados para o formato esperado pelo componente
        const formattedQuestions: AssessmentQuestion[] = questionsData.map(q => {
          let question: AssessmentQuestion = {
            id: q.id,
            text: q.question_text,
            type: mapQuestionType(q.question_type)
          };

          if (q.options) {
            if (q.question_type === "multiple_choice" && q.options.options) {
              question.options = q.options.options;
            } else if (q.question_type === "code" && q.options.code) {
              question.code = q.options.code;
            } else if (q.question_type === "matching" && q.options.matches) {
              question.matches = q.options.matches;
            }
          }

          return question;
        });

        const mappedAssessment: Assessment = {
          id: assessmentData.id,
          title: assessmentData.title,
          description: assessmentData.description || "",
          duration: assessmentData.duration_minutes,
          questions: formattedQuestions
        };
        
        setAssessment(mappedAssessment);
        setTimeLeft(assessmentData.duration_minutes * 60); // Converter minutos para segundos
        
        // Criar uma sessão de avaliação
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
            setSessionId(sessionData.id);
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
    
    fetchAssessment();
  }, [assessmentId, navigate, toast]);
  
  // Helper para mapear tipos de questões do banco para o formato do componente
  const mapQuestionType = (dbType: string): AssessmentQuestion["type"] => {
    const typeMap: Record<string, AssessmentQuestion["type"]> = {
      "multiple_choice": "multiple-choice",
      "true_false": "true-false",
      "text": "short-answer",
      "code": "code",
      "matching": "matching"
    };
    
    return typeMap[dbType as keyof typeof typeMap] || "multiple-choice";
  };

  // Configurar o cronômetro regressivo
  useEffect(() => {
    if (!assessment || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitAssessment();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [assessment, timeLeft]);
  
  // Ativar proteções de segurança quando a avaliação for carregada
  useEffect(() => {
    if (loading || !assessment) return;
    
    // Ativar proteções de segurança
    enableAssessmentProtection();
    
    // Prevenir navegação para fora da página
    const removePreventNavigation = preventNavigation();
    
    return () => {
      // Desativar proteções quando o componente é desmontado
      disableAssessmentProtection();
      removePreventNavigation();
    };
  }, [loading, assessment]);

  // Formatar o tempo restante
  const formatTimeLeft = useCallback(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [timeLeft]);
  
  // Manipular a navegação entre questões
  const goToNextQuestion = () => {
    if (currentQuestionIndex < (assessment?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  const goToPrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  // Manipular as respostas
  const handleAnswerChange = (questionId: string, value: any) => {
    // Sanitizar entradas para prevenir SQL Injection
    const sanitizedValue = typeof value === 'string' ? sanitizeInput(value) : value;
    
    setAnswers(prev => ({
      ...prev,
      [questionId]: sanitizedValue
    }));
    
    // Salvar resposta no banco de dados
    if (sessionId) {
      saveAnswer(questionId, sanitizedValue);
    }
  };
  
  // Salvar resposta no banco de dados
  const saveAnswer = async (questionId: string, answer: any) => {
    if (!sessionId) return;
    
    try {
      // Converter resposta para string (caso seja um objeto)
      const stringAnswer = typeof answer === 'object' ? JSON.stringify(answer) : String(answer);
      
      // Usar upsert para criar ou atualizar a resposta
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
  };
  
  const handleMatchPairChange = (questionId: string, leftItem: string, rightItem: string) => {
    // Sanitizar entradas
    const sanitizedLeftItem = sanitizeInput(leftItem);
    const sanitizedRightItem = sanitizeInput(rightItem);
    
    setMatchPairs(prev => ({
      ...prev,
      [sanitizedLeftItem]: sanitizedRightItem
    }));
    
    // Atualizar as respostas com todos os pares atuais
    const allPairs = { ...matchPairs, [sanitizedLeftItem]: sanitizedRightItem };
    handleAnswerChange(questionId, allPairs);
  };
  
  // Manipular o envio da avaliação
  const handleSubmitAssessment = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Verificar se todas as questões foram respondidas
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
            // Aqui poderia calcular pontuação preliminar se necessário
          })
          .eq("id", sessionId);
      }
      
      // Desativar proteções de segurança
      disableAssessmentProtection();
      
      // Redirecionar para a página de resultados
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
  };
  
  // Renderizar a questão atual
  const renderCurrentQuestion = () => {
    if (!assessment) return null;
    
    const question = assessment.questions[currentQuestionIndex];
    if (!question) return null;
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{question.text}</h3>
        
        {question.type === "multiple-choice" && (
          <RadioGroup
            value={answers[question.id]?.toString()}
            onValueChange={(value) => handleAnswerChange(question.id, parseInt(value))}
            className="space-y-3"
          >
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-start space-x-2">
                <RadioGroupItem value={index.toString()} id={`q${question.id}-option-${index}`} />
                <Label htmlFor={`q${question.id}-option-${index}`} className="text-base">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
        
        {question.type === "true-false" && (
          <RadioGroup
            value={answers[question.id]?.toString()}
            onValueChange={(value) => handleAnswerChange(question.id, value === "true")}
          >
            <div className="flex space-x-8">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id={`q${question.id}-true`} />
                <Label htmlFor={`q${question.id}-true`}>Verdadeiro</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id={`q${question.id}-false`} />
                <Label htmlFor={`q${question.id}-false`}>Falso</Label>
              </div>
            </div>
          </RadioGroup>
        )}
        
        {question.type === "short-answer" && (
          <Textarea
            value={answers[question.id] || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Sua resposta"
            className="min-h-[120px]"
          />
        )}
        
        {question.type === "code" && (
          <div className="space-y-3">
            <div className="rounded-md border bg-muted/50 p-3">
              <pre className="text-sm font-mono whitespace-pre-wrap">{question.code}</pre>
            </div>
            <Textarea
              value={answers[question.id] || ""}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder="Digite seu código aqui"
              className="min-h-[150px] font-mono"
            />
          </div>
        )}
        
        {question.type === "matching" && question.matches && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Itens</Label>
                <div className="space-y-2">
                  {question.matches.map((match, index) => (
                    <Card key={`left-${index}`} className="border-dashed">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <span>{match.left}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Correspondências</Label>
                <div className="space-y-2">
                  {question.matches.map((match, index) => (
                    <div key={`right-${index}`} className="relative">
                      <select
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        value={matchPairs[question.matches?.[index].left || ""] || ""}
                        onChange={(e) => handleMatchPairChange(
                          question.id,
                          question.matches?.[index].left || "",
                          e.target.value
                        )}
                      >
                        <option value="">Selecione uma correspondência</option>
                        {question.matches?.map((match, idx) => (
                          <option key={idx} value={match.right}>
                            {match.right}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
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
        {/* Cabeçalho da avaliação */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{assessment.title}</h1>
              <p className="text-muted-foreground">{assessment.description}</p>
            </div>
            
            <div className="flex items-center gap-2 bg-card p-2 rounded-md border shadow">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="text-lg font-medium">{formatTimeLeft()}</span>
            </div>
          </div>
          
          <div className="mt-4">
            <Progress 
              value={(currentQuestionIndex + 1) / assessment.questions.length * 100} 
              className="h-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Questão {currentQuestionIndex + 1} de {assessment.questions.length}</span>
              <span>
                {Math.round((currentQuestionIndex + 1) / assessment.questions.length * 100)}% concluído
              </span>
            </div>
          </div>
        </div>
        
        {/* Conteúdo da questão */}
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
              onClick={goToPrevQuestion}
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
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Enviando...
                  </>
                ) : (
                  "Finalizar"
                )}
              </Button>
            ) : (
              <Button 
                onClick={goToNextQuestion}
                disabled={currentQuestionIndex === assessment.questions.length - 1}
              >
                Próxima
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </Card>
        
        {/* Navegação rápida pelas questões */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2">Navegação rápida:</h3>
          <div className="flex flex-wrap gap-2">
            {assessment.questions.map((_, index) => (
              <Button
                key={index}
                variant={index === currentQuestionIndex ? "default" : 
                       answers[assessment.questions[index].id] ? "outline" : "ghost"}
                size="sm"
                onClick={() => setCurrentQuestionIndex(index)}
                className={index === currentQuestionIndex ? "" : 
                        answers[assessment.questions[index].id] ? "border-primary/50" : "border-dashed"}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Botão de finalizar */}
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
