import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  UserManagementLog,
  AuditLogFilter,
  AuditLogSearchParams,
  AuditLogsPaginatedResult,
} from "@/types/user";

/**
 * Hook para buscar logs de auditoria de gerenciamento de usuários
 */
export function useAuditLogs(params: AuditLogSearchParams) {
  const [logs, setLogs] = useState<UserManagementLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const { filter, searchQuery, page, pageSize } = params;

  const fetchLogs = async () => {
    try {
      setLoading(true);

      // Montar query base
      let query = supabase
        .from("user_management_logs")
        .select("*", { count: "exact" });

      // Aplicar filtros de ação
      if (filter === "edit_role") {
        query = query.eq("action", "edit_role");
      } else if (filter === "reset_password") {
        query = query.in("action", ["reset_password", "self_password_change"]);
      } else if (filter === "activation") {
        query = query.in("action", ["activate", "deactivate"]);
      }

      // Aplicar busca por email do usuário alvo
      if (searchQuery && searchQuery.trim()) {
        query = query.ilike("target_user_email", `%${searchQuery.trim()}%`);
      }

      // Aplicar paginação
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      // Ordenar por data (mais recentes primeiro)
      query = query.order("created_at", { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        console.error("Erro ao buscar logs:", error);
        toast({
          title: "Erro ao carregar histórico",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setLogs(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Erro ao buscar logs:", error);
      toast({
        title: "Erro ao carregar histórico",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filter, searchQuery, page, pageSize]);

  const refetch = () => {
    fetchLogs();
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const result: AuditLogsPaginatedResult = {
    logs,
    totalCount,
    totalPages,
    currentPage: page,
  };

  return {
    ...result,
    loading,
    refetch,
  };
}
