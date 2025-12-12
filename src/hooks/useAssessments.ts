import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  getAttemptsCount,
  getIncompleteSession,
  hasCompletedAttempt,
} from "@/utils/assessment-attempts";

interface Assessment {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  created_at: string;
  max_attempts: number;
  available_from: string | null;
  // Dados adicionais para alunos
  currentAttempts?: number;
  hasIncompleteSession?: boolean;
  hasCompletedAttempt?: boolean;
}

export function useAssessments() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAssessments = async () => {
    try {
      const { data, error } = await supabase
        .from("assessments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Buscar dados do usuário atual
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setAssessments(data || []);
        return;
      }

      // Verificar se é admin
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      const isAdmin = profile?.is_admin || false;

      // Se for admin, não precisa buscar dados de tentativas
      if (isAdmin) {
        setAssessments(data || []);
        return;
      }

      // Para alunos, buscar informações de tentativas
      const assessmentsWithAttempts = await Promise.all(
        (data || []).map(async (assessment) => {
          const currentAttempts = await getAttemptsCount(
            user.id,
            assessment.id
          );
          const incompleteSession = await getIncompleteSession(
            user.id,
            assessment.id
          );
          const hasCompleted = await hasCompletedAttempt(
            user.id,
            assessment.id
          );

          return {
            ...assessment,
            currentAttempts,
            hasIncompleteSession: !!incompleteSession,
            hasCompletedAttempt: hasCompleted,
          };
        })
      );

      setAssessments(assessmentsWithAttempts);
    } catch (error: any) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description:
          "Não foi possível carregar as avaliações. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();

    // Configurar listener para atualizações em tempo real nas avaliações
    const channel = supabase
      .channel("public:assessments")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "assessments",
        },
        () => {
          // Recarregar avaliações quando houver mudanças
          fetchAssessments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  return {
    assessments,
    loading,
    refetch: fetchAssessments, // Expor função para recarregar manualmente
  };
}
