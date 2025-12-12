import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SecureAppShell } from "@/components/secure-app-shell";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAssessments } from "@/hooks/useAssessments";
import { useAssessmentDeletion } from "@/hooks/useAssessmentDeletion";
import { AssessmentsList } from "@/components/dashboard/AssessmentsList";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { isAdmin, updateAdminStatus } from "@/utils/secure-utils";
import { canAttemptAssessment } from "@/utils/assessment-attempts";
import {
  isAssessmentAvailable,
  formatAvailabilityDate,
} from "@/utils/assessment-availability";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { assessments, loading, refetch } = useAssessments();
  const { deleteAssessment, isDeleting } = useAssessmentDeletion();
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [isStartingAssessment, setIsStartingAssessment] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    // Remover flag de avaliação em andamento ao acessar o Dashboard
    localStorage.removeItem("assessmentInProgress");

    const checkAdminStatus = async () => {
      // SEMPRE revalidar do banco de dados (não confiar no cache)
      const adminStatus = await isAdmin();
      setIsUserAdmin(adminStatus);

      // Atualizar localStorage para que outros componentes usem o valor correto
      await updateAdminStatus();

      // Forçar atualização do hook de proteção
      window.dispatchEvent(new Event("storage"));
    };

    checkAdminStatus();
  }, []);

  const handleStartAssessment = async (assessmentId: string) => {
    try {
      // Prevenir múltiplos cliques
      if (isStartingAssessment) return;
      setIsStartingAssessment(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // 1. Buscar avaliação com max_attempts e available_from
      const { data: assessment, error: assessmentError } = await supabase
        .from("assessments")
        .select("max_attempts, available_from, title")
        .eq("id", assessmentId)
        .single();

      if (assessmentError || !assessment) {
        throw new Error("Avaliação não encontrada");
      }

      // 2. Verificar disponibilidade
      if (
        assessment.available_from &&
        !isAssessmentAvailable(assessment.available_from)
      ) {
        toast({
          title: "Avaliação não disponível",
          description: `Esta avaliação estará disponível a partir de ${formatAvailabilityDate(
            assessment.available_from
          )}`,
          variant: "destructive",
        });
        setIsStartingAssessment(false);
        return;
      }

      // 3. Verificar tentativas (apenas sessões completas contam)
      const { canAttempt, currentAttempts, maxAttempts, reason } =
        await canAttemptAssessment(
          user.id,
          assessmentId,
          assessment.max_attempts
        );

      if (!canAttempt) {
        toast({
          title: "Tentativas esgotadas",
          description:
            reason ||
            `Você já realizou esta avaliação ${currentAttempts}/${maxAttempts} vezes.`,
          variant: "destructive",
        });
        setIsStartingAssessment(false);
        return;
      }

      // 4. Verificar se o usuário já tem uma sessão em andamento para esta avaliação
      const { data: existingSessions, error: checkError } = await supabase
        .from("assessment_sessions")
        .select("id, is_completed")
        .eq("assessment_id", assessmentId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (checkError) throw checkError;

      let sessionId = "";

      if (existingSessions && existingSessions.length > 0) {
        // Sessão existente
        const lastSession = existingSessions[0];

        if (!lastSession.is_completed) {
          // Continuar sessão não finalizada
          sessionId = lastSession.id;
          toast({
            title: "Continuando avaliação",
            description: "Você está retomando de onde parou.",
          });
        } else {
          // Criar uma nova sessão, pois a última foi finalizada
          const { data, error } = await supabase
            .from("assessment_sessions")
            .insert([
              {
                assessment_id: assessmentId,
                user_id: user.id,
              },
            ])
            .select("id")
            .single();

          if (error) throw error;
          sessionId = data.id;
        }
      } else {
        // Criar uma nova sessão
        const { data, error } = await supabase
          .from("assessment_sessions")
          .insert([
            {
              assessment_id: assessmentId,
              user_id: user.id,
            },
          ])
          .select("id")
          .single();

        if (error) throw error;
        sessionId = data.id;
      }

      // NÃO definir assessmentInProgress aqui - será definido no AssessmentPage
      // Isso evita o popup de beforeunload durante navegação programática

      // Navegar para a página de avaliação com timestamp para evitar cache
      console.log(
        "Navegando para:",
        `/assessment/${assessmentId}?session=${sessionId}&t=${Date.now()}`
      );
      navigate(
        `/assessment/${assessmentId}?session=${sessionId}&t=${Date.now()}`
      );
    } catch (error: any) {
      console.error("Erro ao iniciar avaliação:", error);
      toast({
        title: "Erro",
        description:
          error.message ||
          "Não foi possível iniciar a avaliação. Tente novamente.",
        variant: "destructive",
      });
      setIsStartingAssessment(false);
    }
  };

  const handleDeleteAssessment = (
    assessmentId: string,
    assessmentTitle: string
  ) => {
    setAssessmentToDelete({ id: assessmentId, title: assessmentTitle });
    setDeleteDialogOpen(true);
  };

  const handleViewResult = (assessmentId: string) => {
    navigate(`/assessment-result/${assessmentId}`);
  };

  const confirmDeleteAssessment = async () => {
    if (!assessmentToDelete) return;

    const success = await deleteAssessment(
      assessmentToDelete.id,
      assessmentToDelete.title
    );

    if (success) {
      // Recarregar lista de avaliações
      refetch();
    }

    setDeleteDialogOpen(false);
    setAssessmentToDelete(null);
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
              onClick={() => navigate("/create-assessment")}
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
          onCreateAssessment={() => navigate("/create-assessment")}
          onEditAssessment={(id) => navigate(`/edit-assessment/${id}`)}
          onDeleteAssessment={handleDeleteAssessment}
          onViewResult={handleViewResult}
        />
      </div>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir avaliação?</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a excluir a avaliação{" "}
              <strong>"{assessmentToDelete?.title}"</strong>.
              <br />
              <br />
              Esta ação é <strong>irreversível</strong> e irá remover:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>A avaliação e todas as suas questões</li>
                <li>Todas as sessões e respostas dos alunos</li>
                <li>Todos os logs de fraude associados a esta avaliação</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAssessment}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Sim, excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SecureAppShell>
  );
}
