# Relatório de Tecnologias — Cyber Access Shield

## 1. Visão Geral da Stack Tecnológica

O **Cyber Access Shield** é uma aplicação web do tipo **SPA (Single Page Application)** com arquitetura **cliente-servidor**. O frontend é desenvolvido em **React com TypeScript**, enquanto o backend utiliza **Supabase** como plataforma BaaS (Backend as a Service), provendo autenticação, banco de dados PostgreSQL e políticas de segurança (RLS).

```
┌──────────────────────────────────────────────────┐
│                    Frontend                       │
│          React 18 + TypeScript + Vite             │
│     shadcn/ui + Tailwind CSS + React Router       │
├──────────────────────────────────────────────────┤
│                 Supabase SDK                      │
│          (@supabase/supabase-js)                  │
└───────────────────┬──────────────────────────────┘
                    │ HTTPS (REST + WebSocket)
┌───────────────────┴──────────────────────────────┐
│                  Supabase Cloud                   │
│   Auth │ PostgreSQL │ RLS │ RPC │ Storage         │
└──────────────────────────────────────────────────┘
```

---

## 2. Frontend

### 2.1. React 18

**React** é uma biblioteca JavaScript para construção de interfaces de usuário declarativas e baseadas em componentes. A versão 18 traz melhorias como:

- **Concurrent Rendering**: renderização não-bloqueante para melhor responsividade;
- **Automatic Batching**: agrupamento automático de atualizações de estado;
- **Hooks**: API moderna para lógica de estado e efeitos colaterais sem classes.

**Justificativa no projeto**: React foi escolhido pela maturidade do ecossistema, documentação extensa, e amplo suporte de bibliotecas de componentes como shadcn/ui. A arquitetura baseada em hooks permite encapsular lógicas complexas de proteção anti-fraude em hooks reutilizáveis (`useKeyboardProtection`, `useMouseProtection`, etc.).

### 2.2. TypeScript

**TypeScript** é um superset tipado de JavaScript que compila para JavaScript. Adiciona:

- **Tipagem estática**: detecção de erros em tempo de compilação;
- **Inference de tipos**: reduz verbosidade mantendo segurança de tipos;
- **Interfaces e generics**: modelagem robusta de dados e contratos.

**Justificativa no projeto**: TypeScript é essencial para a qualidade do código em um projeto com múltiplas camadas de proteção. O sistema de tipos garante que funções de segurança recebam parâmetros corretos, previne erros comuns (null pointer, tipos incorretos) e facilita refatorações seguras.

**Configuração**: O projeto utiliza `ES2021` como target para suportar APIs modernas como `String.prototype.replaceAll()` e `Number.parseInt()`.

### 2.3. Vite

**Vite** é uma ferramenta de build moderna para projetos web que oferece:

- **Hot Module Replacement (HMR)**: atualização instantânea durante desenvolvimento;
- **ESBuild** para transformação ultrarrápida de TypeScript;
- **Rollup** para bundling otimizado em produção;
- **Suporte nativo** a TypeScript, CSS Modules, e aliases de caminho.

**Justificativa no projeto**: Vite foi escolhido pela velocidade de desenvolvimento (HMR em milissegundos), suporte nativo a TypeScript sem configuração adicional, e capacidade de configurar headers de segurança HTTP diretamente no dev server.

