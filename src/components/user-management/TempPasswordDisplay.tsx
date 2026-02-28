import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Copy, Check } from "lucide-react";
import { useState } from "react";
import {
  formatDate,
  copyToClipboard,
  isTempPasswordExpired,
} from "@/utils/user-utils";

interface TempPasswordDisplayProps {
  tempPassword: string;
  createdAt: string;
}

export function TempPasswordDisplay({
  tempPassword,
  createdAt,
}: TempPasswordDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(tempPassword);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isExpired = isTempPasswordExpired(createdAt);

  return (
    <Alert variant={isExpired ? "destructive" : "default"} className="mt-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Senha Temporária:</span>
            {isExpired && <Badge variant="destructive">Expirada</Badge>}
          </div>

          <div className="flex items-center gap-2">
            <code className="flex-1 bg-muted px-3 py-2 rounded font-mono text-sm">
              {tempPassword}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copiar
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Resetada em: {formatDate(createdAt)}
          </p>

          {!isExpired && (
            <p className="text-xs text-muted-foreground">
              ⚠️ Esta senha é visível até o usuário trocá-la
            </p>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
