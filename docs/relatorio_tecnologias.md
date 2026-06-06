# Relatório Tecnológico — Cyber Access Shield
**TCC — Plataforma de Avaliações Seguras**  
Autores: Cleber Brant & Pedro  
Data: Junho de 2026

---

## 1. Contextualização do Projeto

O **Cyber Access Shield** é uma plataforma web de avaliações acadêmicas com foco em segurança, desenvolvida como Trabalho de Conclusão de Curso (TCC). O sistema abrange dois eixos:

- **Segurança no ambiente avaliativo**: proteção contra fraudes durante a realização de provas (cópia, troca de aba, DevTools, captura de tela).
- **Segurança da plataforma**: conformidade com OWASP Top 10, controle de acesso, testes automatizados e SAST contínuo.

**URL de produção**: [https://cyber-access-shield.vercel.app](https://cyber-access-shield.vercel.app)

---

## 2. Stack Tecnológica

```
┌─────────────────────────────────────────────────────────────┐
│                      USUÁRIO (Browser)                       │
│  Turnstile (anti-bot) → Formulário de Login/Cadastro         │
│  Bloqueio de Mobile → MobileBlock Component                  │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS (HSTS Preload)
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL (CDN Global)                       │
│  Security Headers · Rewrite SPA · Cache Imutável            │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS (TLS 1.3)
                            ↓
┌─────────────────────────────────────────────────────────────┐
│               SUPABASE (Backend-as-a-Service)                │
│  PostgreSQL · Auth · RLS · PostgREST · RPC · Realtime        │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Frontend

### 3.1 React 18 + TypeScript

**React 18** foi escolhido pela maturidade do ecossistema, suporte a hooks e modelo de componentes funcional — ideal para encapsular lógica de proteção anti-fraude em hooks reutilizáveis (`useKeyboardProtection`, `useMouseProtection`, `useDevToolsDetection`, etc.).

**TypeScript** adiciona tipagem estática, eliminando erros em compilação e garantindo que dados sensíveis (gabarito de questões) nunca sejam passados a componentes sem necessidade.

Configuração relevante: `target: ES2021` para suportar `replaceAll()`, `Number.parseInt()`, `Number.isNaN()`.

### 3.2 Vite

Build tool de nova geração com HMR, bundling via Rollup e remoção automática de `console.*` e `debugger` via `esbuild.drop` em builds de produção — impedindo exposição de diagnósticos. Source maps desabilitados em produção.

### 3.3 Tailwind CSS + shadcn/ui

Tailwind elimina CSS global arbitrário. shadcn/ui provê componentes acessíveis baseados em Radix UI com ARIA attributes por padrão. Todos os componentes existem como código no repositório (não como dependência npm), permitindo auditoria completa.

### 3.4 React Router v6

Gerencia roteamento SPA com proteção de rotas por autenticação e perfil (admin/aluno). Garante que páginas administrativas só sejam acessíveis com sessão de admin válida no Supabase.

### 3.5 TanStack Query (React Query)

Gerencia cache de dados do servidor com invalidação automática. Previne que dados stale (ex: status de admin) sejam exibidos após expiração de sessão.

### 3.6 Bibliotecas de Segurança e Proteção

| Biblioteca | Versão | Uso |
|---|---|---|
| `@marsidev/react-turnstile` | ^0.x | Widget Cloudflare Turnstile anti-bot no login |
| `zod` | ^3.x | Validação de schemas com inferência de tipos |
| `react-hook-form` | ^7.x | Formulários sem re-renders desnecessários |

---

## 4. Backend — Supabase

### 4.1 PostgreSQL + Row Level Security (RLS)

RLS define políticas de acesso por linha no próprio banco:
- **Alunos**: acessam apenas suas sessões, respostas e resultados
- **Admins**: acesso irrestrito a avaliações, logs e usuários

7 tabelas com RLS + 38 políticas configuradas. Views com `security_barrier = true` para administração de usuários.

### 4.2 Funções RPC (Remote Procedure Calls)

| Função | Finalidade |
|---|---|
| `submit_and_grade_assessment` | Correção server-side — gabarito nunca sai do banco |
| `insert_security_log` | Registra eventos de fraude com captura automática de IP |
| Funções de gestão | Ativação/desativação, reset de senha, verificação de admin |

### 4.3 Supabase Auth

Autenticação por email/senha com JWT. O JWT é validado pelo PostgreSQL em cada requisição para aplicar as políticas RLS. Tokens de sessão gerenciados via `localStorage` com refresh automático.

### 4.4 Índices de Performance

Índices aplicados via migration para otimizar consultas frequentes:
```sql
CREATE INDEX idx_assessments_created_by ON assessments(created_by);
CREATE INDEX idx_user_answers_question_id ON user_answers(question_id);
```

---

## 5. Infraestrutura e Deploy

### 5.1 Vercel

A aplicação é hospedada na **Vercel** com CDN em 40+ regiões globais. O arquivo `vercel.json` centraliza toda a configuração de segurança de produção:

**Headers de segurança configurados:**

| Header | Valor | Proteção |
|---|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | HSTS — força HTTPS por 2 anos |
| `Content-Security-Policy` | (ver abaixo) | Controle de origens de scripts/estilos/conexões |
| `X-Frame-Options` | `DENY` | Bloqueia iframe (clickjacking) |
| `X-Content-Type-Options` | `nosniff` | Bloqueia MIME sniffing |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=()` | Desabilita APIs sensíveis |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limita dados de referência |

**CSP configurada (produção):**
```
default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: https:;
connect-src 'self' https://*.supabase.co wss://*.supabase.co;
frame-ancestors 'none';
base-uri 'self';
form-action 'self'
```

**Rewrite para SPA:**
```json
{ "source": "/(.*)", "destination": "/index.html" }
```

**Cache de assets:** arquivos com hash (gerados pelo Vite) são cacheados por 1 ano com `immutable`.

### 5.2 Cloudflare Turnstile

O **Cloudflare Turnstile** substitui CAPTCHAs tradicionais nos formulários de login e cadastro. Características:

- Verificação invisível (sem "selecione os semáforos")
- Sem rastreamento de usuário — compatível com LGPD/GDPR
- Totalmente gratuito
- Bloqueia bots automatizados que não renderizam JavaScript

**Fluxo de verificação:**
```
Usuário preenche formulário
       ↓
Cloudflare analisa comportamento (JS, timing, mouse)
       ↓
Token válido → formulário liberado para submissão
Token inválido / expirado → submissão bloqueada
```

**Arquitetura do componente:**
```typescript
// src/components/auth-form/TurnstileWidget.tsx
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? "1x00000000000000000000AA";

export function TurnstileWidget({ onSuccess, onExpire, onError }) {
  return <Turnstile siteKey={SITE_KEY} onSuccess={onSuccess}
                    onExpire={onExpire} onError={onError}
                    options={{ theme: "auto", language: "pt-BR" }} />;
}
```

O token é armazenado em estado React e verificado antes de qualquer chamada ao Supabase Auth. Ao expirar, o estado é invalidado automaticamente.

---

## 6. Proteções Anti-Fraude

### 6.1 Bloqueio de Dispositivos Móveis

Um componente `MobileBlock` envolve toda a aplicação e redireciona usuários de dispositivos móveis para uma tela de aviso. A detecção usa dois critérios combinados:

```typescript
const MOBILE_UA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
function isMobileDevice(): boolean {
  return MOBILE_UA.test(navigator.userAgent) || window.innerWidth < 768;
}
```

A plataforma é exclusiva para desktop — requisito do ambiente de avaliação formal.

### 6.2 Hooks de Proteção Durante a Avaliação

| Hook | Proteção |
|---|---|
| `useKeyboardProtection` | Bloqueia Ctrl+C, Ctrl+V, Ctrl+P, PrintScreen, F12, Ctrl+Shift+I |
| `useMouseProtection` | Desabilita clique direito e menu de contexto |
| `useWindowBlurProtection` | Detecta e registra troca de aba/janela |
| `useDevToolsDetection` | Threshold de 129px + detecção Firebug |
| `useBeforeUnloadProtection` | Popup de confirmação ao tentar fechar |

### 6.3 Bloqueio Pre-React

Atalhos críticos (F12, Ctrl+Shift+I, Ctrl+U, clique direito) são bloqueados por um script inline no `index.html` que executa **antes** do React montar — impossível de bypassar desabilitando o bundle.

### 6.4 Gabarito Server-Side

A coluna `correct_answer` nunca é enviada ao frontend. A RPC `submit_and_grade_assessment` compara respostas com o gabarito no PostgreSQL e retorna apenas o score final. Alunos não podem inspecionar o gabarito via DevTools.

---

## 7. Qualidade e Testes

### 7.1 Testes Unitários (Vitest)

126 testes em 7 arquivos cobrindo funções puras de segurança e utilidades:

| Arquivo | Testes | Cobertura |
|---|---|---|
| `user-utils.ts` | 54 | 87% |
| `fraud-logs-utils.ts` | 29 | 100% |
| `assessment-availability.ts` | 12 | 93% |
| `session-progress.ts` | 10 | 100% |
| `secure-utils.ts` | 13 | 90%+ |
| `lib/utils.ts` + `date-utils.ts` | 8 | 100% |

### 7.2 SonarCloud (SAST)

Quality Gate "Sonar way" obrigatório: Security A, Reliability A, Maintainability A, 100% Security Hotspots revisados. Integrado ao CI via GitHub Actions com token `SONAR_TOKEN` como secret do repositório.

### 7.3 ESLint com Plugins de Segurança

`eslint-plugin-security` detecta padrões inseguros (eval, regex DoS). `eslint-plugin-no-secrets` previne tokens hardcoded.

---

## 8. CI/CD (GitHub Actions)

| Pipeline | Trigger | Etapas |
|---|---|---|
| **CI — Lint & Build** | Push em `main`/`develop`, PRs | ESLint → Testes → TypeCheck → Build |
| **SonarCloud Analysis** | Push em `main`, PRs | Testes → Cobertura → SAST |
| **Dependency Audit** | Semanal + push/PRs | `npm audit --audit-level=high` |

Todas as Actions são pinadas por SHA completo (supply chain security). Dependabot configurado para monitoramento mensal.

---

## 9. Mapeamento OWASP Top 10 (2021)

| OWASP | Categoria | Mitigações no Projeto |
|---|---|---|
| A01 | Broken Access Control | RLS em 7 tabelas, rotas protegidas, admin verificado server-side |
| A02 | Cryptographic Failures | HTTPS obrigatório (HSTS Preload 2 anos), senhas via `crypto.getRandomValues()` |
| A03 | Injection | CSP bloqueando origens externas, `sanitizeInput()`, Zod validation, `COALESCE` SQL |
| A04 | Insecure Design | Gabarito server-side, sessão com tempo limite, verificação pre-React |
| A05 | Security Misconfiguration | `vercel.json` centraliza headers, source maps desabilitados, `console.*` removidos |
| A06 | Vulnerable Components | `npm audit` no CI, Dependabot, npm overrides, 0 vulnerabilidades ativas |
| A07 | Auth Failures | Turnstile anti-bot, DevTools bloqueado no login, JWT com Supabase Auth |
| A08 | Integrity Failures | SHA pinning nas Actions, remoção de scripts externos (gptengineer.js) |
| A09 | Logging & Monitoring | `fraud_logs` + `user_management_logs` no banco |
| A10 | SSRF | CSP `connect-src` restrito ao Supabase |

---

## 10. Limitações e Trabalhos Futuros

1. **Verificação server-side do Turnstile**: implementar Edge Function no Supabase que valide o token via API da Cloudflare antes de processar o login.
2. **WAF Cloudflare com domínio customizado**: ao adquirir domínio, o proxy Cloudflare ativa WAF, rate limiting e DDoS protection como camada adicional antes do Vercel.
3. **Cloudflare Web Analytics**: analytics sem cookies e compatível com LGPD.
4. **DAST**: testes dinâmicos de segurança (ex: OWASP ZAP) não implementados.
5. **MFA**: disponível no Supabase mas não habilitado.
6. **Code splitting**: bundle atual ultrapassa 800 KB — divisão por `import()` dinâmico reduziria tempo de carregamento.
7. **Testes de componentes React**: React Testing Library para aumentar cobertura geral.
