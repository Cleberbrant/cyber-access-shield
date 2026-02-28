import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";
import { User, UserEditData } from "@/types/user";
import { TempPasswordDisplay } from "./TempPasswordDisplay";
import { useUserEdit } from "@/hooks/useUserEdit";
import { usePasswordReset } from "@/hooks/usePasswordReset";
import { useUserActivation } from "@/hooks/useUserActivation";
import { useState as useResetState } from "react";
import { PasswordResetConfirm } from "./PasswordResetConfirm";
import { RoleChangeConfirm } from "./RoleChangeConfirm";
import { DeactivateConfirm } from "./DeactivateConfirm";

interface UserEditDialogProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UserEditDialog({
  user,
  open,
  onClose,
  onSuccess,
}: UserEditDialogProps) {
  const [displayName, setDisplayName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showRoleConfirm, setShowRoleConfirm] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [tempPassword, setTempPassword] = useState("");

  const { updateUser, isUpdating } = useUserEdit();
  const { resetPassword, isResetting } = usePasswordReset();
  const { deactivateUser, isToggling } = useUserActivation();

  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || "");
      setIsAdmin(user.is_admin);
    }
  }, [user]);

  if (!user) return null;

  const handleSave = async () => {
    // Se mudou o tipo de conta, mostrar confirmação
    if (isAdmin !== user.is_admin) {
      setShowRoleConfirm(true);
      return;
    }

    // Salvar alterações
    const data: UserEditData = {
      display_name: displayName,
    };

    const success = await updateUser(user.id, data, () => {
      onSuccess();
      onClose();
    });
  };

  const handleRoleChangeConfirm = async () => {
    const data: UserEditData = {
      display_name: displayName,
      is_admin: isAdmin,
    };

    const success = await updateUser(user.id, data, () => {
      setShowRoleConfirm(false);
      onSuccess();
      onClose();
    });
  };

  const handleResetPassword = async () => {
    const password = await resetPassword(user.id, (tempPass) => {
      setTempPassword(tempPass);
      setShowResetConfirm(false);
      onSuccess();
    });
  };

  const handleDeactivate = async () => {
    await deactivateUser(user.id, () => {
      setShowDeactivateConfirm(false);
      onSuccess();
      onClose();
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Altere as informações do usuário
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Email (readonly) */}
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user.email} disabled className="bg-muted" />
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="display_name">Nome de Exibição</Label>
              <Input
                id="display_name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nome completo"
              />
            </div>

            {/* Tipo de Conta */}
            <div className="space-y-2">
              <Label>Tipo de Conta</Label>
              <RadioGroup
                value={isAdmin ? "admin" : "student"}
                onValueChange={(value) => setIsAdmin(value === "admin")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="student" id="student" />
                  <Label
                    htmlFor="student"
                    className="font-normal cursor-pointer"
                  >
                    Aluno
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="admin" id="admin" />
                  <Label htmlFor="admin" className="font-normal cursor-pointer">
                    Administrador
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Senha Temporária (se existe) */}
            {user.temp_password && user.temp_password_created_at && (
              <TempPasswordDisplay
                tempPassword={user.temp_password}
                createdAt={user.temp_password_created_at}
              />
            )}

            {/* Botão Resetar Senha */}
            <div className="pt-4 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowResetConfirm(true)}
                disabled={isResetting}
              >
                {isResetting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Resetar Senha
              </Button>
            </div>

            {/* Botão Desativar */}
            {user.is_active && (
              <div>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setShowDeactivateConfirm(true)}
                  disabled={isToggling}
                >
                  {isToggling && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Desativar Conta
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogs de Confirmação */}
      <PasswordResetConfirm
        open={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleResetPassword}
        userEmail={user.email}
        isResetting={isResetting}
        tempPassword={tempPassword}
      />

      <RoleChangeConfirm
        open={showRoleConfirm}
        onClose={() => setShowRoleConfirm(false)}
        onConfirm={handleRoleChangeConfirm}
        userEmail={user.email}
        oldRole={user.is_admin}
        newRole={isAdmin}
        isUpdating={isUpdating}
      />

      <DeactivateConfirm
        open={showDeactivateConfirm}
        onClose={() => setShowDeactivateConfirm(false)}
        onConfirm={handleDeactivate}
        userEmail={user.email}
        isDeactivating={isToggling}
      />
    </>
  );
}
