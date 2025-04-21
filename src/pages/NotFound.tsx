
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: Tentativa de acesso a rota inexistente:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Button 
            variant="ghost"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <Shield className="h-6 w-6 text-cyber-blue" />
            <span className="font-bold text-xl">CyberAssessShield</span>
          </Button>
          <ThemeToggle />
        </div>
      </header>
    
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-lg px-4">
          <div className="flex items-center justify-center w-28 h-28 mx-auto rounded-full bg-muted-foreground/10">
            <span className="text-7xl">404</span>
          </div>
          <h1 className="text-4xl font-bold cyber-text-gradient">Página não encontrada</h1>
          <p className="text-xl text-muted-foreground">
            A página que você está procurando não existe ou foi movida.
          </p>
          <div className="pt-6">
            <Button 
              onClick={() => navigate("/")}
              className="cyber-button"
            >
              Voltar para a página inicial
            </Button>
          </div>
        </div>
      </main>
      
      <footer className="border-t py-6">
        <div className="container">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} CyberAssessShield. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default NotFound;
