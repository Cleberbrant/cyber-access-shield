import { useEffect, useRef, useState } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

declare global {
  // eslint-disable-next-line no-var
  var turnstile: {
    render: (container: HTMLElement, options: object) => string;
    remove: (widgetId: string) => void;
    reset: (widgetId: string) => void;
  } | undefined;
}

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? "1x00000000000000000000AA";

interface TurnstileWidgetProps {
  readonly onSuccess: (token: string) => void;
  readonly onExpire: () => void;
  readonly onError: () => void;
}

export function TurnstileWidget({ onSuccess, onExpire, onError }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 100; // 10 segundos (100 × 100ms)

    function tryRender() {
      if (cancelled || !containerRef.current) return;

      if (!globalThis.turnstile) {
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(tryRender, 100);
        } else {
          setStatus("error");
          onError();
        }
        return;
      }

      if (widgetIdRef.current) return; // já renderizado

      try {
        widgetIdRef.current = globalThis.turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          theme: "auto",
          callback: (token: string) => {
            setStatus("success");
            onSuccess(token);
          },
          "expired-callback": () => {
            setStatus("idle");
            onExpire();
          },
          "error-callback": () => {
            setStatus("error");
            onError();
          },
        });
      } catch {
        setStatus("error");
        onError();
      }
    }

    tryRender();

    return () => {
      cancelled = true;
      if (widgetIdRef.current && globalThis.turnstile) {
        try { globalThis.turnstile.remove(widgetIdRef.current); } catch { /* ignorar */ }
        widgetIdRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="pt-1">
      <div ref={containerRef} style={{ minHeight: "65px" }} />
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
