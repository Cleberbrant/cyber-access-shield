
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/brand/Logo";

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
}, [location.pathname]);

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-background">
      <div className="absolute inset-0 grid-pattern" aria-hidden="true" />
      <div className="absolute -top-40 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-accent/15 blur-3xl" aria-hidden="true" />

      <header className="relative z-10 flex items-center justify-between p-4 sm:p-6">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
          aria-label="Voltar para a página inicial"
        >
          <LogoMark size={28} />
        </button>
        <ThemeToggle />
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4">
        <div className="max-w-lg space-y-6 text-center animate-fade-in-up">
          <div className="flex justify-center">
            <LogoMark size={40} />
          </div>
          <p className="text-8xl font-display font-bold leading-none cyber-text-gradient">
            404
          </p>
          <h1 className="text-3xl font-display font-bold tracking-tight">
            Página não encontrada
          </h1>
          <p className="text-lg text-muted-foreground">
            A página que você está procurando não existe ou foi movida.
          </p>
          <div className="pt-4">
            <Button
              onClick={() => navigate("/")}
              className="bg-gradient-brand text-primary-foreground glow-primary hover:opacity-90 transition-opacity"
            >
              Voltar para a página inicial
            </Button>
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-6">
        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} CyberAccessShield. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
};

export default NotFound;
