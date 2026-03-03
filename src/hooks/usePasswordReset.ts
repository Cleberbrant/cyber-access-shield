import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generateTempPassword } from "@/utils/user-utils";

/**
 * Hook para resetar senha de usuários
 */
export function usePasswordReset() {
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();

  /**
   * Reseta senha de um usuário e retorna senha temporária gerada
   */
  const resetPassword = async (
    userId: string,
    onSuccess?: (tempPassword: string) => void,
  ): Promise<string | null> => {
    try {
      setIsResetting(true);

      // Gerar senha temporária
      const { password: tempPassword } = generateTempPassword();

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

      // Chamar função RPC para resetar senha
      const { error: resetError } = await supabase.rpc("reset_user_password", {
        p_target_user_id: userId,
        p_temp_password: tempPassword,
      });

      if (resetError) {
        throw resetError;
      }

      // Registrar log de auditoria
      await supabase.from("user_management_logs").insert({
        admin_id: currentAdmin.id,
        admin_email: adminData?.email || currentAdmin.email,
        target_user_id: userId,
        target_user_email: targetUser?.email || "",
        action: "reset_password",
        old_value: null,
        new_value: null, // Não armazenar senha no log
      });

      toast({
        title: "Senha resetada",
        description: "A senha temporária foi gerada com sucesso",
      });

      if (onSuccess) onSuccess(tempPassword);
      return tempPassword;
    } catch (error: any) {
      toast({
        title: "Erro ao resetar senha",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsResetting(false);
    }
  };

  /**
   * Limpa senha temporária após usuário trocar
   */
  const clearTempPassword = async (userId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.rpc("clear_temp_password", {
        p_user_id: userId,
      });

      if (error) throw error;
      return true;
    } catch (error: any) {
      return false;
    }
  };

  return {
    resetPassword,
    clearTempPassword,
    isResetting,
  };
}
