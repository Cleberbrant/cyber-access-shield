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

interface DeactivateConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userEmail: string;
  isDeactivating: boolean;
}

export function DeactivateConfirm({
  open,
  onClose,
  onConfirm,
  userEmail,
  isDeactivating,
}: DeactivateConfirmProps) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>⚠️ Desativar Conta?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>Você está prestes a desativar a conta:</p>
            <p className="font-semibold text-foreground">{userEmail}</p>

            <div className="space-y-2">
              <p>O usuário não poderá mais fazer login.</p>
              <p className="text-sm">
                Você pode reativar a conta depois na aba "Inativos".
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeactivating}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeactivating ? "Desativando..." : "Desativar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
