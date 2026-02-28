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

interface RoleChangeConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userEmail: string;
  oldRole: boolean;
  newRole: boolean;
  isUpdating: boolean;
}

export function RoleChangeConfirm({
  open,
  onClose,
  onConfirm,
  userEmail,
  oldRole,
  newRole,
  isUpdating,
}: RoleChangeConfirmProps) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>⚠️ Alterar Tipo de Conta?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Usuário:{" "}
              <span className="font-semibold text-foreground">{userEmail}</span>
            </p>

            <p className="text-foreground">
              De:{" "}
              <span className="font-semibold">
                {oldRole ? "Administrador" : "Aluno"}
              </span>
              {" → "}
              Para:{" "}
              <span className="font-semibold">
                {newRole ? "Administrador" : "Aluno"}
              </span>
            </p>

            {newRole && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                ⚠️ Administradores têm acesso total ao sistema, incluindo
                gerenciamento de usuários e visualização de logs de fraude.
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isUpdating}>
            {isUpdating ? "Salvando..." : "Confirmar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
