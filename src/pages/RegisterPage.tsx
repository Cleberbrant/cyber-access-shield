
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "@/components/auth-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
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
      
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <Button 
              variant="ghost"
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <Shield className="h-6 w-6 text-cyber-blue" />
              <span className="font-bold text-xl">CyberAccessShield</span>
            </Button>
            <ThemeToggle />
          </div>
        </header>
        
        <main className="flex-1">
          <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)]">
            <div className="w-full max-w-md p-4 sm:p-8">
              <AuthForm type="register" />
            </div>
          </div>
        </main>
        
        <footer className="border-t py-6">
          <div className="container">
            <p className="text-center text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} CyberAccessShield. Todos os direitos reservados.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
