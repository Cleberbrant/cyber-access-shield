import { useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { CheckCircle, AlertCircle } from "lucide-react";

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? "1x00000000000000000000AA";

interface TurnstileWidgetProps {
  readonly onSuccess: (token: string) => void;
  readonly onExpire: () => void;
  readonly onError: () => void;
}

export function TurnstileWidget({ onSuccess, onExpire, onError }: TurnstileWidgetProps) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  return (
    <div className="pt-1" style={{ minHeight: "65px" }}>
      <Turnstile
        siteKey={SITE_KEY}
        onSuccess={(token) => { setStatus("success"); onSuccess(token); }}
        onExpire={() => { setStatus("idle"); onExpire(); }}
        onError={() => { setStatus("error"); onError(); }}
        injectScript={false}
        options={{ theme: "auto" }}
      />
      {status === "success" && (
        <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 px-1 mt-1">
          <CheckCircle className="h-3 w-3" />
          <span>Verificação concluída</span>
        </div>
      )}
      {status === "error" && (
        <div className="flex items-center gap-2 text-xs text-destructive px-1 mt-1">
          <AlertCircle className="h-3 w-3" />
          <span>Erro na verificação. Recarregue a página.</span>
        </div>
      )}
    </div>
  );
}
