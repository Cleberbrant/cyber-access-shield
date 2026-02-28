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
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { User } from "@/types/user";
import { useSelfEdit } from "@/hooks/useSelfEdit";

interface SelfEditDialogProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SelfEditDialog({
  user,
  open,
  onClose,
  onSuccess,
}: SelfEditDialogProps) {
  const [displayName, setDisplayName] = useState("");
  const [changePassword, setChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const { updateSelf, isUpdating } = useSelfEdit();

  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || "");
      setChangePassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [user, open]);

  if (!user) return null;

  const handleSave = async () => {
    const success = await updateSelf(
      {
        display_name: displayName,
        current_password: changePassword ? currentPassword : undefined,
        new_password: changePassword ? newPassword : undefined,
        confirm_password: changePassword ? confirmPassword : undefined,
      },
      () => {
        onSuccess();
        onClose();
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Minha Conta</DialogTitle>
          <DialogDescription>
            Atualize suas informações pessoais
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
            <Label htmlFor="self_display_name">Nome de Exibição</Label>
            <Input
              id="self_display_name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Seu nome completo"
            />
          </div>

          {/* Tipo (readonly) */}
          <div className="space-y-2">
            <Label>Tipo de Conta</Label>
            <Input value="Administrador" disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">
              Você não pode alterar o tipo da sua própria conta
            </p>
          </div>

          {/* Alterar Senha */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="change_password"
                checked={changePassword}
                onCheckedChange={(checked) =>
                  setChangePassword(checked as boolean)
                }
              />
              <Label
                htmlFor="change_password"
                className="font-normal cursor-pointer"
              >
                Alterar minha senha
              </Label>
            </div>

            {changePassword && (
              <div className="space-y-3 pl-6">
                {/* Senha Atual */}
                <div className="space-y-2">
                  <Label htmlFor="current_password">Senha Atual *</Label>
                  <div className="relative">
                    <Input
                      id="current_password"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Digite sua senha atual"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Nova Senha */}
                <div className="space-y-2">
                  <Label htmlFor="new_password">Nova Senha *</Label>
                  <div className="relative">
                    <Input
                      id="new_password"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Digite sua nova senha"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Confirmar Senha */}
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirmar Senha *</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme sua nova senha"
                  />
                </div>

                <p className="text-xs text-muted-foreground">
                  A senha deve ter no mínimo 8 caracteres, incluindo maiúsculas,
                  minúsculas, números e caracteres especiais.
                </p>
              </div>
            )}
          </div>
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
  );
}
