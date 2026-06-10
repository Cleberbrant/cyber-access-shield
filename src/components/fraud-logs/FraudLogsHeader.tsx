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
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
            Logs de Fraude
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
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
