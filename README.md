# 🛡️ Cyber Access Shield

Plataforma de avaliação online segura desenvolvida como Trabalho de Conclusão de Curso (TCC) na **UnB - Universidade de Brasília**. O sistema garante a integridade de avaliações acadêmicas através de múltiplas camadas de proteção anti-fraude, ambiente de prova seguro e gestão administrativa completa.

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Cleberbrant_cyber-access-shield&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Cleberbrant_cyber-access-shield)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=Cleberbrant_cyber-access-shield&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=Cleberbrant_cyber-access-shield)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=Cleberbrant_cyber-access-shield&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=Cleberbrant_cyber-access-shield)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=Cleberbrant_cyber-access-shield&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=Cleberbrant_cyber-access-shield)

**URL de produção**: [https://cyber-access-shield.vercel.app](https://cyber-access-shield.vercel.app)

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Sistema de Defesas Anti-Fraude](#-sistema-de-defesas-anti-fraude)
- [Tecnologias](#-tecnologias)
- [Infraestrutura e Deploy](#-infraestrutura-e-deploy)
- [Configuração do Ambiente](#-configuração-do-ambiente)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Segurança e SSDLC](#-segurança-e-ssdlc)
- [CI/CD e Pipelines](#-cicd-e-pipelines)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Documentação](#-documentação)
- [Autores](#-autores)

---

## 🎯 Sobre o Projeto

O **Cyber Access Shield** é uma plataforma web que permite a criação, aplicação e correção de avaliações online com foco em **segurança**. O sistema implementa mecanismos de proteção tanto no ambiente da avaliação (anti-fraude) quanto na plataforma em si (autenticação, autorização, proteção de dados).

### Problema
Avaliações online tradicionais são vulneráveis a diversas formas de fraude: cópia de conteúdo, troca de abas, uso de ferramentas de desenvolvedor, compartilhamento de tela, entre outros.

### Solução
Uma plataforma que integra múltiplas camadas de defesa para criar um ambiente de avaliação íntegro, com registro detalhado de tentativas de violação e painel administrativo para análise.

---

## ✨ Funcionalidades

### Para Administradores (Professores)
- **Criação de avaliações** com questões objetivas (múltipla escolha, V/F) e dissertativas
- **Configuração de parâmetros**: tempo máximo, número de tentativas, data de disponibilização
- **Correção automática** de questões objetivas (gabarito server-side)
- **Painel de logs de fraude** com detalhes por aluno e por avaliação
- **Gestão de usuários**: ativação/desativação, reset de senha, alteração de permissões
- **Dashboard** com estatísticas gerais e métricas de uso

### Para Alunos
- **Realização de avaliações** em ambiente seguro e protegido
- **Progresso salvo automaticamente** — recuperação em caso de queda de conexão
- **Visualização de resultados** após conclusão
- **Gestão de perfil** e alteração de senha

### Segurança da Plataforma
- **Autenticação** via Supabase Auth (email/senha) com proteção anti-bot (Cloudflare Turnstile)
- **Autorização baseada em perfis** (admin/aluno) com Row Level Security (RLS)
- **Bloqueio de dispositivos móveis** — plataforma exclusiva para desktop
- **Headers de segurança** em produção (CSP, HSTS Preload, X-Frame-Options, etc.)

---

## 🔒 Sistema de Defesas Anti-Fraude

O sistema implementa múltiplas camadas de proteção durante as avaliações:

| Proteção | Descrição | Hook/Componente |
|---|---|---|
| **Bloqueio de Teclado** | Impede Ctrl+C, Ctrl+V, Ctrl+P, PrintScreen, F12 | `useKeyboardProtection` |
| **Bloqueio de Mouse** | Desabilita clique direito e menu de contexto | `useMouseProtection` |
| **Detecção de Blur/Focus** | Registra troca de aba/janela durante avaliação | `useWindowBlurProtection` |
| **Popup de Saída** | Alerta `beforeunload` ao tentar fechar | `useBeforeUnloadProtection` |
| **Detecção de DevTools** | Threshold 129px + detecção Firebug | `useDevToolsDetection` |
| **Bloqueio Pre-React** | Atalhos críticos bloqueados antes do React montar (script inline) | `index.html` |
| **Gabarito Server-Side** | `correct_answer` nunca enviada ao frontend — correção via RPC | `submit_and_grade_assessment` |
| **Anti-Bot no Login** | Cloudflare Turnstile bloqueia bots automatizados | `TurnstileWidget` |
| **Bloqueio Mobile** | Dispositivos móveis redirecionados para tela de aviso | `MobileBlock` |
| **Registro de Eventos** | Todos os eventos de segurança logados no banco | `logSecurityEvent` |

---

## 🛠️ Tecnologias

### Frontend
| Tecnologia | Uso |
|---|---|
| **React 18** | Framework de UI com hooks |
| **TypeScript** | Tipagem estática (target ES2021) |
| **Vite** | Build tool + dev server |
| **Tailwind CSS** | Estilização utility-first |
| **shadcn/ui** | Componentes acessíveis (Radix UI) |
| **React Router v6** | Roteamento SPA protegido |
| **React Hook Form + Zod** | Formulários com validação de schema |
| **TanStack Query** | Cache e sincronização de dados servidor |
| **@marsidev/react-turnstile** | Cloudflare Turnstile anti-bot |

### Backend (Supabase)
| Serviço | Uso |
|---|---|
| **Supabase Auth** | Autenticação JWT |
| **PostgreSQL + RLS** | Banco com políticas de acesso por linha |
| **Supabase RPC** | Funções server-side (correção, logs, gestão) |

### Infraestrutura
| Ferramenta | Uso |
|---|---|
| **Vercel** | Hospedagem com CDN global + security headers |
| **Cloudflare Turnstile** | Proteção anti-bot no login/cadastro (gratuito) |
| **GitHub Actions** | CI/CD (3 pipelines) |
| **SonarCloud** | SAST — análise estática de segurança |
| **Dependabot** | Monitoramento de vulnerabilidades em dependências |

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                      USUÁRIO (Browser)                       │
│  Cloudflare Turnstile  ←→  Formulários de Login/Cadastro    │
│  MobileBlock Guard     ←→  Aplicação React                  │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS (HSTS Preload 2 anos)
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL (CDN Global)                       │
│  Security Headers (CSP, HSTS, X-Frame-Options, ...)         │
│  Rewrite SPA · Cache imutável para assets                   │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS (TLS 1.3)
                            ↓
┌─────────────────────────────────────────────────────────────┐
│               SUPABASE (Backend-as-a-Service)                │
│  Auth (JWT) · PostgreSQL · RLS (38 políticas)               │
│  RPC (gabarito server-side) · Realtime WebSocket            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Infraestrutura e Deploy

### Vercel

A aplicação é hospedada na Vercel com CDN global. Headers de segurança configurados via `vercel.json`:

- **HSTS Preload** — `max-age=63072000` (2 anos) força HTTPS
- **CSP** — restringe scripts, estilos e conexões às origens permitidas
- **X-Frame-Options: DENY** — bloqueia clickjacking
- **Permissions-Policy** — desabilita câmera, microfone, geolocalização, pagamento
- **Cache imutável** — assets versionados cacheados por 1 ano

### Cloudflare Turnstile

Integrado nos formulários de login/cadastro. Bloqueia bots automatizados antes que cheguem ao Supabase Auth. Totalmente gratuito e compatível com LGPD (sem rastreamento).

Para ativar com sitekey real:
1. Acesse [dash.cloudflare.com](https://dash.cloudflare.com) → **Turnstile → Add site**
2. Informe o domínio `cyber-access-shield.vercel.app`
3. Copie a **Site Key**
4. No Vercel: **Settings → Environment Variables → `VITE_TURNSTILE_SITE_KEY`**

---

## ⚙️ Configuração do Ambiente

### Pré-requisitos
- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **Git**

### Instalação

```bash
git clone https://github.com/Cleberbrant/cyber-access-shield.git
cd cyber-access-shield
npm install
npm run dev
```

O servidor estará em `http://localhost:8080`.

### Variáveis de Ambiente

Crie `.env.local` na raiz (veja `.env.example`):

```env
# Cloudflare Turnstile — obtenha em dash.cloudflare.com → Turnstile
# Chave de teste (sempre passa): 1x00000000000000000000AA
VITE_TURNSTILE_SITE_KEY=sua_sitekey_aqui
```

> As credenciais do Supabase estão hardcoded em `src/integrations/supabase/client.ts` (chave pública `anon` — prática padrão).

---

## 📦 Scripts Disponíveis

| Script | Comando | Descrição |
|---|---|---|
| **dev** | `npm run dev` | Dev server com HMR (porta 8080) |
| **build** | `npm run build` | Build de produção |
| **preview** | `npm run preview` | Preview local do build |
| **lint** | `npm run lint` | ESLint com plugins de segurança |
| **test** | `npm run test` | Testes unitários (Vitest) |
| **test:coverage** | `npm run test:coverage` | Testes + relatório de cobertura LCOV |
| **dev:desktop** | `npm run dev:desktop` | App desktop (Electron) em modo dev contra o Vite |
| **build:desktop** | `npm run build:desktop` | Gera `.exe` portátil em `release/` (electron-builder) |

---

## 🖥️ Versão Desktop (Electron)

A branch `feature/electron-desktop` empacota a plataforma como **app Windows portátil** (`.exe` único, sem instalação), onde as proteções anti-fraude passam a ser garantidas em nível de SO/janela:

- **Kiosk total durante a prova**: fullscreen kiosk + `alwaysOnTop` + `setContentProtection` (screenshots/gravações saem pretas) + bloqueio de atalhos (`PrintScreen`, `F12`, `Ctrl+Shift+I`, `Ctrl+U`, `Ctrl+R`, `F5`, `Ctrl+W`, `F11`, `Alt+F4`) + bloqueio de fechar janela.
- **Hardening Electron**: `contextIsolation`, `sandbox`, `nodeIntegration: false`, DevTools desabilitado em produção, instância única, navegação externa e `window.open` negados, permissões (câmera/mic/geo) negadas, IPC com validação de origem.
- **Protocolo `app://` custom** servindo o build do Vite com fallback SPA e CSP via header (sem Turnstile — desnecessário em ambiente desktop controlado; a versão web mantém).
- **Limitações documentadas**: `Alt+Tab`, combos com tecla `Win` e `Ctrl+Alt+Del` não são bloqueáveis sem driver/hook nativo — o escape é mitigado por refocus automático + sistema de 3 avisos (violação registrada em `security_logs`).
- **SmartScreen**: o `.exe` não é assinado digitalmente; o Windows mostra aviso no primeiro uso ("Mais informações" → "Executar assim mesmo"). Inevitável sem certificado de code signing.

---

## 🔐 Segurança e SSDLC

### Análise Estática — SonarCloud
- Quality Gate "Sonar way" obrigatório (Security A, Reliability A, Maintainability A)
- Security Hotspots 100% revisados
- Integrado ao CI via `SONAR_TOKEN` secret no GitHub

### ESLint com Plugins de Segurança
```
eslint-plugin-security     — padrões inseguros (eval, regex DoS, timing attacks)
eslint-plugin-no-secrets   — prevenção de secrets hardcoded
```

### Boas Práticas Implementadas
- ✅ `crypto.getRandomValues()` para geração de senhas (não `Math.random()`)
- ✅ Regex sem ReDoS
- ✅ `sanitizeInput()` via DOM textContent
- ✅ `Number.parseInt()` / `Number.isNaN()` (ES2021)
- ✅ SHA pinning em todas as GitHub Actions
- ✅ RLS em 7 tabelas (38 políticas)
- ✅ Gabarito server-side — `correct_answer` nunca exposta ao cliente
- ✅ Admin sempre verificado via Supabase (nunca localStorage)
- ✅ `console.*` removidos em produção via `esbuild.drop`
- ✅ Source maps desabilitados em produção

---

## 🚦 CI/CD e Pipelines

| Pipeline | Arquivo | Trigger | Etapas |
|---|---|---|---|
| **CI — Lint & Build** | `ci.yml` | Push `main`/`develop`, PRs | ESLint → Testes → TypeCheck → Build |
| **SonarCloud Analysis** | `sonarcloud.yml` | Push `main`, PRs | Testes → Cobertura → SAST |
| **Dependency Audit** | `dependency-audit.yml` | Semanal + push/PRs | `npm audit --audit-level=high` |

---

## 📁 Estrutura do Projeto

```
cyber-access-shield/
├── .github/workflows/          # Pipelines CI/CD
├── docs/                       # Relatórios do TCC
│   ├── relatorio_tecnologias.md
│   └── relatorio_seguranca_infraestrutura.md
├── public/
│   ├── favicon.svg             # Ícone da aplicação (escudo)
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── auth-form/
│   │   │   └── TurnstileWidget.tsx   # Cloudflare Turnstile
│   │   ├── MobileBlock.tsx           # Bloqueio de dispositivos móveis
│   │   └── ui/                       # shadcn/ui
│   ├── hooks/                  # Anti-fraude hooks
│   │   ├── useAssessmentProtection.ts
│   │   ├── useKeyboardProtection.ts
│   │   ├── useMouseProtection.ts
│   │   ├── useWindowBlurProtection.ts
│   │   └── useDevToolsDetection.ts
│   ├── pages/                  # Páginas da aplicação
│   ├── integrations/supabase/  # Client e tipos do Supabase
│   └── utils/                  # Funções de segurança e utilidades
├── supabase/sql/               # Migrations SQL (RLS, funções RPC)
├── .env.example                # Variáveis de ambiente documentadas
├── vercel.json                 # Configuração de deploy e security headers
├── sonar-project.properties    # Configuração SonarCloud
├── vite.config.ts              # Build + headers de desenvolvimento
└── eslint.config.js            # ESLint com plugins de segurança
```

---

## 📚 Documentação

Os relatórios do TCC estão na pasta [`docs/`](docs/):

| Documento | Conteúdo |
|---|---|
| [`relatorio_tecnologias.md`](docs/relatorio_tecnologias.md) | Stack, arquitetura, componentes, mapeamento OWASP, justificativas técnicas |
| [`relatorio_seguranca_infraestrutura.md`](docs/relatorio_seguranca_infraestrutura.md) | SAST, SCA, CI/CD, headers HTTP, proteções, resultados, SAMM |

---

## 👥 Autores

Projeto desenvolvido como TCC na **Universidade de Brasília (UnB)**.

- **Cleber de Oliveira Brant** — [LinkedIn](https://www.linkedin.com/in/cleberbrant/)
- **Pedro Rodrigues** — [LinkedIn](https://www.linkedin.com/in/pedro-prp/)

---

## 📄 Licença

Este projeto é parte de um trabalho acadêmico da UnB.
