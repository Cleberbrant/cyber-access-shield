import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SecureAppShell } from "@/components/secure-app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Plus, 
  Minus, 
  ArrowLeft, 
  FileText,
  Check,
  Code,
  AlignJustify,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isAdminSync, sanitizeInput, updateAdminStatus } from "@/utils/secure-utils";
import { supabase } from "@/integrations/supabase/client";

type QuestionType = "multiple_choice" | "true_false" | "text" | "code" | "matching";

interface Question {
  id: string;
  type: QuestionType;
  text: string;
  code?: string;
  options?: string[];
  correctAnswer?: string | number | boolean;
  order?: number;
  matches?: {
    left: string;
    right: string;
  }[];
}

export default function CreateAssessmentPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id: assessmentId } = useParams();
  const isEditMode = !!assessmentId;
  
  const [isUserAdmin, setIsUserAdmin] = useState(() => isAdminSync());
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("45");
  const [questions, setQuestions] = useState<Question[]>([]);
  
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    id: "",
    type: "multiple_choice",
    text: "",
    options: ["", "", "", ""],
    correctAnswer: 0
  });
  
  useEffect(() => {
    const checkAdmin = async () => {
      await updateAdminStatus();
      setIsUserAdmin(isAdminSync());
      
      if (!isAdminSync()) {
        navigate("/dashboard");
        return;
      }
    };
    
    checkAdmin();
    
    if (isEditMode && assessmentId) {
      const fetchAssessment = async () => {
        setLoading(true);
        try {
          const { data: assessmentData, error: assessmentError } = await supabase
            .from('assessments')
            .select('*')
            .eq('id', assessmentId)
            .single();
            
          if (assessmentError) throw assessmentError;
          
          setTitle(assessmentData.title);
          setDescription(assessmentData.description || "");
          setDuration(assessmentData.duration_minutes.toString());
          
          const { data: questionsData, error: questionsError } = await supabase
            .from('questions')
            .select('*')
            .eq('assessment_id', assessmentId)
            .order('order_index');
            
          if (questionsError) throw questionsError;
          
          const formattedQuestions: Question[] = questionsData.map(q => {
            const question: Question = {
              id: q.id,
              type: q.question_type as QuestionType,
              text: q.question_text,
              order: q.order_index
            };
            
            if (q.options) {
              if (q.question_type === "multiple_choice") {
                question.options = q.options.options;
                question.correctAnswer = q.correct_answer !== null ? parseInt(q.correct_answer) : 0;
              } else if (q.question_type === "true_false") {
                question.correctAnswer = q.correct_answer === "true";
              } else if (q.question_type === "matching") {
                question.matches = q.options.matches;
              }
            }
            
            if (q.question_type === "text") {
              question.correctAnswer = q.correct_answer || "";
            }
            
            if (q.question_type === "code") {
              question.code = q.options?.code || "";
              question.correctAnswer = q.correct_answer || "";
            }
            
            return question;
          });
          
          setQuestions(formattedQuestions);
        } catch (error) {
          console.error("Erro ao carregar avaliação:", error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar os dados da avaliação.",
            variant: "destructive"
          });
          navigate("/dashboard");
        } finally {
          setLoading(false);
        }
      };
      
      fetchAssessment();
    }
  }, [assessmentId, isEditMode, navigate, toast]);
  
  if (!isUserAdmin) {
    navigate("/dashboard");
    return null;
  }
  
  const addQuestion = () => {
    if (!currentQuestion.text.trim()) {
      toast({
        title: "Erro",
        description: "A questão deve ter um enunciado.",
        variant: "destructive"
      });
      return;
    }
    
    if (currentQuestion.type === "multiple_choice" && 
        (!currentQuestion.options || 
         currentQuestion.options.some(opt => !opt.trim()) || 
         currentQuestion.options.length < 2)) {
      toast({
        title: "Erro",
        description: "Questões de múltipla escolha precisam de pelo menos duas opções válidas.",
        variant: "destructive"
      });
      return;
    }
    
    if (currentQuestion.type === "code" && !currentQuestion.code?.trim()) {
      toast({
        title: "Erro",
        description: "Questões de código precisam ter um snippet inicial.",
        variant: "destructive"
      });
      return;
    }
    
    if (currentQuestion.type === "matching" && 
        (!currentQuestion.matches || 
         currentQuestion.matches.length < 2 ||
         currentQuestion.matches.some(match => !match.left.trim() || !match.right.trim()))) {
      toast({
        title: "Erro",
        description: "Questões de correspondência precisam de pelo menos dois pares válidos.",
        variant: "destructive"
      });
      return;
    }
    
    const newQuestion = {
      ...currentQuestion,
      id: `q${Date.now()}`,
      text: sanitizeInput(currentQuestion.text)
    };
    
    setQuestions([...questions, newQuestion]);
    
    resetQuestionForm();
    
    toast({
      title: "Questão adicionada",
      description: "A questão foi adicionada à avaliação.",
    });
  };
  
  const resetQuestionForm = () => {
    setCurrentQuestion({
      id: "",
      type: "multiple_choice",
      text: "",
      options: ["", "", "", ""],
      correctAnswer: 0
    });
  };
  
  const handleQuestionTypeChange = (type: QuestionType) => {
    let newQuestion: Question = {
      id: "",
      type,
      text: currentQuestion.text
    };
    
    switch (type) {
      case "multiple_choice":
        newQuestion.options = ["", "", "", ""];
        newQuestion.correctAnswer = 0;
        break;
      case "true_false":
        newQuestion.correctAnswer = true;
        break;
      case "text":
        newQuestion.correctAnswer = "";
        break;
      case "code":
        newQuestion.code = "// Digite o código inicial aqui\n\n";
        newQuestion.correctAnswer = "// Solução esperada\n\n";
        break;
      case "matching":
        newQuestion.matches = [
          { left: "", right: "" },
          { left: "", right: "" }
        ];
        break;
    }
    
    setCurrentQuestion(newQuestion);
  };
  
  const removeQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
    toast({
      title: "Questão removida",
      description: "A questão foi removida da avaliação."
    });
  };
  
  const handleSaveAssessment = async () => {
    if (!title.trim()) {
      toast({
        title: "Erro",
        description: "O título da avaliação é obrigatório.",
        variant: "destructive"
      });
      return;
    }
    
    if (!description.trim()) {
      toast({
        title: "Erro",
        description: "A descrição da avaliação é obrigatória.",
        variant: "destructive"
      });
      return;
    }
    
    if (!duration || parseInt(duration) <= 0) {
      toast({
        title: "Erro",
        description: "A duração da avaliação deve ser um número positivo.",
        variant: "destructive"
      });
      return;
    }
    
    if (questions.length === 0) {
      toast({
        title: "Erro",
        description: "A avaliação deve ter pelo menos uma questão.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");
      
      let savedAssessmentId: string;
      
      if (isEditMode && assessmentId) {
        const { error } = await supabase
          .from('assessments')
          .update({
            title,
            description,
            duration_minutes: parseInt(duration)
          })
          .eq('id', assessmentId);
          
        if (error) throw error;
        savedAssessmentId = assessmentId;
        
        await supabase
          .from('questions')
          .delete()
          .eq('assessment_id', assessmentId);
      } else {
        const { data, error } = await supabase
          .from('assessments')
          .insert({
            title,
            description,
            duration_minutes: parseInt(duration),
            created_by: user.id
          })
          .select('id')
          .single();
          
        if (error) throw error;
        savedAssessmentId = data.id;
      }
      
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        
        const questionData: any = {
          assessment_id: savedAssessmentId,
          question_text: q.text,
          question_type: q.type,
          order_index: i,
          points: 1
        };
        
        if (q.type === "multiple_choice") {
          questionData.options = { options: q.options };
          questionData.correct_answer = q.correctAnswer?.toString();
        } else if (q.type === "true_false") {
          questionData.correct_answer = q.correctAnswer === true ? "true" : "false";
        } else if (q.type === "text") {
          questionData.correct_answer = q.correctAnswer as string;
        } else if (q.type === "code") {
          questionData.options = { code: q.code };
          questionData.correct_answer = q.correctAnswer as string;
        } else if (q.type === "matching") {
          questionData.options = { matches: q.matches };
        }
        
        const { error } = await supabase
          .from('questions')
          .insert(questionData);
          
        if (error) throw error;
      }
      
      toast({
        title: isEditMode ? "Avaliação atualizada" : "Avaliação criada",
        description: isEditMode 
          ? "A avaliação foi atualizada com sucesso." 
          : "A avaliação foi criada com sucesso."
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Erro ao salvar avaliação:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a avaliação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const renderQuestionFields = () => {
    switch (currentQuestion.type) {
      case "multiple_choice":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question-options">Alternativas:</Label>
              {currentQuestion.options?.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <RadioGroup
                    value={currentQuestion.correctAnswer?.toString()}
                    onValueChange={(value) => setCurrentQuestion({
                      ...currentQuestion,
                      correctAnswer: parseInt(value)
                    })}
                    className="flex items-center"
                  >
                    <RadioGroupItem 
                      value={index.toString()} 
                      id={`option-${index}`}
                    />
                  </RadioGroup>
                  <Input
                    id={`option-${index}`}
                    value={option}
                    onChange={e => {
                      const newOptions = [...(currentQuestion.options || [])];
                      newOptions[index] = e.target.value;
                      setCurrentQuestion({
                        ...currentQuestion,
                        options: newOptions
                      });
                    }}
                    placeholder={`Alternativa ${index + 1}`}
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const newOptions = [...(currentQuestion.options || []), ""];
                  setCurrentQuestion({
                    ...currentQuestion,
                    options: newOptions
                  });
                }}
                disabled={(currentQuestion.options?.length || 0) >= 6}
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar alternativa
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if ((currentQuestion.options?.length || 0) <= 2) return;
                  const newOptions = [...(currentQuestion.options || [])].slice(0, -1);
                  setCurrentQuestion({
                    ...currentQuestion,
                    options: newOptions,
                    correctAnswer: Math.min(
                      currentQuestion.correctAnswer as number, 
                      newOptions.length - 1
                    )
                  });
                }}
                disabled={(currentQuestion.options?.length || 0) <= 2}
              >
                <Minus className="h-4 w-4 mr-1" />
                Remover alternativa
              </Button>
            </div>
          </div>
        );
        
      case "true_false":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Resposta correta:</Label>
              <RadioGroup
                value={currentQuestion.correctAnswer === true ? "true" : "false"}
                onValueChange={(value) => {
                  setCurrentQuestion({
                    ...currentQuestion,
                    correctAnswer: value === "true"
                  });
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="true" />
                  <Label htmlFor="true">Verdadeiro</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="false" />
                  <Label htmlFor="false">Falso</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );
        
      case "text":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="correct-answer">Resposta esperada:</Label>
              <Textarea
                id="correct-answer"
                value={currentQuestion.correctAnswer as string}
                onChange={e => {
                  setCurrentQuestion({
                    ...currentQuestion,
                    correctAnswer: e.target.value
                  });
                }}
                placeholder="Digite a resposta esperada"
                className="h-24"
              />
              <p className="text-sm text-muted-foreground">
                Esta é a resposta que você espera dos alunos. A comparação será feita considerando pequenas variações.
              </p>
            </div>
          </div>
        );
        
      case "code":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code-snippet">Snippet inicial:</Label>
              <Textarea
                id="code-snippet"
                value={currentQuestion.code}
                onChange={e => {
                  setCurrentQuestion({
                    ...currentQuestion,
                    code: e.target.value
                  });
                }}
                placeholder="// Digite o código inicial aqui"
                className="h-32 font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expected-solution">Solução esperada:</Label>
              <Textarea
                id="expected-solution"
                value={currentQuestion.correctAnswer as string}
                onChange={e => {
                  setCurrentQuestion({
                    ...currentQuestion,
                    correctAnswer: e.target.value
                  });
                }}
                placeholder="// Digite a solução esperada"
                className="h-32 font-mono"
              />
            </div>
          </div>
        );
        
      case "matching":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Itens para correspondência:</Label>
              {currentQuestion.matches?.map((match, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={match.left}
                    onChange={e => {
                      const newMatches = [...(currentQuestion.matches || [])];
                      newMatches[index] = {
                        ...newMatches[index],
                        left: e.target.value
                      };
                      setCurrentQuestion({
                        ...currentQuestion,
                        matches: newMatches
                      });
                    }}
                    placeholder={`Item ${index + 1}`}
                    className="w-1/2"
                  />
                  <span className="text-muted-foreground">corresponde a</span>
                  <Input
                    value={match.right}
                    onChange={e => {
                      const newMatches = [...(currentQuestion.matches || [])];
                      newMatches[index] = {
                        ...newMatches[index],
                        right: e.target.value
                      };
                      setCurrentQuestion({
                        ...currentQuestion,
                        matches: newMatches
                      });
                    }}
                    placeholder={`Correspondência ${index + 1}`}
                    className="w-1/2"
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const newMatches = [
                    ...(currentQuestion.matches || []),
                    { left: "", right: "" }
                  ];
                  setCurrentQuestion({
                    ...currentQuestion,
                    matches: newMatches
                  });
                }}
                disabled={(currentQuestion.matches?.length || 0) >= 6}
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar par
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if ((currentQuestion.matches?.length || 0) <= 2) return;
                  const newMatches = [...(currentQuestion.matches || [])].slice(0, -1);
                  setCurrentQuestion({
                    ...currentQuestion,
                    matches: newMatches
                  });
                }}
                disabled={(currentQuestion.matches?.length || 0) <= 2}
              >
                <Minus className="h-4 w-4 mr-1" />
                Remover par
              </Button>
            </div>
          </div>
        );
    }
  };
  
  const getQuestionTypeIcon = (type: QuestionType) => {
    switch (type) {
      case "multiple_choice":
        return <div className="flex items-center">
                <RadioGroup value="na">
                  <RadioGroupItem value="na" className="border-primary" />
                </RadioGroup>
              </div>;
      case "true_false":
        return <Check className="h-4 w-4 text-primary" />;
      case "text":
        return <AlignJustify className="h-4 w-4 text-primary" />;
      case "code":
        return <Code className="h-4 w-4 text-primary" />;
      case "matching":
        return <FileText className="h-4 w-4 text-primary" />;
      default:
        return <FileText className="h-4 w-4 text-primary" />;
    }
  };

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
        
        <div className="mb-8 space-y-4">
          <h1 className="text-3xl font-bold">
            {isEditMode ? "Editar Avaliação" : "Criar Nova Avaliação"}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode 
              ? "Modifique as configurações e questões da sua avaliação." 
              : "Defina as configurações e questões para sua avaliação."}
          </p>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
            <span>Carregando...</span>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título da avaliação</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Ex: Fundamentos de Segurança Web"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Descrição da avaliação e instruções para os alunos"
                        className="h-24"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duração (minutos)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={duration}
                        onChange={e => setDuration(e.target.value)}
                        min="1"
                        placeholder="Ex: 45"
                      />
                    </div>
                    
                    <div className="pt-4">
                      <p className="text-sm font-medium mb-2">Resumo:</p>
                      <ul className="text-sm space-y-1">
                        <li>
                          Questões: <span className="font-medium">{questions.length}</span>
                        </li>
                        <li>
                          Duração: <span className="font-medium">{duration} minutos</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">Adicionar Nova Questão</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="question-type">Tipo de questão</Label>
                      <Select
                        value={currentQuestion.type}
                        onValueChange={value => handleQuestionTypeChange(value as QuestionType)}
                      >
                        <SelectTrigger id="question-type">
                          <SelectValue placeholder="Selecione o tipo de questão" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple_choice">Múltipla escolha</SelectItem>
                          <SelectItem value="true_false">Verdadeiro/Falso</SelectItem>
                          <SelectItem value="text">Resposta curta</SelectItem>
                          <SelectItem value="code">Código</SelectItem>
                          <SelectItem value="matching">Correspondência</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="question-text">Enunciado da questão</Label>
                      <Textarea
                        id="question-text"
                        value={currentQuestion.text}
                        onChange={e => setCurrentQuestion({
                          ...currentQuestion,
                          text: e.target.value
                        })}
                        placeholder="Digite o enunciado da questão"
                        className="h-24"
                      />
                    </div>
                    
                    {renderQuestionFields()}
                    
                    <div className="flex justify-end gap-2 pt-4">
                      <Button 
                        variant="outline" 
                        onClick={resetQuestionForm}
                      >
                        Limpar
                      </Button>
                      <Button 
                        onClick={addQuestion}
                        className="cyber-button"
                      >
                        Adicionar Questão
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Questões Adicionadas ({questions.length})</h3>
                
                {questions.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">
                        Nenhuma questão adicionada. Use o formulário acima para adicionar questões.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {questions.map((question, index) => (
                      <Card key={question.id}>
                        <CardContent className="py-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full border bg-muted">
                                <span className="text-xs font-medium">{index + 1}</span>
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  {getQuestionTypeIcon(question.type)}
                                  <span className="text-xs text-muted-foreground capitalize">
                                    {question.type === "multiple_choice" ? "Múltipla escolha" :
                                     question.type === "true_false" ? "Verdadeiro/Falso" :
                                     question.type === "text" ? "Resposta curta" :
                                     question.type === "code" ? "Código" :
                                     question.type === "matching" ? "Correspondência" : ""}
                                  </span>
                                </div>
                                <p className="font-medium">{question.text}</p>
                                
                                {question.type === "multiple_choice" && question.options && (
                                  <div className="mt-2 space-y-1 text-sm">
                                    {question.options.map((option, i) => (
                                      <div key={i} className="flex items-center gap-2">
                                        <div className={`h-3 w-3 rounded-full ${i === question.correctAnswer ? 'bg-cyber-blue' : 'bg-muted'}`}></div>
                                        <span className={i === question.correctAnswer ? 'font-medium' : ''}>{option}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                
                                {question.type === "true_false" && (
                                  <div className="mt-2 flex items-center gap-2 text-sm">
                                    <span>Resposta correta:</span>
                                    <span className="font-medium">{question.correctAnswer === true ? "Verdadeiro" : "Falso"}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeQuestion(question.id)}
                              className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                            >
                              <Minus className="h-4 w-4" />
                              <span className="sr-only">Remover questão</span>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center pt-6">
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveAssessment}
                  disabled={loading || !title || !description || !duration || questions.length === 0}
                  className="cyber-button"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : isEditMode ? (
                    "Atualizar Avaliação"
                  ) : (
                    "Salvar Avaliação"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SecureAppShell>
  );
}
