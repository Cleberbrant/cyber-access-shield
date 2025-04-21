
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SecureAppShell } from "@/components/secure-app-shell";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAssessments } from "@/hooks/useAssessments";
import { AssessmentsList } from "@/components/dashboard/AssessmentsList";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { isAdmin, updateAdminStatus, disableAssessmentProtection } from "@/utils/secure-utils";

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { assessments, loading } = useAssessments();
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  
  useEffect(() => {
    // Garantir que qualquer proteção ativa seja removida ao acessar o Dashboard
    disableAssessmentProtection();
    // Também remover explicitamente a flag de avaliação em andamento
    localStorage.removeItem("assessmentInProgress");
    
    const checkAdminStatus = async () => {
      // Verificar se o usuário é admin
      const adminStatus = await isAdmin();
      setIsUserAdmin(adminStatus);
      await updateAdminStatus(); // Atualiza o localStorage para acesso síncrono
    };
    
    checkAdminStatus();
  }, []);
  
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
        
        <AssessmentsList
          assessments={assessments}
          isAdmin={isUserAdmin}
          isLoading={loading}
          onStartAssessment={handleStartAssessment}
          onCreateAssessment={() => navigate('/create-assessment')}
          onEditAssessment={(id) => navigate(`/edit-assessment/${id}`)}
        />
      </div>
    </SecureAppShell>
  );
}
