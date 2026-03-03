import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SelfEditData } from "@/types/user";
import { validatePassword, validateDisplayName } from "@/utils/user-utils";

/**
 * Hook para editar própria conta (admin editando a si mesmo)
 */
export function useSelfEdit() {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  /**
   * Atualiza dados da própria conta
   */
  const updateSelf = async (
    data: SelfEditData,
    onSuccess?: () => void,
  ): Promise<boolean> => {
    try {
      setIsUpdating(true);

      // Buscar usuário atual
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Buscar dados atuais do profile
      const { data: currentProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (fetchError) throw fetchError;

      // Validar display_name
      const nameValidation = validateDisplayName(data.display_name);
      if (!nameValidation.isValid) {
        toast({
          title: "Erro de validação",
          description: nameValidation.error,
          variant: "destructive",
        });
        return false;
      }

      // Se estiver mudando senha
      if (data.new_password) {
        // Validar senhas
        if (!data.current_password) {
          toast({
            title: "Erro de validação",
            description: "Senha atual é obrigatória",
            variant: "destructive",
          });
          return false;
        }

        if (data.new_password !== data.confirm_password) {
          toast({
            title: "Erro de validação",
            description: "As senhas não coincidem",
            variant: "destructive",
          });
          return false;
        }

        const passwordValidation = validatePassword(data.new_password);
        if (!passwordValidation.isValid) {
          toast({
            title: "Senha fraca",
            description: passwordValidation.errors.join(", "),
            variant: "destructive",
          });
          return false;
        }

        // Chamar função RPC para mudar senha (valida senha atual)
        const { error: passwordError } = await supabase.rpc(
          "change_own_password",
          {
            p_current_password: data.current_password,
            p_new_password: data.new_password,
          },
        );

        if (passwordError) {
          if (passwordError.message.includes("incorreta")) {
            toast({
              title: "Senha incorreta",
              description: "A senha atual está incorreta",
              variant: "destructive",
            });
          } else {
            throw passwordError;
          }
          return false;
        }

        // Log de mudança de senha própria
        await supabase.from("user_management_logs").insert({
          admin_id: user.id,
          admin_email: user.email || "",
          target_user_id: user.id,
          target_user_email: user.email || "",
          action: "self_password_change",
          old_value: null,
          new_value: null,
        });
      }

      // Atualizar display_name se mudou
      if (data.display_name !== currentProfile.display_name) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ display_name: data.display_name })
          .eq("id", user.id);

        if (updateError) throw updateError;

        // Log de mudança de display_name próprio
        await supabase.from("user_management_logs").insert({
          admin_id: user.id,
          admin_email: user.email || "",
          target_user_id: user.id,
          target_user_email: user.email || "",
          action: "self_display_name_change",
          old_value: { display_name: currentProfile.display_name },
          new_value: { display_name: data.display_name },
        });
      }

      toast({
        title: "Conta atualizada",
        description: "Suas alterações foram salvas com sucesso",
      });

      if (onSuccess) onSuccess();
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar conta",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateSelf,
    isUpdating,
  };
}
