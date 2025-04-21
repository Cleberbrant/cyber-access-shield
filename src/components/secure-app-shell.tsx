
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { enableAssessmentProtection, disableAssessmentProtection } from "@/utils/secure-utils";

interface SecureAppShellProps {
  children: React.ReactNode;
}

export function SecureAppShell({ children }: SecureAppShellProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<{ email: string; isAdmin: boolean } | null>(null);
  
  // Verificar autenticação
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }
      
      // Buscar informações do perfil
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name, is_admin')
        .eq('id', session.user.id)
        .single();
      
      if (error || !profile) {
        console.error("Erro ao buscar perfil:", error);
        return;
      }
      
      setUser({
        email: session.user.email || '',
        isAdmin: profile.is_admin
      });
    };
    
    checkAuth();
    
    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/login");
      }
    });
    
    // Esta função previne que o usuário saia da tela durante uma avaliação
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const isAssessmentInProgress = localStorage.getItem("assessmentInProgress");
      if (isAssessmentInProgress === "true") {
        e.preventDefault();
        e.returnValue = "Você tem uma avaliação em andamento. Sair desta página pode resultar em perda de progresso.";
        return e.returnValue;
      }
    };
    
    window.addEventListener("beforeunload", handleBeforeUnload);
    
    return () => {
      subscription.unsubscribe();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [navigate]);
  
  // Esta função previne atalhos de teclado comuns usados para trapacear
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isAssessmentInProgress = localStorage.getItem("assessmentInProgress") === "true";
      
      if (isAssessmentInProgress) {
        // Previne Ctrl+C, Ctrl+V, Ctrl+X, PrintScreen, etc.
        if ((e.ctrlKey || e.metaKey) && 
            (e.key === "c" || e.key === "v" || e.key === "x" || 
             e.key === "p" || e.key === "s" || e.key === "a")) {
          e.preventDefault();
          toast({
            title: "Ação Bloqueada",
            description: "Atalhos de teclado estão desativados durante a avaliação.",
            variant: "destructive"
          });
          return false;
        }
        
        // Previne Alt+Tab
        if (e.altKey && e.key === "Tab") {
          e.preventDefault();
          toast({
            title: "Ação Bloqueada",
            description: "Alternar janelas não é permitido durante a avaliação.",
            variant: "destructive"
          });
          return false;
        }
        
        // Previne F12 (DevTools)
        if (e.key === "F12") {
          e.preventDefault();
          toast({
            title: "Ação Bloqueada",
            description: "Ferramentas de desenvolvedor não são permitidas durante a avaliação.",
            variant: "destructive"
          });
          return false;
        }
      }
    };
    
    // Esta função mantém o mouse dentro da janela durante uma avaliação
    const handleMouseLeave = (e: MouseEvent) => {
      const isAssessmentInProgress = localStorage.getItem("assessmentInProgress") === "true";
      
      if (isAssessmentInProgress && e.clientY <= 0) {
        toast({
          title: "Ação Bloqueada",
          description: "Por favor, mantenha o foco na avaliação.",
          variant: "destructive"
        });
      }
    };
    
    // Prevenindo clique direito e menu de contexto
    const handleContextMenu = (e: MouseEvent) => {
      const isAssessmentInProgress = localStorage.getItem("assessmentInProgress") === "true";
      
      if (isAssessmentInProgress) {
        e.preventDefault();
        toast({
          title: "Ação Bloqueada",
          description: "Menu de contexto está desativado durante a avaliação.",
          variant: "destructive"
        });
        return false;
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("contextmenu", handleContextMenu);
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [toast]);
  
  const handleLogout = async () => {
    const isAssessmentInProgress = localStorage.getItem("assessmentInProgress") === "true";
    
    if (isAssessmentInProgress) {
      toast({
        title: "Avaliação em andamento",
        description: "Você não pode sair enquanto uma avaliação está em andamento.",
        variant: "destructive"
      });
      return;
    }
    
    // Desabilitar proteções caso estejam ativas
    disableAssessmentProtection();
    
    // Fazer logout do Supabase
    await supabase.auth.signOut();
    navigate("/login");
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">CyberAssessShield</span>
          </div>
          
          <div className="flex items-center gap-4">
            {user && (
              <span className="text-sm text-muted-foreground">
                {user.isAdmin ? "Administrador" : "Aluno"}: {user.email}
              </span>
            )}
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Sair</span>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        {children}
      </main>
      
      <footer className="border-t py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} CyberAssessShield. Todos os direitos reservados.
          </p>
          <p className="text-xs text-muted-foreground">
            Plataforma de avaliação segura para ambientes EAD
          </p>
        </div>
      </footer>
    </div>
  );
}
