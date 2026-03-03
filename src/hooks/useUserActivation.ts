import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook para ativar/desativar usuários
 */
export function useUserActivation() {
  const [isToggling, setIsToggling] = useState(false);
  const { toast } = useToast();

  /**
   * Desativa uma conta de usuário
   */
  const deactivateUser = async (
    userId: string,
    onSuccess?: () => void,
  ): Promise<boolean> => {
    try {
      setIsToggling(true);

      // Buscar dados do usuário alvo
      const { data: targetUser } = await supabase
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
        .update({ is_active: false })
        .eq("id", userId);

      if (updateError) throw updateError;

      // Registrar log de auditoria
      await supabase.from("user_management_logs").insert({
        admin_id: currentAdmin.id,
        admin_email: adminData?.email || currentAdmin.email,
        target_user_id: userId,
        target_user_email: targetUser?.email || "",
        action: "deactivate",
        old_value: { is_active: true },
        new_value: { is_active: false },
      });

      toast({
        title: "Conta desativada",
        description: "O usuário não poderá mais fazer login",
      });

      if (onSuccess) onSuccess();
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao desativar conta",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsToggling(false);
    }
  };

  /**
   * Reativa uma conta de usuário
   */
  const activateUser = async (
    userId: string,
    onSuccess?: () => void,
  ): Promise<boolean> => {
    try {
      setIsToggling(true);

      // Buscar dados do usuário alvo
      const { data: targetUser } = await supabase
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
        .update({ is_active: true })
        .eq("id", userId);

      if (updateError) throw updateError;

      // Registrar log de auditoria
      await supabase.from("user_management_logs").insert({
        admin_id: currentAdmin.id,
        admin_email: adminData?.email || currentAdmin.email,
        target_user_id: userId,
        target_user_email: targetUser?.email || "",
        action: "activate",
        old_value: { is_active: false },
        new_value: { is_active: true },
      });

      toast({
        title: "Conta reativada",
        description: "O usuário pode fazer login novamente",
      });

      if (onSuccess) onSuccess();
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao reativar conta",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsToggling(false);
    }
  };

  return {
    deactivateUser,
    activateUser,
    isToggling,
  };
}
