import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserStats } from "@/types/user";

/**
 * Hook para buscar estatísticas de usuários
 */
export function useUserStats() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Chamar função RPC do Supabase
      const { data, error } = await supabase.rpc("get_user_stats");

      if (error) {
        console.error("Erro ao buscar estatísticas:", error);
        toast({
          title: "Erro ao carregar estatísticas",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data && data.length > 0) {
        const statsData = data[0];
        setStats({
          total: Number(statsData.total),
          admins: Number(statsData.admins),
          students: Number(statsData.students),
          inactive: Number(statsData.inactive),
        });
      }
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      toast({
        title: "Erro ao carregar estatísticas",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const refetch = () => {
    fetchStats();
  };

  return {
    stats,
    loading,
    refetch,
  };
}
