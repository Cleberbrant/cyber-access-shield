import { useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Logo } from "@/components/brand/Logo";
import { UserSession } from "@/hooks/useSessionCheck";

interface HeaderProps {
  user: UserSession | null;
  onLogout: () => void;
  /** "topbar" = dentro do shell com sidebar; "focus" = modo prova, sem sidebar */
  variant?: "topbar" | "focus";
}

const PAGE_TITLES: Array<[string, string]> = [
  ["/dashboard", "Dashboard"],
  ["/create-assessment", "Criar Avaliação"],
  ["/edit-assessment", "Editar Avaliação"],
  ["/user-management", "Usuários"],
  ["/fraud-logs", "Logs de Fraude"],
  ["/assessment-result", "Resultado"],
  ["/assessment", "Avaliação"],
];

export function Header({ user, onLogout, variant = "topbar" }: HeaderProps) {
  const location = useLocation();
  const title =
    PAGE_TITLES.find(([prefix]) => location.pathname.startsWith(prefix))?.[1] ??
    "";

  if (variant === "focus") {
    // Modo prova: barra mínima, sem navegação, sem distração
    return (
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="flex h-14 items-center justify-between px-4">
          <Logo size={24} />
          {user && (
            <span className="text-sm text-muted-foreground">{user.email}</span>
          )}
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <h1 className="font-display text-sm font-semibold text-foreground">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {user.email}
            </span>
          )}
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={onLogout}>
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
