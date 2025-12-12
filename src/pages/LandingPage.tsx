import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Shield, Book, Lock, Check, User, AlertTriangle, Copy, Mouse, Github, Linkedin } from "lucide-react";
import { useState } from "react";

export default function LandingPage() {
  const navigate = useNavigate();
  const [demoAttempts, setDemoAttempts] = useState({
    copy: 0,
    rightClick: 0,
    devTools: 0,
  });

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-cyber-blue" />
            <span className="font-bold text-xl">CyberAccessShield</span>
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
            <div className="flex flex-col items-center justify-center text-center space-y-8 max-w-5xl mx-auto">
              {/* Logo e Nome Destacado - MAIOR */}
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyber-blue to-cyber-teal rounded-full blur-xl opacity-50"></div>
                  <Shield className="relative h-28 w-28 md:h-36 md:w-36 lg:h-40 lg:w-40 text-cyber-blue drop-shadow-2xl" />
                </div>
                <div>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold cyber-text-gradient mb-3">
                    CyberAccessShield
                  </h2>
                  <p className="text-base md:text-lg lg:text-xl text-muted-foreground">
                    Proteção Inteligente para Avaliações EAD
                  </p>
                </div>
              </div>

              {/* Título Principal */}
              <div className="space-y-4">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
                  Avaliações Online Seguras para o Ensino a Distância
                </h1>
                <p className="max-w-[700px] text-muted-foreground md:text-lg lg:text-xl mx-auto">
                  Plataforma desenvolvida com foco total em segurança web e integridade acadêmica, protegendo contra fraudes e garantindo avaliações confiáveis.
                </p>
              </div>

              {/* Badges de Destaque */}
              <div className="flex flex-wrap justify-center gap-3">
                <div className="px-4 py-2 rounded-full bg-cyber-blue/10 border border-cyber-blue/20">
                  <span className="text-sm font-medium text-cyber-blue">🎓 Projeto TCC - UnB</span>
                </div>
                <div className="px-4 py-2 rounded-full bg-cyber-teal/10 border border-cyber-teal/20">
                  <span className="text-sm font-medium text-cyber-teal">🔒 Segurança Web</span>
                </div>
                <div className="px-4 py-2 rounded-full bg-cyber-purple/10 border border-cyber-purple/20">
                  <span className="text-sm font-medium text-cyber-purple">⚡ Anti-Fraude</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
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
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 bg-secondary/50">
          <div className="container">
            <div className="flex flex-col items-center justify-center text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl cyber-text-gradient pb-2">
                Segurança e Integridade em Cada Camada
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-4">
                Proteção abrangente que combina segurança web moderna com controles específicos para ambientes avaliativos
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 - Monitoramento de Sessão */}
              <div className="bg-card rounded-lg shadow-lg p-6 border border-border hover:border-cyber-blue/50 transition-all hover:shadow-xl">
                <div className="mb-4 rounded-full w-12 h-12 flex items-center justify-center bg-gradient-to-r from-cyber-blue to-cyber-teal">
                  <Lock className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Sessões Protegidas</h3>
                <p className="text-muted-foreground text-sm">
                  Validação contínua de sessão com tokens seguros e renovação automática, garantindo autenticidade durante toda a avaliação.
                </p>
              </div>
              
              {/* Feature 2 - Anti-Cópia */}
              <div className="bg-card rounded-lg shadow-lg p-6 border border-border hover:border-cyber-blue/50 transition-all hover:shadow-xl">
                <div className="mb-4 rounded-full w-12 h-12 flex items-center justify-center bg-gradient-to-r from-cyber-blue to-cyber-teal">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Proteção Anti-Cópia</h3>
                <p className="text-muted-foreground text-sm">
                  Desativa atalhos de teclado (Ctrl+C, Ctrl+V, Ctrl+X) e menu de contexto, prevenindo cópia de questões e cola de respostas.
                </p>
              </div>
              
              {/* Feature 3 - Detecção de Blur */}
              <div className="bg-card rounded-lg shadow-lg p-6 border border-border hover:border-cyber-blue/50 transition-all hover:shadow-xl">
                <div className="mb-4 rounded-full w-12 h-12 flex items-center justify-center bg-gradient-to-r from-cyber-blue to-cyber-teal">
                  <User className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Monitoramento de Foco</h3>
                <p className="text-muted-foreground text-sm">
                  Detecta quando o aluno muda de aba ou minimiza a janela, registrando tentativas de consulta externa durante a prova.
                </p>
              </div>

              {/* Feature 4 - DevTools Protection */}
              <div className="bg-card rounded-lg shadow-lg p-6 border border-border hover:border-cyber-teal/50 transition-all hover:shadow-xl">
                <div className="mb-4 rounded-full w-12 h-12 flex items-center justify-center bg-gradient-to-r from-cyber-teal to-cyber-purple">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Bloqueio de DevTools</h3>
                <p className="text-muted-foreground text-sm">
                  Impede abertura de ferramentas de desenvolvedor (F12, Ctrl+Shift+I) para evitar manipulação de código e respostas.
                </p>
              </div>

              {/* Feature 5 - Sanitização de Dados */}
              <div className="bg-card rounded-lg shadow-lg p-6 border border-border hover:border-cyber-teal/50 transition-all hover:shadow-xl">
                <div className="mb-4 rounded-full w-12 h-12 flex items-center justify-center bg-gradient-to-r from-cyber-teal to-cyber-purple">
                  <Lock className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Sanitização de Inputs</h3>
                <p className="text-muted-foreground text-sm">
                  Validação rigorosa de entradas para prevenir SQL Injection, XSS e outros ataques comuns de segurança web.
                </p>
              </div>

              {/* Feature 6 - Logs de Segurança */}
              <div className="bg-card rounded-lg shadow-lg p-6 border border-border hover:border-cyber-teal/50 transition-all hover:shadow-xl">
                <div className="mb-4 rounded-full w-12 h-12 flex items-center justify-center bg-gradient-to-r from-cyber-teal to-cyber-purple">
                  <Book className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Logs e Auditoria</h3>
                <p className="text-muted-foreground text-sm">
                  Sistema completo de registro de atividades suspeitas, permitindo análise posterior de tentativas de fraude.
                </p>
              </div>

              {/* Feature 7 - RLS Policies */}
              <div className="bg-card rounded-lg shadow-lg p-6 border border-border hover:border-cyber-purple/50 transition-all hover:shadow-xl">
                <div className="mb-4 rounded-full w-12 h-12 flex items-center justify-center bg-gradient-to-r from-cyber-purple to-cyber-blue">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Políticas de Acesso (RLS)</h3>
                <p className="text-muted-foreground text-sm">
                  Row Level Security no banco de dados garante isolamento total de dados entre usuários e perfis de acesso.
                </p>
              </div>

              {/* Feature 8 - Autenticação */}
              <div className="bg-card rounded-lg shadow-lg p-6 border border-border hover:border-cyber-purple/50 transition-all hover:shadow-xl">
                <div className="mb-4 rounded-full w-12 h-12 flex items-center justify-center bg-gradient-to-r from-cyber-purple to-cyber-blue">
                  <User className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Autenticação Robusta</h3>
                <p className="text-muted-foreground text-sm">
                  Sistema de autenticação seguro com validação de sessão contínua e proteção contra acesso não autorizado.
                </p>
              </div>

              {/* Feature 9 - Screenshot Protection */}
              <div className="bg-card rounded-lg shadow-lg p-6 border border-border hover:border-cyber-purple/50 transition-all hover:shadow-xl">
                <div className="mb-4 rounded-full w-12 h-12 flex items-center justify-center bg-gradient-to-r from-cyber-purple to-cyber-blue">
                  <Lock className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Anti-Screenshot</h3>
                <p className="text-muted-foreground text-sm">
                  Proteção contra capturas de tela e impressão não autorizada das questões da avaliação.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section id="security" className="py-20">
          <div className="container">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="flex flex-col justify-center space-y-6">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl cyber-text-gradient">
                  Arquitetura de Segurança Multicamadas
                </h2>
                <p className="text-muted-foreground md:text-lg">
                  Nossa plataforma implementa múltiplas camadas de proteção, desde o frontend até o banco de dados, garantindo segurança web completa.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Check className="h-6 w-6 text-cyber-teal shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Proteção de DevTools:</strong>
                      <span className="text-muted-foreground"> Detecta e bloqueia ferramentas de desenvolvedor, impedindo inspeção e manipulação do código durante avaliações.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-6 w-6 text-cyber-teal shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Monitoramento de Atividade:</strong>
                      <span className="text-muted-foreground"> Sistema de logs que registra tentativas de blur, mudança de aba e ações suspeitas em tempo real.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-6 w-6 text-cyber-teal shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Sanitização Avançada:</strong>
                      <span className="text-muted-foreground"> Validação e sanitização de todas as entradas para prevenir SQL Injection, XSS e ataques de injeção.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-6 w-6 text-cyber-teal shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Row Level Security (RLS):</strong>
                      <span className="text-muted-foreground"> Políticas de segurança no nível de banco de dados garantem isolamento total de dados entre usuários.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-6 w-6 text-cyber-teal shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Sessões Seguras:</strong>
                      <span className="text-muted-foreground"> Validação contínua de sessão com tokens JWT e renovação automática para máxima segurança.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-6 w-6 text-cyber-teal shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Proteção Anti-Screenshot:</strong>
                      <span className="text-muted-foreground"> Medidas técnicas para dificultar captura de tela e impressão não autorizada de questões.</span>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="flex items-center justify-center">
                <div className="cyber-glass w-full max-w-md p-8 rounded-lg border-2 border-cyber-blue/20">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold">Status de Segurança</h3>
                      <div className="h-3 w-3 rounded-full bg-cyber-teal animate-pulse"></div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Proteção Frontend</span>
                          <span className="text-cyber-teal font-bold">100%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-2 rounded-full bg-gradient-to-r from-cyber-blue to-cyber-teal w-full transition-all duration-1000"></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Controles de Acesso</span>
                          <span className="text-cyber-teal font-bold">100%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-2 rounded-full bg-gradient-to-r from-cyber-blue to-cyber-teal w-full transition-all duration-1000 delay-100"></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Segurança de Dados</span>
                          <span className="text-cyber-teal font-bold">100%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-2 rounded-full bg-gradient-to-r from-cyber-blue to-cyber-teal w-full transition-all duration-1000 delay-200"></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Auditoria e Logs</span>
                          <span className="text-cyber-teal font-bold">Ativo</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-2 rounded-full bg-gradient-to-r from-cyber-blue to-cyber-teal w-full transition-all duration-1000 delay-300"></div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-6 border-t border-border">
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="h-4 w-4 text-cyber-teal" />
                        <span className="text-muted-foreground">Última verificação: Agora</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Interativa de Segurança */}
        <section className="py-20 bg-secondary/50">
          <div className="container">
            <div className="flex flex-col items-center text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl cyber-text-gradient pb-2">
                Veja as Proteções em Ação
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-4">
                Teste as proteções de segurança diretamente nesta demo interativa
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="bg-card rounded-lg shadow-xl p-8 border-2 border-cyber-blue/30">
                <div className="mb-6 flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-cyber-blue" />
                  <h3 className="text-xl font-bold">Zona de Teste Protegida</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Área de Demo */}
                  <div className="space-y-6">
                    <div 
                      className="bg-gradient-to-br from-cyber-blue/10 to-cyber-teal/10 rounded-lg p-6 border border-cyber-blue/20 min-h-[200px] relative"
                      onCopy={(e) => {
                        e.preventDefault();
                        setDemoAttempts(prev => ({ ...prev, copy: prev.copy + 1 }));
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setDemoAttempts(prev => ({ ...prev, rightClick: prev.rightClick + 1 }));
                      }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Copy className="h-5 w-5 text-cyber-blue" />
                        <span className="font-medium">Tente copiar este texto:</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Esta é uma questão de avaliação protegida. O sistema impedirá que você copie este conteúdo ou utilize o menu de contexto (botão direito).
                      </p>
                      <div className="bg-card/50 p-4 rounded border border-border">
                        <p className="font-mono text-sm">
                          Questão de Exemplo: Qual é a importância da segurança em avaliações online?
                        </p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-cyber-teal/10 to-cyber-purple/10 rounded-lg p-6 border border-cyber-teal/20">
                      <div className="flex items-center gap-2 mb-4">
                        <Mouse className="h-5 w-5 text-cyber-teal" />
                        <span className="font-medium">Simulação de Controles:</span>
                      </div>
                      <div className="space-y-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-cyber-teal"></div>
                          <span>Ctrl+C / Ctrl+V: Bloqueado</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-cyber-teal"></div>
                          <span>Botão Direito: Desabilitado</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-cyber-teal"></div>
                          <span>Detecção de Blur: Ativo</span>
                        </div>
                        <p className="text-xs pt-2 text-muted-foreground/70">
                          *Proteções completas ativas apenas durante avaliações
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Log de Tentativas */}
                  <div className="space-y-4">
                    <div className="bg-card border border-border rounded-lg p-6">
                      <h4 className="font-bold mb-4 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-cyber-blue" />
                        Tentativas Detectadas
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-secondary/50 rounded">
                          <span className="text-sm">Tentativas de Cópia</span>
                          <span className="font-bold text-cyber-blue">{demoAttempts.copy}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-secondary/50 rounded">
                          <span className="text-sm">Cliques Direitos</span>
                          <span className="font-bold text-cyber-blue">{demoAttempts.rightClick}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-secondary/50 rounded">
                          <span className="text-sm">Total de Violações</span>
                          <span className="font-bold text-cyber-teal">
                            {demoAttempts.copy + demoAttempts.rightClick}
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-border">
                        <p className="text-xs text-muted-foreground">
                          💡 Em uma avaliação real, todas essas tentativas seriam registradas no log de segurança e disponibilizadas ao professor para análise.
                        </p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-cyber-blue/5 to-cyber-teal/5 border border-cyber-blue/20 rounded-lg p-4">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        <strong className="text-foreground">Nota:</strong> Esta é apenas uma demonstração simplificada. Durante uma avaliação real, o sistema aplica proteções adicionais como bloqueio de blur, detecção de DevTools, controle de cursor e muito mais.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col items-center text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl cyber-text-gradient pb-2">
                  Sobre o Projeto
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-4">
                  Trabalho de Conclusão de Curso focado em segurança web aplicada a ambientes de avaliação online
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                {/* Card Instituição */}
                <div className="bg-card rounded-lg shadow-lg p-8 border border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-cyber-blue to-cyber-teal flex items-center justify-center">
                      <Book className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Instituição</h3>
                      <p className="text-sm text-muted-foreground">Universidade de Brasília</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Projeto desenvolvido como Trabalho de Conclusão de Curso (TCC) em Engenharia de Software na UnB, 
                    aplicando conceitos avançados de segurança web e proteção de dados em ambientes educacionais.
                  </p>
                </div>

                {/* Card Objetivo */}
                <div className="bg-card rounded-lg shadow-lg p-8 border border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-cyber-teal to-cyber-purple flex items-center justify-center">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Objetivo</h3>
                      <p className="text-sm text-muted-foreground">Segurança & Integridade</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Desenvolver uma plataforma robusta que garanta a integridade de avaliações online através de 
                    múltiplas camadas de segurança, desde o frontend até o banco de dados, prevenindo fraudes acadêmicas.
                  </p>
                </div>
              </div>

              {/* Stack Tecnológico */}
              <div className="bg-gradient-to-br from-cyber-blue/5 to-cyber-teal/5 rounded-lg p-8 border border-cyber-blue/20 mb-12">
                <h3 className="text-xl font-bold mb-6 text-center">Stack Tecnológico</h3>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-left">
                    <h4 className="font-semibold mb-3 text-cyber-blue">Frontend</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• React 18 + TypeScript</li>
                      <li>• Vite (Build Tool)</li>
                      <li>• Tailwind CSS + shadcn/ui</li>
                      <li>• React Router</li>
                    </ul>
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold mb-3 text-cyber-teal">Backend & Database</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Supabase (BaaS)</li>
                      <li>• PostgreSQL</li>
                      <li>• Row Level Security (RLS)</li>
                      <li>• Supabase Auth</li>
                    </ul>
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold mb-3 text-cyber-purple">Segurança</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Proteções Frontend</li>
                      <li>• Sanitização de Inputs</li>
                      <li>• Sistema de Logs</li>
                      <li>• Políticas RLS</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Diferenciais */}
              <div className="bg-card rounded-lg shadow-lg p-8 border border-border mb-12">
                <h3 className="text-xl font-bold mb-6 text-center">Diferenciais do Projeto</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex gap-3">
                    <Check className="h-6 w-6 text-cyber-teal shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1">Segurança Multicamadas</h4>
                      <p className="text-sm text-muted-foreground">
                        Proteção em todos os níveis: frontend, backend e banco de dados
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Check className="h-6 w-6 text-cyber-teal shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1">Controles Específicos para EAD</h4>
                      <p className="text-sm text-muted-foreground">
                        Proteções customizadas para ambiente de avaliação online
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Check className="h-6 w-6 text-cyber-teal shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1">Auditoria Completa</h4>
                      <p className="text-sm text-muted-foreground">
                        Sistema de logs que registra todas as atividades suspeitas
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Check className="h-6 w-6 text-cyber-teal shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1">Foco em Integridade</h4>
                      <p className="text-sm text-muted-foreground">
                        Garantia de autenticidade e confiabilidade das avaliações
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Button 
                  size="lg"
                  onClick={() => navigate("/register")}
                  className="cyber-button"
                >
                  Experimente a Plataforma
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-secondary/30">
        <div className="container py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Coluna 1 - Sobre */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-cyber-blue" />
                <span className="font-bold text-lg">CyberAccessShield</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Plataforma de avaliações online seguras, desenvolvida como TCC na Universidade de Brasília.
              </p>
            </div>

            {/* Coluna 2 - Links Rápidos */}
            <div>
              <h3 className="font-semibold mb-4">Navegação</h3>
              <nav className="flex flex-col gap-2">
                <a 
                  href="#features"
                  className="text-sm text-muted-foreground hover:text-cyber-blue transition-colors"
                >
                  Recursos
                </a>
                <a 
                  href="#security"
                  className="text-sm text-muted-foreground hover:text-cyber-blue transition-colors"
                >
                  Segurança
                </a>
                <a 
                  href="#about"
                  className="text-sm text-muted-foreground hover:text-cyber-blue transition-colors"
                >
                  Sobre
                </a>
                <button
                  onClick={() => navigate("/login")}
                  className="text-sm text-muted-foreground hover:text-cyber-blue transition-colors text-left"
                >
                  Login
                </button>
              </nav>
            </div>

            {/* Coluna 3 - Desenvolvedores */}
            <div>
              <h3 className="font-semibold mb-4">Desenvolvedores</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-2">Cleber Brant</p>
                  <div className="flex gap-3">
                    <a 
                      href="https://www.linkedin.com/in/cleberbrant/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-cyber-blue transition-colors"
                    >
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </a>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Pedro Rodrigues</p>
                  <div className="flex gap-3">
                    <a 
                      href="https://www.linkedin.com/in/pedro-prp/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-cyber-blue transition-colors"
                    >
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Linha inferior */}
          <div className="border-t pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} CyberAccessShield. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="https://github.com/Cleberbrant/cyber-access-shield" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-cyber-blue transition-colors"
              >
                <Github className="h-4 w-4" />
                <span>Repositório</span>
              </a>
              <span className="text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">
                UnB - Universidade de Brasília
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
