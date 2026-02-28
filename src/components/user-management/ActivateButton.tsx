import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { useUserActivation } from "@/hooks/useUserActivation";

interface ActivateButtonProps {
  userId: string;
  userEmail: string;
  onSuccess: () => void;
}

export function ActivateButton({
  userId,
  userEmail,
  onSuccess,
}: ActivateButtonProps) {
  const { activateUser, isToggling } = useUserActivation();

  const handleActivate = async () => {
    await activateUser(userId, onSuccess);
  };

  return (
    <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-amber-900 dark:text-amber-100">
              Esta conta está INATIVA
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              {userEmail}
            </p>
          </div>
          <Button
            onClick={handleActivate}
            disabled={isToggling}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {isToggling ? "Reativando..." : "Reativar Conta"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
