import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo, LogoMark } from "@/components/brand/Logo";
import {
  Shield,
  ShieldCheck,
  Book,
  Lock,
  Eye,
  Code2,
  Database,
  UserCheck,
  Camera,
  ScrollText,
  Copy,
  Mouse,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";

const features = [
  {
    icon: Lock,
    title: "Sessões Protegidas",
    description:
      "Validação contínua de sessão com tokens seguros e renovação automática, garantindo autenticidade durante toda a avaliação.",
  },
  {
    icon: Copy,
    title: "Proteção Anti-Cópia",
    description:
      "Desativa atalhos de teclado (Ctrl+C, Ctrl+V, Ctrl+X) e menu de contexto, prevenindo cópia de questões e cola de respostas.",
  },
  {
    icon: Eye,
    title: "Monitoramento de Foco",
    description:
      "Detecta quando o aluno muda de aba ou minimiza a janela, registrando tentativas de consulta externa durante a prova.",
  },
  {
    icon: Code2,
    title: "Bloqueio de DevTools",
    description:
      "Impede abertura de ferramentas de desenvolvedor (F12, Ctrl+Shift+I) para evitar manipulação de código e respostas.",
  },
  {
    icon: ShieldCheck,
    title: "Sanitização de Inputs",
    description:
      "Validação rigorosa de entradas para prevenir SQL Injection, XSS e outros ataques comuns de segurança web.",
  },
  {
    icon: ScrollText,
    title: "Logs e Auditoria",
    description:
      "Sistema completo de registro de atividades suspeitas, permitindo análise posterior de tentativas de fraude.",
  },
  {
    icon: Database,
    title: "Políticas de Acesso (RLS)",
    description:
      "Row Level Security no banco de dados garante isolamento total de dados entre usuários e perfis de acesso.",
  },
  {
    icon: UserCheck,
    title: "Autenticação Robusta",
    description:
      "Sistema de autenticação seguro com validação de sessão contínua e proteção contra acesso não autorizado.",
  },
  {
    icon: Camera,
    title: "Anti-Screenshot",
    description:
      "Proteção contra capturas de tela e impressão não autorizada das questões da avaliação.",
  },
];

const securityChecklist = [
  {
    title: "Proteção de DevTools",
    description:
      "Detecta e bloqueia ferramentas de desenvolvedor, impedindo inspeção e manipulação do código durante avaliações.",
  },
  {
    title: "Monitoramento de Atividade",
    description:
      "Sistema de logs que registra tentativas de blur, mudança de aba e ações suspeitas em tempo real.",
  },
  {
    title: "Sanitização Avançada",
    description:
      "Validação e sanitização de todas as entradas para prevenir SQL Injection, XSS e ataques de injeção.",
  },
  {
    title: "Row Level Security (RLS)",
    description:
      "Políticas de segurança no nível de banco de dados garantem isolamento total de dados entre usuários.",
  },
  {
    title: "Sessões Seguras",
    description:
      "Validação contínua de sessão com tokens JWT e renovação automática para máxima segurança.",
  },
  {
    title: "Proteção Anti-Screenshot",
    description:
      "Medidas técnicas para dificultar captura de tela e impressão não autorizada de questões.",
  },
];

const stackChips = [
  "React 18",
  "TypeScript",
  "Supabase",
  "PostgreSQL + RLS",
  "Electron",
  "Vite",
  "Tailwind CSS",
];

const steps = [
  {
    number: "01",
    title: "Crie a avaliação",
    description:
      "Monte questões e configure as regras de segurança da prova em poucos minutos.",
  },
  {
    number: "02",
    title: "Aluno entra no ambiente protegido",
    description:
      "Acesso via web ou desktop em modo kiosk, com todas as proteções ativas durante a prova.",
  },
  {
    number: "03",
    title: "Acompanhe em tempo real",
    description:
      "Violações e resultados registrados no log de segurança, disponíveis para análise do professor.",
  },
];

const heroChips = [
  { label: "kiosk ativo", dot: "bg-cyber-teal", position: "left-0 top-12", delay: "0s" },
  { label: "0 violações", dot: "bg-primary", position: "right-0 top-1/3", delay: "1.2s" },
  { label: "monitor bloqueado", dot: "bg-accent", position: "bottom-16 left-6", delay: "2.4s" },
];

const linkedInIcon = (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

export default function LandingPage() {
  const navigate = useNavigate();
  const [demoAttempts, setDemoAttempts] = useState({
    copy: 0,
    rightClick: 0,
    devTools: 0,
  });

  const totalViolations = demoAttempts.copy + demoAttempts.rightClick;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* ===== Nav ===== */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <a href="#top" className="flex items-center" aria-label="CyberAccessShield">
            <Logo size={26} />
          </a>
          <div className="flex items-center gap-3">
            <nav className="hidden items-center gap-6 md:flex">
              <a
                href="#features"
                className="text-sm lowercase text-muted-foreground transition-colors hover:text-foreground"
              >
                recursos
              </a>
              <a
                href="#security"
                className="text-sm lowercase text-muted-foreground transition-colors hover:text-foreground"
              >
                segurança
              </a>
              <a
                href="#about"
                className="text-sm lowercase text-muted-foreground transition-colors hover:text-foreground"
              >
                sobre
              </a>
            </nav>
            <ThemeToggle />
            <Button
              size="sm"
              onClick={() => navigate("/login")}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Entrar
            </Button>
          </div>
        </div>
      </header>

      <main id="top" className="flex-1">
        {/* ===== Hero ===== */}
        <section className="relative overflow-hidden border-b border-border grid-pattern">
          <div className="container relative z-10 grid items-center gap-12 py-20 md:py-28 lg:grid-cols-[1.1fr_1fr] lg:gap-8">
            {/* Left: copy */}
            <div className="animate-fade-up">
              <p className="font-mono text-xs tracking-widest text-primary">
                {"// PLATAFORMA DE AVALIAÇÃO SEGURA"}
              </p>
              <h1 className="mt-6 font-display text-5xl font-bold tracking-tighter md:text-6xl">
                Avaliações online{" "}
                <span className="cyber-text-gradient">seguras</span> para o
                ensino a distância
              </h1>
              <p className="mt-5 max-w-xl text-muted-foreground md:text-lg">
                Segurança web e integridade acadêmica, do navegador ao banco de
                dados.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button
                  size="lg"
                  onClick={() => navigate("/register")}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Começar agora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="ghost" size="lg" asChild>
                  <a href="#features">
                    Ver recursos
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
              <p className="mt-10 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                RLS Postgres · Kiosk Desktop · Logs em tempo real
              </p>
            </div>

            {/* Right: brand composition */}
            <div className="relative hidden h-[480px] items-center justify-center lg:flex">
              {/* Single subtle glow */}
              <div
                aria-hidden="true"
                className="absolute h-80 w-80 rounded-full bg-primary/10 blur-3xl"
              />
              {/* Concentric hairline rings */}
              <div
                aria-hidden="true"
                className="absolute h-[400px] w-[400px] rounded-full border border-primary/10"
              />
              <div
                aria-hidden="true"
                className="absolute h-[480px] w-[480px] rounded-full border border-primary/10"
              />
              <div
                aria-hidden="true"
                className="absolute h-[560px] w-[560px] rounded-full border border-primary/5"
              />
              <LogoMark size={320} />
              {/* Floating product callouts */}
              {heroChips.map((chip) => (
                <span
                  key={chip.label}
                  className={`animate-float absolute ${chip.position} flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 font-mono text-[11px] text-muted-foreground shadow-sm`}
                  style={{ animationDelay: chip.delay }}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${chip.dot}`} />
                  {chip.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Product shot ===== */}
        <section className="relative py-16 md:py-20">
          <div className="container relative">
            {/* One subtle glow under the frame */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-16 -bottom-4 h-24 bg-primary opacity-10 blur-3xl"
            />
            <div className="relative overflow-hidden rounded-xl border border-border bg-card animate-fade-up">
              {/* Minimal chrome */}
              <div className="flex items-center border-b border-border px-4 py-2.5">
                <span className="font-mono text-xs text-muted-foreground">
                  app.cyberaccessshield.com
                </span>
              </div>

              {/* Abstract dashboard */}
              <div className="grid gap-4 p-4 md:grid-cols-[180px_1fr] md:p-6">
                {/* Sidebar */}
                <div className="hidden flex-col gap-3 rounded-lg border border-border bg-background p-4 md:flex">
                  <div className="flex items-center gap-2">
                    <LogoMark size={18} />
                    <div className="h-2 w-16 rounded bg-muted" />
                  </div>
                  <div className="mt-2 h-2 w-full rounded bg-primary/40" />
                  <div className="h-2 w-3/4 rounded bg-muted" />
                  <div className="h-2 w-5/6 rounded bg-muted" />
                  <div className="h-2 w-2/3 rounded bg-muted" />
                </div>

                {/* Main panel */}
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-4 font-mono text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyber-teal" />
                      proteções ativas
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      sessão validada
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      RLS habilitado
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    {[
                      { label: "Proteção Frontend", width: "w-full" },
                      { label: "Controles de Acesso", width: "w-11/12" },
                      { label: "Segurança de Dados", width: "w-full" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-lg border border-border bg-background p-4"
                      >
                        <p className="mb-3 text-xs text-muted-foreground">
                          {item.label}
                        </p>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-2 rounded-full bg-primary ${item.width}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg border border-border bg-background p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="h-2 w-24 rounded bg-muted" />
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 w-full rounded bg-muted" />
                      <div className="h-2 w-4/5 rounded bg-muted" />
                      <div className="h-2 w-2/3 rounded bg-primary/30" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Stack strip ===== */}
        <section className="border-y border-border py-5">
          <div className="container">
            <p className="text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {stackChips.join(" · ")}
            </p>
          </div>
        </section>

        {/* ===== Features (hairline grid) ===== */}
        <section id="features" className="py-20 md:py-28">
          <div className="container">
            <div className="mb-12 grid gap-6 animate-fade-up lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <span className="font-mono text-xs tracking-widest text-primary">
                  01 — RECURSOS
                </span>
                <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  Segurança e integridade em cada camada
                </h2>
              </div>
              <p className="max-w-sm text-sm text-muted-foreground lg:text-right">
                Proteção abrangente que combina segurança web moderna com
                controles específicos para ambientes avaliativos.
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-border">
              <div className="grid md:grid-cols-3">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  const isLast = index === features.length - 1;
                  const isLastCol = index % 3 === 2;
                  const isLastRow = index >= features.length - 3;
                  return (
                    <div
                      key={feature.title}
                      className={`border-border p-8 ${isLast ? "" : "border-b"} ${
                        isLastRow ? "md:border-b-0" : ""
                      } ${isLastCol ? "" : "md:border-r"}`}
                    >
                      <Icon className="h-5 w-5 text-primary" />
                      <h3 className="mt-4 text-base font-medium">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ===== Security ===== */}
        <section
          id="security"
          className="relative overflow-hidden border-y border-border py-20 md:py-28"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-accent opacity-10 blur-3xl"
          />
          <div className="container relative z-10">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              {/* Checklist */}
              <div className="flex flex-col justify-center animate-fade-up">
                <span className="font-mono text-xs tracking-widest text-primary">
                  02 — SEGURANÇA
                </span>
                <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  Arquitetura de segurança multicamadas
                </h2>
                <p className="mt-4 text-muted-foreground">
                  Nossa plataforma implementa múltiplas camadas de proteção,
                  desde o frontend até o banco de dados, garantindo segurança
                  web completa.
                </p>
                <ul className="mt-8 space-y-5">
                  {securityChecklist.map((item, index) => (
                    <li key={item.title} className="flex items-start gap-4">
                      <span className="mt-0.5 font-mono text-xs text-primary">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <strong className="text-foreground">
                          {item.title}:
                        </strong>{" "}
                        <span className="text-sm text-muted-foreground">
                          {item.description}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Status panel */}
              <div className="flex items-center justify-center">
                <div className="w-full max-w-md rounded-xl border border-border bg-card p-8">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="font-display text-xl font-bold">
                      Status de Segurança
                    </h3>
                    <span className="h-2 w-2 rounded-full bg-cyber-teal" />
                  </div>

                  <div className="space-y-5">
                    {[
                      { label: "Proteção Frontend", value: "100%" },
                      { label: "Controles de Acesso", value: "100%" },
                      { label: "Segurança de Dados", value: "100%" },
                      { label: "Auditoria e Logs", value: "Ativo" },
                    ].map((row) => (
                      <div key={row.label} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {row.label}
                          </span>
                          <span className="font-mono text-sm text-cyber-teal">
                            {row.value}
                          </span>
                        </div>
                        <div className="h-1 overflow-hidden rounded-full bg-muted">
                          <div className="h-1 w-full rounded-full bg-primary" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 border-t border-border pt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4 text-cyber-teal" />
                      <span className="font-mono text-xs text-muted-foreground">
                        última verificação: agora
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Demo interativa (terminal) ===== */}
        <section className="py-20 md:py-28">
          <div className="container">
            <div className="mb-12 grid gap-6 animate-fade-up lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <span className="font-mono text-xs tracking-widest text-primary">
                  03 — DEMO INTERATIVA
                </span>
                <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  Veja as proteções em ação
                </h2>
              </div>
              <p className="max-w-sm text-sm text-muted-foreground lg:text-right">
                Teste as proteções de segurança diretamente nesta demo
                interativa.
              </p>
            </div>

            <div className="mx-auto max-w-5xl">
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                {/* Terminal header */}
                <div className="flex items-center border-b border-border px-4 py-2.5">
                  <span className="font-mono text-xs lowercase text-muted-foreground">
                    ~/cyber-access-shield/security-monitor
                  </span>
                </div>

                <div className="grid gap-8 p-6 md:grid-cols-2 md:p-8">
                  {/* Protected zone */}
                  <div className="space-y-6">
                    <section
                      aria-label="Zona de teste de proteção contra cópia"
                      className="relative min-h-[200px] rounded-lg border border-border bg-background p-6"
                      onCopy={(e) => {
                        e.preventDefault();
                        setDemoAttempts((prev) => ({
                          ...prev,
                          copy: prev.copy + 1,
                        }));
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setDemoAttempts((prev) => ({
                          ...prev,
                          rightClick: prev.rightClick + 1,
                        }));
                      }}
                    >
                      <div className="mb-4 flex items-center gap-2">
                        <Copy className="h-5 w-5 text-primary" />
                        <span className="font-medium">
                          Tente copiar este texto:
                        </span>
                      </div>
                      <p className="mb-4 text-sm text-muted-foreground">
                        Esta é uma questão de avaliação protegida. O sistema
                        impedirá que você copie este conteúdo ou utilize o menu
                        de contexto (botão direito).
                      </p>
                      <div className="rounded-md border border-border bg-card p-4">
                        <p className="font-mono text-sm">
                          Questão de Exemplo: Qual é a importância da segurança
                          em avaliações online?
                        </p>
                      </div>
                    </section>

                    <div className="rounded-lg border border-border bg-background p-6">
                      <div className="mb-4 flex items-center gap-2">
                        <Mouse className="h-5 w-5 text-cyber-teal" />
                        <span className="font-medium">
                          Simulação de Controles:
                        </span>
                      </div>
                      <div className="space-y-2 font-mono text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span className="text-cyber-teal">✓</span>
                          <span>Ctrl+C / Ctrl+V: Bloqueado</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-cyber-teal">✓</span>
                          <span>Botão Direito: Desabilitado</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-cyber-teal">✓</span>
                          <span>Detecção de Blur: Ativo</span>
                        </div>
                        <p className="pt-2 text-[11px] text-muted-foreground/70">
                          *Proteções completas ativas apenas durante avaliações
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Terminal log */}
                  <div className="space-y-4">
                    <div className="rounded-lg border border-border bg-background p-6 font-mono text-xs">
                      <h4 className="mb-4 flex items-center gap-2 font-display text-sm font-bold">
                        <Shield className="h-4 w-4 text-primary" />
                        Tentativas Detectadas
                      </h4>
                      <div className="space-y-2">
                        <p className="text-muted-foreground">
                          <span className="text-primary">$</span> security-log
                          --tail --follow
                        </p>
                        <p className="text-primary">
                          [OK]&nbsp;&nbsp;&nbsp;&nbsp;proteções de cópia e
                          contexto ativas
                        </p>
                        <div className="flex items-center justify-between rounded bg-card px-3 py-2">
                          <span className="text-yellow-400">
                            [WARN]&nbsp;&nbsp;tentativas de cópia
                          </span>
                          <span className="font-bold text-yellow-400">
                            ×{demoAttempts.copy}
                          </span>
                        </div>
                        <div className="flex items-center justify-between rounded bg-card px-3 py-2">
                          <span className="text-yellow-400">
                            [WARN]&nbsp;&nbsp;cliques com botão direito
                          </span>
                          <span className="font-bold text-yellow-400">
                            ×{demoAttempts.rightClick}
                          </span>
                        </div>
                        <div className="flex items-center justify-between rounded bg-card px-3 py-2">
                          <span className="text-destructive">
                            [ALERT]&nbsp;total de violações
                          </span>
                          <span className="font-bold text-destructive">
                            ×{totalViolations}
                          </span>
                        </div>
                        <p className="text-muted-foreground/60">
                          aguardando eventos
                          <span className="animate-pulse">_</span>
                        </p>
                      </div>

                      <div className="mt-5 border-t border-border pt-4">
                        <p className="text-[11px] leading-relaxed text-muted-foreground">
                          Em uma avaliação real, todas essas tentativas seriam
                          registradas no log de segurança e disponibilizadas ao
                          professor para análise.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border bg-background p-4">
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        <strong className="text-foreground">Nota:</strong> Esta
                        é apenas uma demonstração simplificada. Durante uma
                        avaliação real, o sistema aplica proteções adicionais
                        como bloqueio de blur, detecção de DevTools, controle de
                        cursor e muito mais.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Como funciona ===== */}
        <section className="border-y border-border py-20 md:py-28">
          <div className="container">
            <div className="mb-14 animate-fade-up">
              <span className="font-mono text-xs tracking-widest text-primary">
                04 — COMO FUNCIONA
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Da criação ao resultado em três passos
              </h2>
            </div>

            <div className="max-w-3xl">
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className="grid grid-cols-[4.5rem_1fr] gap-6 md:grid-cols-[7rem_1fr] md:gap-10"
                >
                  <span className="select-none font-display text-6xl font-bold leading-none text-secondary md:text-7xl">
                    {step.number}
                  </span>
                  <div
                    className={`border-l border-border pl-6 md:pl-10 ${
                      index === steps.length - 1 ? "pb-2" : "pb-14"
                    }`}
                  >
                    <h3 className="font-display text-lg font-bold">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Sobre ===== */}
        <section id="about" className="py-20 md:py-28">
          <div className="container">
            <div className="mb-12 grid gap-6 animate-fade-up lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <span className="font-mono text-xs tracking-widest text-primary">
                  05 — SOBRE
                </span>
                <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  Sobre o projeto
                </h2>
              </div>
              <p className="max-w-sm text-sm text-muted-foreground lg:text-right">
                Trabalho de Conclusão de Curso focado em segurança web aplicada
                a ambientes de avaliação online.
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-border">
              <div className="grid md:grid-cols-2">
                {/* Instituição */}
                <div className="border-b border-border p-8 md:border-b-0 md:border-r">
                  <Book className="h-5 w-5 text-primary" />
                  <h3 className="mt-4 text-base font-medium">Instituição</h3>
                  <p className="text-sm text-muted-foreground">
                    Universidade de Brasília
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Projeto desenvolvido como Trabalho de Conclusão de Curso
                    (TCC) em Engenharia de Software na UnB, aplicando conceitos
                    avançados de segurança web e proteção de dados em ambientes
                    educacionais.
                  </p>
                </div>

                {/* Objetivo */}
                <div className="p-8">
                  <Shield className="h-5 w-5 text-accent" />
                  <h3 className="mt-4 text-base font-medium">Objetivo</h3>
                  <p className="text-sm text-muted-foreground">
                    Segurança & Integridade
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Desenvolver uma plataforma robusta que garanta a integridade
                    de avaliações online através de múltiplas camadas de
                    segurança, desde o frontend até o banco de dados, prevenindo
                    fraudes acadêmicas.
                  </p>
                </div>
              </div>
            </div>

            {/* Diferenciais */}
            <div className="mt-12">
              <h3 className="font-display text-xl font-bold">
                Diferenciais do Projeto
              </h3>
              <div className="mt-6 grid gap-x-12 gap-y-6 md:grid-cols-2">
                {[
                  {
                    title: "Segurança Multicamadas",
                    description:
                      "Proteção em todos os níveis: frontend, backend e banco de dados",
                  },
                  {
                    title: "Controles Específicos para EAD",
                    description:
                      "Proteções customizadas para ambiente de avaliação online",
                  },
                  {
                    title: "Auditoria Completa",
                    description:
                      "Sistema de logs que registra todas as atividades suspeitas",
                  },
                  {
                    title: "Foco em Integridade",
                    description:
                      "Garantia de autenticidade e confiabilidade das avaliações",
                  },
                ].map((item, index) => (
                  <div key={item.title} className="flex gap-4">
                    <span className="mt-0.5 font-mono text-xs text-primary">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h4 className="mb-1 font-medium">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Final CTA */}
            <div className="mt-16 border-t border-border pt-12">
              <h3 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Pronto para avaliações{" "}
                <span className="cyber-text-gradient">confiáveis</span>?
              </h3>
              <p className="mt-3 max-w-xl text-muted-foreground">
                Crie sua conta e configure a primeira prova protegida em
                minutos.
              </p>
              <Button
                size="lg"
                onClick={() => navigate("/register")}
                className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Experimente a Plataforma
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* ===== Footer ===== */}
      <footer className="border-t border-border">
        <div className="container py-12">
          <div className="mb-8 grid gap-8 md:grid-cols-3">
            {/* Marca */}
            <div>
              <div className="mb-4">
                <Logo size={24} />
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Plataforma de avaliações online seguras, desenvolvida como TCC
                na Universidade de Brasília.
              </p>
            </div>

            {/* Navegação */}
            <div>
              <h3 className="mb-4 font-display font-semibold">Navegação</h3>
              <nav className="flex flex-col gap-2">
                <a
                  href="#features"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Recursos
                </a>
                <a
                  href="#security"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Segurança
                </a>
                <a
                  href="#about"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Sobre
                </a>
                <button
                  onClick={() => navigate("/login")}
                  className="text-left text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Login
                </button>
              </nav>
            </div>

            {/* Desenvolvedores */}
            <div>
              <h3 className="mb-4 font-display font-semibold">
                Desenvolvedores
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="mb-2 text-sm font-medium">Cleber Brant</p>
                  <div className="flex gap-3">
                    <a
                      href="https://www.linkedin.com/in/cleberbrant/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {linkedInIcon}
                      LinkedIn
                    </a>
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium">Pedro Rodrigues</p>
                  <div className="flex gap-3">
                    <a
                      href="https://www.linkedin.com/in/pedro-prp/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {linkedInIcon}
                      LinkedIn
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Linha inferior */}
          <div className="flex flex-col gap-4 border-t border-border pt-8 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} CyberAccessShield. Todos os
              direitos reservados.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/Cleberbrant/cyber-access-shield"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span>Repositório</span>
              </a>
              <span className="text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">
                UnB - Universidade de Brasília
              </span>
            </div>
          </div>
        </div>

        {/* Ghost wordmark */}
        <div className="overflow-hidden" aria-hidden="true">
          <span className="block whitespace-nowrap text-center font-display text-[12vw] font-bold leading-none text-foreground/[0.03] select-none">
            CyberAccessShield
          </span>
        </div>
      </footer>
    </div>
  );
}
