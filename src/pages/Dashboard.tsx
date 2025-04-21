
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SecureAppShell } from "@/components/secure-app-shell";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileText, Clock, Calendar, Plus, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { isAdmin, updateAdminStatus, disableAssessmentProtection } from "@/utils/secure-utils";

interface Assessment {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  created_at: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  
  useEffect(() => {
    // Garantir que qualquer proteção ativa seja removida ao acessar o Dashboard
    disableAssessmentProtection();
    // Também remover explicitamente a flag de avaliação em andamento
    localStorage.removeItem("assessmentInProgress");
    
    const fetchData = async () => {
      try {
        // Verificar se o usuário é admin
        const adminStatus = await isAdmin();
        setIsUserAdmin(adminStatus);
        await updateAdminStatus(); // Atualiza o localStorage para acesso síncrono
        
        // Buscar avaliações
        const { data, error } = await supabase
          .from('assessments')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setAssessments(data || []);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as avaliações. Tente novamente mais tarde.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Configurar listener para atualizações em tempo real nas avaliações
    const channel = supabase
      .channel('public:assessments')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'assessments'
      }, () => {
        // Recarregar avaliações quando houver mudanças
        fetchData();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);
  
  const handleStartAssessment = async (assessmentId: string) => {
    try {
      // Verificar se o usuário já tem uma sessão em andamento para esta avaliação
      const { data: existingSessions, error: checkError } = await supabase
        .from('assessment_sessions')
        .select('id, is_completed')
        .eq('assessment_id', assessmentId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (checkError) throw checkError;
      
      let sessionId = '';
      
      if (existingSessions && existingSessions.length > 0) {
        // Sessão existente
        const lastSession = existingSessions[0];
        
        if (!lastSession.is_completed) {
          // Continuar sessão não finalizada
          sessionId = lastSession.id;
          toast({
            title: "Continuando avaliação",
            description: "Você está retomando uma avaliação em andamento."
          });
        } else {
          // Criar uma nova sessão, pois a última foi finalizada
          const { data, error } = await supabase
            .from('assessment_sessions')
            .insert([
              { assessment_id: assessmentId, user_id: (await supabase.auth.getUser()).data.user?.id }
            ])
            .select('id')
            .single();
          
          if (error) throw error;
          sessionId = data.id;
        }
      } else {
        // Criar uma nova sessão
        const { data, error } = await supabase
          .from('assessment_sessions')
          .insert([
            { assessment_id: assessmentId, user_id: (await supabase.auth.getUser()).data.user?.id }
          ])
          .select('id')
          .single();
        
        if (error) throw error;
        sessionId = data.id;
      }
      
      // Navegar diretamente para a página de avaliação sem mostrar diálogo de confirmação
      console.log("Iniciando avaliação, navegando para:", `/assessment/${assessmentId}?session=${sessionId}`);
      navigate(`/assessment/${assessmentId}?session=${sessionId}`);
    } catch (error: any) {
      console.error("Erro ao iniciar avaliação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a avaliação. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <SecureAppShell>
      <div className="container py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              {isUserAdmin
                ? "Gerencie e crie avaliações seguras para seus alunos."
                : "Participe de avaliações e acompanhe seu desempenho."}
            </p>
          </div>
          
          {isUserAdmin && (
            <Button
              onClick={() => navigate('/create-assessment')}
              className="mt-4 sm:mt-0"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Avaliação
            </Button>
          )}
        </div>
        
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 w-2/3 bg-muted rounded mb-2"></div>
                  <div className="h-4 w-1/2 bg-muted rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 w-full bg-muted rounded mb-2"></div>
                  <div className="h-4 w-5/6 bg-muted rounded"></div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="h-5 w-1/3 bg-muted rounded"></div>
                  <div className="h-10 w-1/3 bg-muted rounded"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : assessments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-1">Nenhuma avaliação disponível</h3>
              <p className="text-muted-foreground text-center max-w-md">
                {isUserAdmin
                  ? "Você ainda não criou nenhuma avaliação. Clique no botão 'Nova Avaliação' para começar."
                  : "Não há avaliações disponíveis para você no momento."}
              </p>
              
              {isUserAdmin && (
                <Button
                  onClick={() => navigate('/create-assessment')}
                  className="mt-6"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Criar primeira avaliação
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {assessments.map((assessment) => (
              <Card key={assessment.id}>
                <CardHeader>
                  <CardTitle>{assessment.title}</CardTitle>
                  <CardDescription>
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-1 h-3 w-3" />
                      Criada em {formatDate(assessment.created_at)}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {assessment.description || "Sem descrição"}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-1 h-4 w-4" />
                    {assessment.duration_minutes} minutos
                  </div>
                  
                  {isUserAdmin ? (
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/edit-assessment/${assessment.id}`)}
                    >
                      <Pencil className="mr-1 h-4 w-4" />
                      Editar
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleStartAssessment(assessment.id)}
                    >
                      Iniciar
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </SecureAppShell>
  );
}
