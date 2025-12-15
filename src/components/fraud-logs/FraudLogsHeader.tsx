import { Shield, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FraudLogsHeaderProps {
  onRefresh: () => void;
  isLoading?: boolean;
}

export function FraudLogsHeader({
  onRefresh,
  isLoading,
}: FraudLogsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
      <div className="flex items-center gap-3">
        <div className="rounded-full w-12 h-12 flex items-center justify-center bg-gradient-to-r from-cyber-blue to-cyber-teal">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Logs de Fraude</h1>
          <p className="text-muted-foreground mt-1">
            Monitore e analise tentativas de violação de segurança
          </p>
        </div>
      </div>

      <Button
        variant="outline"
        onClick={onRefresh}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        Atualizar
      </Button>
    </div>
  );
}
