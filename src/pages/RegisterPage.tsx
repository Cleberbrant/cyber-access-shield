
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthForm } from "@/components/auth-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/brand/Logo";
import { ArrowLeft, CheckCircle, Lock, Shield } from "lucide-react";
import { ensureJavaScriptEnabled } from "@/utils/secure-utils";
import { supabase } from "@/integrations/supabase/client";

export default function RegisterPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se o JavaScript está habilitado
    ensureJavaScriptEnabled();

    // Verificar se o usuário já está autenticado usando Supabase
    const checkAuthStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };

    checkAuthStatus();
  }, [navigate]);

  return (
    <>
      {/* Aviso para quando JavaScript está desabilitado */}
      <noscript>
        <div
          id="js-disabled-warning"
          className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4"
        >
          <div className="bg-card p-6 rounded-lg border shadow-lg max-w-md w-full">
            <div className="text-destructive mb-4 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-center mb-4">JavaScript Desabilitado</h2>
            <p className="text-center mb-6">
              Esta plataforma requer JavaScript para funcionar. Por favor, habilite o JavaScript no seu navegador e recarregue a página.
            </p>
          </div>
        </div>
      </noscript>

      <div className="min-h-screen bg-background lg:grid lg:grid-cols-2">
        {/* Painel de marca (somente desktop) */}
        <div className="relative hidden lg:flex flex-col justify-between overflow-hidden border-r border-border bg-background p-12">
          <div className="absolute inset-0 grid-pattern" aria-hidden="true" />
          <div className="absolute -top-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-primary/15 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-accent/15 blur-3xl" aria-hidden="true" />

          <div className="relative z-10">
            <Logo size={32} />
          </div>

          <div className="relative z-10 max-w-md space-y-8 animate-fade-in-up">
            <h1 className="text-3xl font-display font-bold leading-tight tracking-tight">
              Plataforma de avaliação segura para ambientes EAD
            </h1>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-muted-foreground">
                <CheckCircle className="h-5 w-5 shrink-0 text-primary" />
                <span>Ambiente anti-fraude monitorado</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Shield className="h-5 w-5 shrink-0 text-primary" />
                <span>Bloqueio de DevTools e capturas</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Lock className="h-5 w-5 shrink-0 text-primary" />
                <span>Modo desktop com kiosk total</span>
              </li>
            </ul>
          </div>

          <p className="relative z-10 text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} CyberAccessShield. Todos os direitos reservados.
          </p>
        </div>

        {/* Coluna do formulário */}
        <div className="flex min-h-screen flex-col">
          <div className="flex items-center justify-between p-4 sm:p-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao início
            </Link>
            <ThemeToggle />
          </div>

          <main className="flex flex-1 items-center justify-center p-4 sm:p-8">
            <div className="w-full max-w-md animate-fade-in-up">
              <div className="mb-8 flex justify-center lg:hidden">
                <Logo size={28} />
              </div>
              <AuthForm type="register" />
            </div>
          </main>

          <footer className="p-4 sm:p-6 lg:hidden">
            <p className="text-center text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} CyberAccessShield. Todos os direitos reservados.
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
