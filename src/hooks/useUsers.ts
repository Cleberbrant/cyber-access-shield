import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  UserFilter,
  UserSearchParams,
  UsersPaginatedResult,
} from "@/types/user";

/**
 * Hook para buscar e gerenciar lista de usuários
 * Suporta filtros, busca e paginação
 */
export function useUsers(params: UserSearchParams) {
  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const { filter, searchQuery, page, pageSize } = params;

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Montar query base
      let query = supabase
        .from("user_management_view")
        .select("*", { count: "exact" });

      // Aplicar filtros
      if (filter === "admins") {
        query = query.eq("is_admin", true).eq("is_active", true);
      } else if (filter === "students") {
        query = query.eq("is_admin", false).eq("is_active", true);
      } else if (filter === "inactive") {
        query = query.eq("is_active", false);
      } else if (filter === "all") {
        query = query.eq("is_active", true);
      }

      // Aplicar busca por email
      if (searchQuery && searchQuery.trim()) {
        query = query.ilike("email", `%${searchQuery.trim()}%`);
      }

      // Aplicar paginação
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      // Ordenar por data de criação (mais recentes primeiro)
      query = query.order("created_at", { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        toast({
          title: "Erro ao carregar usuários",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setUsers(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      toast({
        title: "Erro ao carregar usuários",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filter, searchQuery, page, pageSize]);

  const refetch = () => {
    fetchUsers();
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const result: UsersPaginatedResult = {
    users,
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
