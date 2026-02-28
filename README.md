# 🛡️ Cyber Access Shield

Plataforma de avaliação online segura desenvolvida como Trabalho de Conclusão de Curso (TCC) na **UnB - Universidade de Brasília**. O sistema garante a integridade de avaliações acadêmicas através de múltiplas camadas de proteção anti-fraude, ambiente de prova seguro e gestão administrativa completa.

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Cleberbrant_cyber-access-shield&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Cleberbrant_cyber-access-shield)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=Cleberbrant_cyber-access-shield&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=Cleberbrant_cyber-access-shield)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=Cleberbrant_cyber-access-shield&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=Cleberbrant_cyber-access-shield)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=Cleberbrant_cyber-access-shield&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=Cleberbrant_cyber-access-shield)

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Sistema de Defesas Anti-Fraude](#-sistema-de-defesas-anti-fraude)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Configuração do Ambiente](#-configuração-do-ambiente)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Segurança e SSDLC](#-segurança-e-ssdlc)
- [CI/CD e Pipelines](#-cicd-e-pipelines)
- [Estrutura do Projeto](#-estrutura-do-projeto)
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
- **Criação de avaliações** com questões objetivas e dissertativas
- **Configuração de parâmetros**: tempo máximo, número de tentativas, data de disponibilização
- **Correção automática** de questões objetivas
- **Painel de logs de fraude** com detalhes por aluno e por avaliação
- **Gestão de usuários**: ativação/desativação, reset de senha, alteração de permissões
- **Dashboard** com estatísticas gerais e métricas de uso
- **Logs de auditoria** de ações administrativas

### Para Alunos
- **Realização de avaliações** em ambiente seguro e protegido
- **Progresso salvo automaticamente** — recuperação em caso de queda de conexão
- **Visualização de resultados** após conclusão
- **Gestão de perfil** e alteração de senha

### Segurança da Plataforma
- **Autenticação** via Supabase Auth (email/senha)
- **Autorização baseada em perfis** (admin/aluno) com Row Level Security (RLS)
- **Senhas temporárias** com geração criptográfica (`crypto.getRandomValues`)
- **Validação de entrada** e sanitização contra XSS
- **Headers de segurança** (X-Content-Type-Options, X-Frame-Options, Referrer-Policy)

---

## 🔒 Sistema de Defesas Anti-Fraude

O sistema implementa múltiplas camadas de proteção ativadas durante a realização de avaliações:

| Proteção | Descrição | Hook Responsável |
|----------|-----------|-----------------|
| **Bloqueio de Teclado** | Impede Ctrl+C, Ctrl+V, Ctrl+P, PrintScreen, F12 e outros atalhos | `useKeyboardProtection` |
| **Bloqueio de Mouse** | Desabilita clique direito e menu de contexto | `useMouseProtection` |
| **Detecção de Blur/Focus** | Registra quando aluno sai da janela da avaliação (troca de aba/app) | `useWindowBlurProtection` |
| **Popup de Saída** | Alerta "beforeunload" ao tentar fechar/navegar durante avaliação | `useBeforeUnloadProtection` |
| **Prevenção de Captura** | Desabilita seleção de texto e cópia visual | `preventScreenCapture` |
| **Detecção de DevTools** | Identifica abertura de ferramentas de desenvolvedor | `detectDevTools` |
| **Registro de Eventos** | Todos os eventos de segurança são logados no banco de dados | `logSecurityEvent` |

### Regras de Ativação
- **Alunos**: Proteções de teclado/mouse ativas em todo o sistema autenticado
- **Administradores**: Sem proteções (para facilitar administração)
- **Detecção de blur/focus**: Ativa apenas durante avaliação em andamento
- **Popup de saída**: Ativa apenas dentro da rota `/assessment/:id`

### Painel de Logs de Fraude
Os administradores podem visualizar:
- Tipo de evento (cópia, troca de aba, DevTools, etc.)
- Severidade do evento (crítico, médio, baixo)
- Timestamp e IP mascarado do aluno
- Histórico por avaliação e por sessão

---

## 🛠️ Tecnologias

### Frontend
| Tecnologia | Uso |
|-----------|-----|
| **React 18** | Framework de UI |
| **TypeScript** | Tipagem estática |
| **Vite** | Build tool e dev server |
| **Tailwind CSS** | Estilização |
| **shadcn/ui** | Componentes de UI (Radix UI) |
| **React Router** | Roteamento SPA |
| **React Hook Form + Zod** | Formulários com validação |
| **Recharts** | Gráficos no dashboard |
| **TanStack Query** | Cache e gerenciamento de estado servidor |

### Backend (Supabase)
| Serviço | Uso |
|---------|-----|
| **Supabase Auth** | Autenticação de usuários |
| **Supabase Database** | PostgreSQL com Row Level Security |
| **Supabase RPC** | Funções server-side para operações seguras |
| **Row Level Security (RLS)** | Políticas de acesso por perfil |

### DevOps / Segurança
| Ferramenta | Uso |
|-----------|-----|
| **GitHub Actions** | CI/CD (lint, build, testes, auditoria) |
| **SonarCloud** | Análise estática de código (segurança, confiabilidade, manutenibilidade) |
| **Vitest + coverage-v8** | Testes unitários com cobertura |
| **ESLint + Security Plugins** | Linting com regras de segurança |

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────┐
│                   Frontend                   │
│            React + TypeScript + Vite         │
├─────────────┬───────────────┬───────────────┤
│   Pages     │  Components   │    Hooks      │
│  (rotas)    │   (shadcn)    │ (proteções)   │
├─────────────┴───────────────┴───────────────┤
│              Utils / Lib                     │
│   (validação, formatação, segurança)         │
├─────────────────────────────────────────────┤
│           Supabase Client SDK               │
└────────────────────┬────────────────────────┘
                     │ HTTPS
┌────────────────────┴────────────────────────┐
│              Supabase (Backend)              │
├──────────┬──────────┬───────────────────────┤
│   Auth   │   RLS    │     PostgreSQL        │
│ (login)  │(policies)│ (dados + RPC funcs)   │
└──────────┴──────────┴───────────────────────┘
```

---

## ⚙️ Configuração do Ambiente

### Pré-requisitos
- **Node.js** ≥ 18.x ([instalar com nvm](https://github.com/nvm-sh/nvm))
- **npm** ≥ 9.x
- **Git**
- Conta no **Supabase** (para o backend)

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/Cleberbrant/cyber-access-shield.git

# 2. Acesse o diretório
cd cyber-access-shield

# 3. Instale as dependências
npm install

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

O servidor de desenvolvimento estará disponível em `http://localhost:8080`.

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

> ⚠️ As variáveis de ambiente **com prefixo `VITE_`** são expostas ao cliente. Nunca inclua chaves de serviço (`service_role`) no frontend.

---

## 📦 Scripts Disponíveis

| Script | Comando | Descrição |
|--------|---------|-----------|
| **dev** | `npm run dev` | Servidor de desenvolvimento com hot-reload |
| **build** | `npm run build` | Build de produção otimizado |
| **preview** | `npm run preview` | Preview local do build de produção |
| **lint** | `npm run lint` | ESLint com regras de segurança |
| **test** | `npm run test` | Executa testes unitários (Vitest) |
| **test:coverage** | `npm run test:coverage` | Testes com relatório de cobertura (lcov) |

---

## 🔐 Segurança e SSDLC

O projeto segue princípios do **SAMM (Software Assurance Maturity Model)** para desenvolvimento seguro:

### Análise Estática (SonarCloud)
- **Integração contínua** via GitHub Actions
- **Quality Gate** obrigatório com padrão "Sonar way"
- Monitoramento de: segurança, confiabilidade, manutenibilidade, cobertura de testes
- **Security Hotspots** revisados e corrigidos

### ESLint com Plugins de Segurança
```
eslint-plugin-security     — Detecção de padrões inseguros (eval, regex DoS, etc.)
eslint-plugin-no-secrets   — Prevenção de secrets hardcoded no código
```

### Headers de Segurança
Configurados via `index.html` e `vite.config.ts`:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Boas Práticas Implementadas
- ✅ Geração de senhas com `crypto.getRandomValues()` (não `Math.random()`)
- ✅ Regex segura contra ReDoS
- ✅ Sanitização de entradas contra XSS
- ✅ Comparações NULL-safe com `COALESCE` no SQL
- ✅ `Number.parseInt()` / `Number.isNaN()` (padrão ES2021+)
- ✅ GitHub Actions pinned por SHA (supply chain security)
- ✅ Row Level Security (RLS) em todas as tabelas do Supabase

---

## 🚀 CI/CD e Pipelines

Três pipelines automatizadas rodam via GitHub Actions:

### 1. CI — Lint & Build (`ci.yml`)
- ✅ ESLint (com continue-on-error para regras de segurança)
- ✅ Testes unitários com cobertura
- ✅ TypeScript type check
- ✅ Build de produção

### 2. Security — SonarCloud Analysis (`sonarcloud.yml`)
- ✅ Testes com cobertura (gera `lcov.info`)
- ✅ SonarCloud scan com relatório de cobertura
- Triggers: push no `main`, PRs para `main`

### 3. Security — Dependency Audit (`dependency-audit.yml`)
- ✅ `npm audit` para verificar vulnerabilidades em dependências
- Triggers: semanal + push/PRs

---

## 📁 Estrutura do Projeto

```
cyber-access-shield/
├── .github/workflows/          # Pipelines CI/CD
│   ├── ci.yml                  # Lint, testes, build
│   ├── sonarcloud.yml          # Análise estática SonarCloud
│   └── dependency-audit.yml    # Auditoria de dependências
├── src/
│   ├── components/             # Componentes React (shadcn/ui + custom)
│   │   ├── assessment/         # Componentes de avaliação
│   │   └── ui/                 # Componentes base (shadcn)
│   ├── hooks/                  # Custom hooks
│   │   ├── useAssessmentProtection.ts   # Hook central de proteções
│   │   ├── useKeyboardProtection.ts     # Bloqueio de atalhos
│   │   ├── useMouseProtection.ts        # Bloqueio de mouse
│   │   ├── useWindowBlurProtection.ts   # Detecção de troca de janela
│   │   └── ...                 # Outros hooks (timer, submission, etc.)
│   ├── integrations/           # Configuração Supabase
│   ├── lib/                    # Utilitários base (cn)
│   ├── pages/                  # Páginas da aplicação
│   │   ├── LandingPage.tsx     # Página inicial pública
│   │   ├── LoginPage.tsx       # Login
│   │   ├── Dashboard.tsx       # Dashboard (admin/aluno)
│   │   ├── CreateAssessmentPage.tsx  # Criação de avaliações
│   │   ├── AssessmentPage.tsx  # Realização de avaliação (protegida)
│   │   ├── AssessmentResultPage.tsx  # Resultados
│   │   ├── FraudLogsPage.tsx   # Painel de logs de fraude
│   │   └── UserManagementPage.tsx    # Gestão de usuários
│   ├── types/                  # Definições TypeScript
│   └── utils/                  # Funções utilitárias
│       ├── secure-utils.ts     # Funções de segurança
│       ├── user-utils.ts       # Gestão de usuários
│       ├── fraud-logs-utils.ts # Formatação de logs
│       ├── assessment-availability.ts  # Disponibilidade
│       ├── session-progress.ts # Progresso de sessão
│       └── __tests__/          # Testes unitários
├── supabase/sql/               # Scripts SQL (RLS, funções RPC)
├── sonar-project.properties    # Configuração SonarCloud
├── vitest.config.ts            # Configuração de testes
├── eslint.config.js            # ESLint com plugins de segurança
├── vite.config.ts              # Configuração Vite + headers
└── tsconfig.app.json           # TypeScript (target ES2021)
```

---

## 👥 Autores

Projeto desenvolvido como TCC na **Universidade de Brasília (UnB)**.

- **Cleber de Oliveira Brant** — [LinkedIn](https://www.linkedin.com/in/cleberbrant/)
- **Pedro Rodrigues** — [LinkedIn](https://www.linkedin.com/in/pedro-prp/)

---

## 📄 Licença

Este projeto é parte de um trabalho acadêmico da UnB.
