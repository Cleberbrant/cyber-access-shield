import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DeleteResult {
  success: boolean;
  error?: string;
}

interface DeleteAssessmentResponse {
  success: boolean;
  deleted: boolean;
  assessment_id: string;
  logs_deleted: number;
  sessions_deleted: number;
  questions_deleted: number;
  error?: string;
}

/**
 * Hook para gerenciar a exclusão de avaliações
 *
 * Funcionalidades:
 * - Deleta avaliação e todos os dados relacionados em cascata
 * - Logs de fraude específicos da avaliação serão deletados
 * - Sessões de alunos serão deletadas
 * - Questões e respostas serão deletadas
 * - Logs gerais (assessment_id = NULL) NÃO serão afetados
 *
 * @returns Objeto com função de deleção e estados de loading/error
 */
export function useAssessmentDeletion() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  /**
   * Deleta uma avaliação e todos os dados relacionados
   * @param assessmentId - ID da avaliação a ser deletada
   * @param assessmentTitle - Título da avaliação (para exibição)
   * @returns Promise<boolean> - true se deletado com sucesso
   */
  const deleteAssessment = async (
    assessmentId: string,
    assessmentTitle: string
  ): Promise<boolean> => {
    setIsDeleting(true);
    setError(null);

    try {
      // Verificar se usuário é admin
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error("Usuário não autenticado");
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", userData.user.id)
        .single();

      if (!profile?.is_admin) {
        throw new Error("Apenas administradores podem deletar avaliações");
      }

      // Deletar a avaliação
      // O CASCADE DELETE configurado no banco irá automaticamente:
      // - Deletar logs de fraude relacionados (security_logs)
      // - Deletar sessões de alunos (assessment_sessions)
      // - Deletar questões (questions)
      // - Deletar respostas (user_answers)
      const { error: deleteError } = await supabase
        .from("assessments")
        .delete()
        .eq("id", assessmentId);

      if (deleteError) {
        throw deleteError;
      }

      // Exibir toast de sucesso
      toast({
        title: "Avaliação excluída com sucesso",
        description: `"${assessmentTitle}" foi removida junto com todos os seus dados relacionados (logs de fraude, sessões e respostas).`,
        variant: "default",
      });

      setIsDeleting(false);
      return true;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao deletar avaliação";
      setError(errorMessage);

      console.error("Erro ao deletar avaliação:", err);

      toast({
        title: "Erro ao excluir avaliação",
        description: errorMessage,
        variant: "destructive",
      });

      setIsDeleting(false);
      return false;
    }
  };

  return {
    deleteAssessment,
    isDeleting,
    error,
  };
}
