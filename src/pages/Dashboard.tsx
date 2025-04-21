
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SecureAppShell } from "@/components/secure-app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isAdmin } from "@/utils/secure-utils";
import { Book, Calendar, Clock, FileText, PenTool, Plus } from "lucide-react";

interface Assessment {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  dueDate: string;
  questionCount: number;
  completed?: boolean;
  score?: number;
}

// Dados de exemplo para simulação
const demoAssessments: Assessment[] = [
  {
    id: "1",
    title: "Fundamentos de Segurança Web",
    description: "Avaliação sobre conceitos básicos de segurança na web, incluindo XSS, CSRF e SQL Injection.",
    duration: 45,
    dueDate: "2023-12-15",
    questionCount: 10
  },
  {
    id: "2",
    title: "Programação Orientada a Objetos",
    description: "Avaliação prática sobre conceitos de POO como encapsulamento, herança e polimorfismo.",
    duration: 60,
    dueDate: "2023-12-20",
    questionCount: 8
  },
  {
    id: "3",
    title: "Estruturas de Dados",
    description: "Teste sobre arrays, listas encadeadas, árvores e algoritmos de ordenação.",
    duration: 90,
    dueDate: "2023-12-18",
    questionCount: 15,
    completed: true,
    score: 85
  }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [adminView, setAdminView] = useState<boolean>(false);
  
  useEffect(() => {
    // Verificar se o usuário está autenticado e seu tipo
    const userAdmin = isAdmin();
    setAdminView(userAdmin);
    
    // Carregar avaliações simuladas
    setAssessments(demoAssessments);
  }, []);
  
  const handleStartAssessment = (assessmentId: string) => {
    navigate(`/assessment/${assessmentId}`);
  };
  
  const handleCreateAssessment = () => {
    navigate("/create-assessment");
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <SecureAppShell>
      <div className="container py-8">
        <div className="mb-8 space-y-4">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            {adminView
              ? "Gerencie avaliações e veja o desempenho dos alunos."
              : "Acesse suas avaliações e acompanhe seu progresso."
            }
          </p>
        </div>
        
        <Tabs defaultValue="available" className="space-y-6">
          <TabsList>
            <TabsTrigger value="available">
              {adminView ? "Avaliações Criadas" : "Disponíveis"}
            </TabsTrigger>
            <TabsTrigger value="completed">
              {adminView ? "Resultados" : "Concluídas"}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="available" className="space-y-6">
            {adminView && (
              <div className="flex justify-end">
                <Button 
                  onClick={handleCreateAssessment}
                  className="cyber-button"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Nova Avaliação
                </Button>
              </div>
            )}
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {assessments
                .filter(assessment => !assessment.completed)
                .map(assessment => (
                  <Card key={assessment.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <CardTitle>{assessment.title}</CardTitle>
                      <CardDescription>{assessment.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm space-y-3">
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{assessment.duration} minutos</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Até {formatDate(assessment.dueDate)}</span>
                      </div>
                      <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{assessment.questionCount} questões</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        onClick={() => handleStartAssessment(assessment.id)}
                        className={adminView ? "w-full" : "cyber-button w-full"}
                      >
                        {adminView ? "Editar" : "Iniciar"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
                
                {!adminView && assessments.filter(a => !a.completed).length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <Book className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">Nenhuma avaliação disponível</h3>
                    <p className="text-muted-foreground">
                      Novas avaliações aparecerão aqui quando forem atribuídas a você.
                    </p>
                  </div>
                )}
                
                {adminView && assessments.filter(a => !a.completed).length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <PenTool className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">Nenhuma avaliação criada</h3>
                    <p className="text-muted-foreground mb-6">
                      Crie sua primeira avaliação clicando no botão acima.
                    </p>
                    <Button 
                      onClick={handleCreateAssessment}
                      className="cyber-button"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Nova Avaliação
                    </Button>
                  </div>
                )}
            </div>
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {assessments
                .filter(assessment => assessment.completed)
                .map(assessment => (
                  <Card key={assessment.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle>{assessment.title}</CardTitle>
                        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          {assessment.score}%
                        </span>
                      </div>
                      <CardDescription>{assessment.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm space-y-3">
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{assessment.duration} minutos</span>
                      </div>
                      <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{assessment.questionCount} questões</span>
                      </div>
                      
                      <div className="w-full bg-secondary rounded-full h-2.5">
                        <div 
                          className="bg-cyber-blue h-2.5 rounded-full" 
                          style={{ width: `${assessment.score}%` }}
                        ></div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="outline" 
                        onClick={() => navigate(`/assessment-result/${assessment.id}`)}
                        className="w-full"
                      >
                        Ver Detalhes
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
                
                {assessments.filter(a => a.completed).length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">Nenhuma avaliação concluída</h3>
                    <p className="text-muted-foreground">
                      {adminView 
                        ? "Os resultados das avaliações serão exibidos aqui quando os alunos as concluírem."
                        : "Suas avaliações concluídas serão exibidas aqui."
                      }
                    </p>
                  </div>
                )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </SecureAppShell>
  );
}
