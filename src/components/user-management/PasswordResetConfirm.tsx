import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { copyToClipboard } from "@/utils/user-utils";

interface PasswordResetConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userEmail: string;
  isResetting: boolean;
  tempPassword?: string;
}

export function PasswordResetConfirm({
  open,
  onClose,
  onConfirm,
  userEmail,
  isResetting,
  tempPassword,
}: PasswordResetConfirmProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (tempPassword) {
      const success = await copyToClipboard(tempPassword);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>⚠️ Resetar Senha?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>Você está prestes a resetar a senha de:</p>
            <p className="font-semibold text-foreground">{userEmail}</p>

            {tempPassword && (
              <div className="space-y-2 pt-2">
                <p className="font-medium text-foreground">
                  Senha temporária gerada:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-muted px-3 py-2 rounded font-mono text-sm">
                    {tempPassword}
                  </code>
                  <Button size="sm" variant="outline" onClick={handleCopy}>
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-sm">⚠️ Informe esta senha ao usuário</p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isResetting}>
            {isResetting ? "Resetando..." : "Confirmar Reset"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