**Configuração relevante**:
- Servidor de desenvolvimento na porta 8080;
- Headers de segurança (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`); em produção: CSP, HSTS, X-XSS-Protection;
- Build de produção: `esbuild.drop: ['console', 'debugger']` + source maps desabilitados;
- Path alias `@/` mapeado para `src/`.

### 2.4. Tailwind CSS

**Tailwind CSS** é um framework CSS utilitário (utility-first) que permite estilização diretamente no HTML/JSX através de classes:

- **Utility classes**: `flex`, `p-4`, `bg-blue-500`, etc.;
- **Responsividade**: prefixos como `md:`, `lg:` para breakpoints;
- **Dark mode**: suporte nativo com classe `dark:`;
- **Purge automático**: remove classes não utilizadas no build de produção.

**Justificativa no projeto**: Tailwind permite desenvolvimento rápido de interfaces sem gerenciamento de arquivos CSS separados. A integração com shadcn/ui garante consistência visual.

### 2.5. shadcn/ui

**shadcn/ui** é uma coleção de componentes React construídos sobre **Radix UI** (primitivos acessíveis) estilizados com Tailwind CSS. Diferente de bibliotecas tradicionais de UI (Material UI, Ant Design), shadcn/ui:

- Copia os componentes para o projeto (não é uma dependência npm);
- Permite customização total do código;
- Garante acessibilidade via Radix UI primitives;
- Utiliza **class-variance-authority (CVA)** para variantes de estilo.

**Componentes utilizados no projeto**: Button, Card, Dialog, Table, Badge, Alert, Pagination, Command, Skeleton, Toast, Tooltip, entre outros.

**Justificativa no projeto**: A acessibilidade built-in dos componentes Radix UI e a flexibilidade de customização foram fatores decisivos. Componentes como [Badge](file:///d:/cyber-access-shield/src/components/ui/badge.tsx#30-35) são usados para exibir severidade de eventos de fraude, e [Dialog](file:///d:/cyber-access-shield/src/components/ui/command.tsx#26-37) para confirmações de ações administrativas.

### 2.6. React Router

**React Router** (v6) gerencia o roteamento client-side da SPA:

- Navegação sem recarregamento de página;
- Proteção de rotas por autenticação e perfil;
- Extração de parâmetros de URL (ex: `assessmentId`).

**Rotas do projeto**:
| Rota | Página | Acesso |
|------|--------|--------|
| `/` | Landing Page | Pública |
| `/login` | Login | Pública |
| `/register` | Registro | Pública |
| `/dashboard` | Dashboard | Autenticada |
| `/assessment/:id` | Avaliação (protegida) | Aluno |
| `/assessment-result/:id` | Resultado | Autenticada |
| `/create-assessment` | Criação de avaliação | Admin |
| `/fraud-logs` | Logs de fraude | Admin |
| `/user-management` | Gestão de usuários | Admin |

### 2.7. Bibliotecas Complementares do Frontend

| Biblioteca | Versão | Uso |
|-----------|--------|-----|
| `react-hook-form` | ^7.x | Gerenciamento de formulários com performance otimizada |
| `zod` | ^3.x | Validação de esquemas com inferência de tipos TypeScript |
| `@hookform/resolvers` | ^3.x | Integração entre react-hook-form e zod |
| `recharts` | ^2.x | Gráficos interativos no dashboard administrativo |
| `@tanstack/react-query` | ^5.x | Cache, sincronização e gerenciamento de estado servidor |
| `lucide-react` | ^0.x | Ícones SVG otimizados |
| `date-fns` | ^3.x | Manipulação e formatação de datas |
| `sonner` | ^1.x | Notificações toast |

---

## 3. Backend — Supabase

### 3.1. O que é Supabase

**Supabase** é uma plataforma open-source de Backend as a Service (BaaS) que fornece:

- **Banco de dados PostgreSQL** gerenciado;
- **Autenticação** (email/senha, OAuth, magic links);
- **Row Level Security (RLS)** — políticas de acesso a nível de linha;
- **Funções RPC** — funções server-side em PL/pgSQL;
- **API REST automática** gerada a partir do schema do banco;
- **Realtime** — subscriptions WebSocket para dados em tempo real;
- **Storage** — armazenamento de arquivos.

### 3.2. Autenticação (Supabase Auth)

O sistema utiliza autenticação por **email e senha** via Supabase Auth. O fluxo:

1. Usuário submete credenciais no formulário;
2. Supabase Auth valida e retorna um **JWT** (JSON Web Token);
3. O JWT é armazenado no cliente e enviado em todas as requisições;
4. O PostgreSQL valida o JWT e aplica as políticas RLS.

### 3.3. Row Level Security (RLS)

RLS é um mecanismo do PostgreSQL que permite definir **políticas de acesso por linha**. No projeto:

- **Alunos**: podem ver apenas suas próprias sessões, respostas e resultados;
- **Administradores**: podem acessar todas as avaliações, sessões, logs de fraude e dados de usuários;
- **Políticas de escrita**: alunos só podem inserir respostas para suas próprias sessões.

### 3.4. Funções RPC (Remote Procedure Calls)

Funções PL/pgSQL executadas no servidor para operações que requerem lógica complexa ou permissões elevadas:

- `submit_and_grade_assessment` — correção de avaliações server-side (compara respostas com gabarito no banco, calcula score, finaliza sessão);
- `insert_security_log` — registro de eventos de segurança com captura automática de IP;
- Gestão de usuários (ativação/desativação, reset de senha);
- Cálculo de estatísticas;
- Operações que envolvem múltiplas tabelas com verificação de permissão.

### 3.5. Modelo de Dados (Tabelas Principais)

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Perfis de usuários (nome, tipo, status) |
| `assessments` | Avaliações criadas por administradores |
| `questions` | Questões vinculadas a avaliações |
| `assessment_sessions` | Sessões de avaliação por aluno |
| `user_answers` | Respostas dos alunos |
| `fraud_logs` | Eventos de segurança (tentativas de fraude) |
| `user_management_logs` | Logs de auditoria de ações administrativas |

---

## 4. Ferramentas de Qualidade e DevOps

### 4.1. Vitest

**Vitest** é o framework de testes unitários do projeto. Integração nativa com Vite, compatível com a API do Jest.

- **Provider de cobertura**: `@vitest/coverage-v8` — instrumentação via V8 coverage do Node.js;
- **Formato de saída**: LCOV (para importação pelo SonarCloud) e texto (para logs do CI);
- **Ambiente**: Node (funções puras não requerem DOM);
- **Total de testes**: 126 testes em 7 arquivos.

### 4.2. ESLint

**ESLint** é o linter JavaScript/TypeScript do projeto, configurado com:

| Plugin | Descrição |
|--------|-----------|
| `@typescript-eslint` | Regras específicas para TypeScript |
| `eslint-plugin-react-hooks` | Validação de regras de hooks do React |
| `eslint-plugin-react-refresh` | Compatibilidade com Vite HMR |
| `eslint-plugin-security` | Detecção de padrões inseguros |
| `eslint-plugin-no-secrets` | Prevenção de secrets no código |

### 4.3. SonarCloud

Plataforma de análise estática na nuvem que avalia:

- **Segurança**: vulnerabilidades e security hotspots;
- **Confiabilidade**: bugs que podem causar comportamento inesperado;
- **Manutenibilidade**: code smells, complexidade ciclomática, duplicações;
- **Cobertura**: percentual de linhas/branches cobertos por testes.

### 4.4. GitHub Actions

Plataforma de CI/CD integrada ao GitHub. O projeto utiliza 3 workflows:

1. **CI — Lint & Build**: lint → testes → type check → build;
2. **Security — SonarCloud Analysis**: testes → cobertura → análise estática;
3. **Security — Dependency Audit**: `npm audit` semanal + a cada push.

---

## 5. APIs Web Utilizadas para Proteção Anti-Fraude

O sistema de proteção anti-fraude utiliza diversas **Web APIs** nativas do navegador:

| API | Uso no Projeto |
|-----|---------------|
| `document.addEventListener('keydown')` | Interceptar e bloquear atalhos de teclado (Ctrl+C, F12, PrintScreen) |
| `document.addEventListener('contextmenu')` | Bloquear menu de contexto (clique direito) |
| `document.addEventListener('copy/cut/paste')` | Interceptar operações de clipboard |
| `window.addEventListener('blur/focus')` | Detectar quando o usuário sai/retorna à janela |
| `window.addEventListener('beforeunload')` | Mostrar popup de confirmação ao sair |
| `document.addEventListener('visibilitychange')` | Detectar troca de aba |
| `window.getComputedStyle()` / `element.offsetHeight` | Detectar abertura do DevTools (mudança de viewport) |
| `crypto.getRandomValues()` | Geração criptograficamente segura de senhas temporárias |
| `navigator.clipboard` | Tentativa de acesso ao clipboard (monitoramento) |
| `CSS user-select: none` | Impedir seleção de texto por CSS |

---

## 6. Diagrama de Dependências

```
               ┌─── react-hook-form ─── @hookform/resolvers ─── zod
               │
               ├─── @tanstack/react-query
               │
react ─────────┼─── react-router-dom
               │
               ├─── recharts
               │
               └─── shadcn/ui ─── radix-ui ─── class-variance-authority
                                └─── tailwind-merge ─── clsx

vite ──────────┼─── @vitejs/plugin-react-swc
               └─── tailwindcss + autoprefixer + postcss

supabase ──────── @supabase/supabase-js

testes ────────── vitest + @vitest/coverage-v8

linting ───────── eslint + typescript-eslint + security + no-secrets

análise ───────── SonarCloud (via sonarqube-scan-action)
```

---

## 7. Versões do Ambiente

| Componente | Versão |
|-----------|--------|
| Node.js | ≥ 18.x |
| npm | ≥ 9.x |
| TypeScript | ~5.6.x |
| React | ^18.3.x |
| Vite | ^5.4.x |
| Tailwind CSS | ^3.4.x |
| Supabase JS SDK | ^2.x |
| Vitest | ^3.x |
| ESLint | ^9.x |
| Target ECMAScript | ES2021 |
