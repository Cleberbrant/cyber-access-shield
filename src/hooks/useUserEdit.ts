import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserEditData } from "@/types/user";

/**
 * Hook para editar dados de outros usuários (admin editando alguém)
 */
export function useUserEdit() {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  /**
   * Atualiza dados de um usuário
   */
  const updateUser = async (
    userId: string,
    data: UserEditData,
    onSuccess?: () => void,
  ): Promise<boolean> => {
    try {
      setIsUpdating(true);

      // Buscar dados atuais do usuário
      const { data: currentUser, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (fetchError) {
        throw new Error("Usuário não encontrado");
      }

      // Buscar email do usuário
      const { data: userData } = await supabase
        .from("user_management_view")
        .select("email")
        .eq("id", userId)
        .single();

      // Buscar dados do admin atual
      const {
        data: { user: currentAdmin },
      } = await supabase.auth.getUser();
      if (!currentAdmin) throw new Error("Admin não autenticado");

      const { data: adminData } = await supabase
        .from("user_management_view")
        .select("email")
        .eq("id", currentAdmin.id)
        .single();

      // Atualizar profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update(data)
        .eq("id", userId);

      if (updateError) throw updateError;

      // Registrar logs de auditoria para cada alteração
      if (
        data.display_name !== undefined &&
        data.display_name !== currentUser.display_name
      ) {
        await supabase.from("user_management_logs").insert({
          admin_id: currentAdmin.id,
          admin_email: adminData?.email || currentAdmin.email,
          target_user_id: userId,
          target_user_email: userData?.email || "",
          action: "edit_display_name",
          old_value: { display_name: currentUser.display_name },
          new_value: { display_name: data.display_name },
        });
      }

      if (
        data.is_admin !== undefined &&
        data.is_admin !== currentUser.is_admin
      ) {
        await supabase.from("user_management_logs").insert({
          admin_id: currentAdmin.id,
          admin_email: adminData?.email || currentAdmin.email,
          target_user_id: userId,
          target_user_email: userData?.email || "",
          action: "edit_role",
          old_value: { is_admin: currentUser.is_admin },
          new_value: { is_admin: data.is_admin },
        });
      }

      toast({
        title: "Usuário atualizado",
        description: "As alterações foram salvas com sucesso",
      });

      if (onSuccess) onSuccess();
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar usuário",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateUser,
    isUpdating,
  };
}
