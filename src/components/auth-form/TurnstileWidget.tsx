import { Turnstile } from "@marsidev/react-turnstile";

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? "1x00000000000000000000AA";

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onExpire: () => void;
  onError: () => void;
}

export function TurnstileWidget({ onSuccess, onExpire, onError }: TurnstileWidgetProps) {
  return (
    <div className="flex justify-center pt-1">
      <Turnstile
        siteKey={SITE_KEY}
        onSuccess={onSuccess}
        onExpire={onExpire}
        onError={onError}
        options={{ theme: "auto", language: "pt-BR" }}
      />
    </div>
  );
}
