import { Monitor } from "lucide-react";

const MOBILE_UA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  return MOBILE_UA.test(navigator.userAgent) || window.innerWidth < 768;
}

interface MobileBlockProps {
  children: React.ReactNode;
}

export function MobileBlock({ children }: MobileBlockProps) {
  if (isMobileDevice()) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-8 text-center">
        <Monitor className="h-16 w-16 text-muted-foreground mb-6" />
        <h1 className="text-2xl font-bold mb-3">Acesso restrito a computadores</h1>
        <p className="text-muted-foreground max-w-sm">
          Esta plataforma foi desenvolvida para ambientes avaliativos seguros e está
          disponível apenas em computadores e notebooks.
        </p>
        <p className="text-sm text-muted-foreground mt-4">
          Por favor, acesse por um dispositivo desktop.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
