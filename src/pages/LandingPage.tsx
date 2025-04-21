
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Shield, Book, Lock, Check, User } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-cyber-blue" />
            <span className="font-bold text-xl">CyberAssessShield</span>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6">
              <a 
                href="#features"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Recursos
              </a>
              <a 
                href="#security"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Segurança
              </a>
              <a 
                href="#about"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Sobre
              </a>
            </nav>
            <ThemeToggle />
            <Button 
              variant="default" 
              onClick={() => navigate("/login")}
              className="cyber-button"
            >
              Login
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32 lg:py-40">
          <div className="absolute inset-0 bg-gradient-to-br from-cyber-blue/10 via-transparent to-cyber-teal/10 dark:from-cyber-blue/5 dark:to-cyber-teal/5" />
          <div className="container relative z-10">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none cyber-text-gradient">
                    Avaliações EAD com segurança de nível empresarial
                  </h1>
                  <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                    Proteja a integridade de suas avaliações online com tecnologia de ponta contra fraudes acadêmicas
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    onClick={() => navigate("/register")}
                    className="cyber-button"
                  >
                    Começar agora
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => navigate("/login")}
                  >
                    Já tenho uma conta
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full aspect-square md:aspect-[4/3] overflow-hidden rounded-lg border secure-element">
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cyber-blue/20 to-cyber-teal/20 backdrop-blur-sm">
                    <Shield className="w-32 h-32 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 bg-secondary/50">
          <div className="container">
            <div className="flex flex-col items-center justify-center text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl cyber-text-gradient">
                Recursos de Segurança Avançados
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-4">
                Nossa plataforma utiliza técnicas de segurança cibernética para garantir avaliações confiáveis
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="bg-card rounded-lg shadow-lg p-6 border border-border hover:border-primary/50 transition-all">
                <div className="mb-4 rounded-full w-12 h-12 flex items-center justify-center bg-primary/10">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Controle de Interface</h3>
                <p className="text-muted-foreground">Impede que o mouse saia da tela de avaliação, mantendo o foco no teste.</p>
              </div>
              
              {/* Feature 2 */}
              <div className="bg-card rounded-lg shadow-lg p-6 border border-border hover:border-primary/50 transition-all">
                <div className="mb-4 rounded-full w-12 h-12 flex items-center justify-center bg-primary/10">
                  <Book className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Bloqueio de Atalhos</h3>
                <p className="text-muted-foreground">Desativa atalhos problemáticos como Ctrl+C e Ctrl+V durante a avaliação.</p>
              </div>
              
              {/* Feature 3 */}
              <div className="bg-card rounded-lg shadow-lg p-6 border border-border hover:border-primary/50 transition-all">
                <div className="mb-4 rounded-full w-12 h-12 flex items-center justify-center bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Autenticação Segura</h3>
                <p className="text-muted-foreground">Sistema robusto de login com validações avançadas de segurança.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section id="security" className="py-20">
          <div className="container">
            <div className="grid gap-12 lg:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl cyber-text-gradient">
                  Segurança em Primeiro Lugar
                </h2>
                <ul className="space-y-4">
                  <li className="flex items-start gap-2">
                    <Check className="h-6 w-6 text-cyber-teal shrink-0 mt-0.5" />
                    <span>Prevenção contra manipulação com ferramentas de desenvolvedor</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-6 w-6 text-cyber-teal shrink-0 mt-0.5" />
                    <span>Proteção contra capturas de tela e impressões não autorizadas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-6 w-6 text-cyber-teal shrink-0 mt-0.5" />
                    <span>Sanitização de entradas para prevenir ataques de injeção</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-6 w-6 text-cyber-teal shrink-0 mt-0.5" />
                    <span>Detecção de tentativas de sair da tela de avaliação</span>
                  </li>
                </ul>
              </div>
              <div className="flex items-center justify-center">
                <div className="cyber-glass w-full max-w-md p-6 rounded-lg">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">Medidas de Segurança</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Proteção contra cópia</span>
                        <span className="text-cyber-teal">Ativo</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-gradient-to-r from-cyber-blue to-cyber-teal w-full"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Controle de navegação</span>
                        <span className="text-cyber-teal">Ativo</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-gradient-to-r from-cyber-blue to-cyber-teal w-full"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Autenticação segura</span>
                        <span className="text-cyber-teal">Ativo</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-gradient-to-r from-cyber-blue to-cyber-teal w-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 bg-secondary/50">
          <div className="container">
            <div className="flex flex-col items-center text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl cyber-text-gradient">
                Sobre o Projeto
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-4">
                CyberAssessShield foi desenvolvido como parte de um trabalho de conclusão de curso
                em Engenharia de Software, com foco na aplicação de técnicas de segurança cibernética
                em plataformas de avaliação EAD/online.
              </p>
              <div className="mt-8">
                <Button 
                  onClick={() => navigate("/register")}
                  className="cyber-button"
                >
                  Experimente agora
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col md:h-24 md:flex-row md:items-center md:justify-between">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} CyberAssessShield. Todos os direitos reservados.
          </p>
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Desenvolvido como projeto de TCC em Engenharia de Software
          </p>
        </div>
      </footer>
    </div>
  );
}
