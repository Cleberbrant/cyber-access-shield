# Relatório Tecnológico — Cyber Access Shield
**TCC — Plataforma de Avaliações Seguras**  
Autores: Cleber Brant & Pedro  
Data: Junho de 2026

---

## 1. Contextualização do Projeto

O **Cyber Access Shield** é uma plataforma de avaliações acadêmicas com foco em segurança, desenvolvida como Trabalho de Conclusão de Curso (TCC). O sistema abrange dois eixos:

- **Segurança no ambiente avaliativo**: proteção contra fraudes durante a realização de provas (cópia, troca de aba, DevTools, captura de tela).
- **Segurança da plataforma**: conformidade com OWASP Top 10, controle de acesso, testes automatizados e SAST contínuo.

O sistema é entregue em **duas modalidades** com a mesma base de código:

- **Web (Vercel)**: acesso via navegador, com a camada completa de proteções possíveis no browser.
- **Desktop (Electron)**: executável portátil para Windows que assume o controle do sistema operacional durante a prova (modo kiosk, bloqueio de monitores secundários, bloqueio de captura de tela) — eliminando vetores de fraude que nenhuma aplicação web consegue alcançar (ver seção 7).

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

> Na **modalidade desktop**, as duas primeiras camadas são substituídas pelo Electron: o mesmo bundle React é servido localmente por um protocolo próprio (`app://bundle`) e conversa direto com o Supabase via HTTPS. Detalhes na seção 7.

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
| `zod` | ^3.x | Validação de schemas com inferência de tipos |
| `react-hook-form` | ^7.x | Formulários sem re-renders desnecessários |

> **Nota**: o widget Cloudflare Turnstile é integrado via API vanilla (`window.turnstile.render()`), sem dependência de wrapper de terceiros — garante controle total sobre o ciclo de vida e evita problemas de inicialização assíncrona.

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
script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: https:;
connect-src 'self' https://*.supabase.co wss://*.supabase.co https://challenges.cloudflare.com;
frame-src 'self' https://challenges.cloudflare.com;
child-src 'self' https://challenges.cloudflare.com;
worker-src 'self' blob:;
frame-ancestors 'none';
base-uri 'self';
form-action 'self'
```

As entradas `challenges.cloudflare.com` permitem que o widget Turnstile carregue seus scripts e o iframe de verificação. `child-src` é fallback para browsers que não reconhecem `frame-src` separadamente. `worker-src blob:` permite workers internos do Cloudflare.

**Rewrite para SPA:**
```json
{ "source": "/(.*)", "destination": "/index.html" }
```

**Cache de assets:** arquivos com hash (gerados pelo Vite) são cacheados por 1 ano com `immutable`.

### 5.2 Cloudflare Turnstile

O **Cloudflare Turnstile** substitui CAPTCHAs tradicionais nos formulários de login e cadastro. Características:

- Modo **Managed**: Cloudflare decide automaticamente entre verificação silenciosa ou exibição de checkbox com base no risco de tráfego
- Sem rastreamento de usuário — compatível com LGPD/GDPR
- Totalmente gratuito
- Bloqueia bots automatizados que não renderizam JavaScript

**Configuração no Cloudflare Dashboard:**
- Widget configurado em: Cloudflare → Turnstile → Widget `0x4AAAAAADf7b3xJLToPr6-r`
- Hostname autorizado: `cyber-access-shield.vercel.app`
- Modo: Managed (Recommended)

**Fluxo de verificação:**
```
Usuário acessa /login ou /register
       ↓
Script Cloudflare carrega (index.html <head>)
       ↓
window.turnstile.render() inicializa widget
       ↓
Cloudflare analisa comportamento (JS, timing, fingerprint)
       ↓
Token gerado → onSuccess(token) → formulário liberado
Token inválido / expirado → submissão bloqueada
```

**Implementação via API vanilla (sem wrapper de terceiros):**
```typescript
// src/components/auth-form/TurnstileWidget.tsx
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

useEffect(() => {
  function tryRender() {
    if (!globalThis.turnstile) { setTimeout(tryRender, 100); return; }
    globalThis.turnstile.render(containerRef.current, {
      sitekey: SITE_KEY,
      theme: "auto",
      callback: (token) => { setStatus("success"); onSuccess(token); },
      "expired-callback": () => { setStatus("idle"); onExpire(); },
      "error-callback": () => { setStatus("error"); onError(); },
    });
  }
  tryRender();
}, []);
```

O script é carregado no `<head>` do `index.html` com `id="cf-turnstile-script"` e `?render=explicit` para controle manual do ciclo de vida. A variável de ambiente `VITE_TURNSTILE_SITE_KEY` é configurada no Vercel (Settings → Environment Variables → Production).

O token é armazenado em estado React e verificado antes de qualquer chamada ao Supabase Auth. Ao expirar, o estado é invalidado automaticamente.

**Contas de teste criadas no Supabase (para apresentação do TCC):**

| Perfil | Email |
|---|---|
| Professor (Admin) | `professor.teste@cyberaccessshield.com` |
| Aluno | `aluno.teste@cyberaccessshield.com` |

Ambas têm email pré-confirmado e perfil criado — prontas para uso imediato. As senhas são compartilhadas separadamente (fora do repositório).

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

## 7. Versão Desktop — Electron

### 7.1 Motivação

A versão web, mesmo com toda a camada de proteção implementada, opera dentro dos limites do navegador. Há vetores de fraude que **nenhuma aplicação web pode controlar**, por restrição de design dos próprios browsers:

| Vetor | Por que o browser não resolve |
|---|---|
| Segundo monitor | O browser não enxerga nem controla outros displays |
| Alt+Tab para outro aplicativo | Detectável (blur), mas não bloqueável nem revertível |
| PrintScreen / gravadores de tela | A página não pode impedir captura no nível do SO |
| Fechar a aba / abrir outra janela | `beforeunload` apenas exibe confirmação |
| Extensões do navegador | Executam com privilégios acima da página |

A migração para **Electron** resolve exatamente essa classe de problemas: o aplicativo passa a ter um processo nativo (Node.js) com acesso às APIs do sistema operacional, mantendo o mesmo frontend React no processo de renderização.

### 7.2 Processo de Migração

A decisão central foi **reaproveitar 100% da base de código web** — nenhum fork, nenhuma duplicação de telas ou lógica:

```
┌──────────────────────────────────────────────────────────────┐
│  MAIN PROCESS (Node.js) — electron/main.ts                   │
│  Janela · Kiosk · Atalhos globais · Overlays · Protocolo     │
└──────────────────────────┬───────────────────────────────────┘
                           │ IPC (canais fixos, sender validado)
                           ↓ contextBridge (preload sandboxed)
┌──────────────────────────────────────────────────────────────┐
│  RENDERER (Chromium sandboxed) — a MESMA SPA React do web    │
│  Detecção em runtime: isElectron() ativa comportamentos      │
│  desktop (kiosk, contagem imediata de violação, etc.)        │
└──────────────────────────┬───────────────────────────────────┘
                           │ HTTPS
                           ↓
                    SUPABASE (inalterado)
```

**Pipeline de build:**

1. `vite build` → `dist/` (o mesmo bundle do deploy web, com Turnstile removido do HTML por script de build);
2. esbuild compila `electron/*.ts` → `dist-electron/` (main + preload);
3. `electron-builder` com target `portable` → **um único `.exe` x64 (~93 MB), sem instalação** — basta enviar o arquivo ao aluno.

**Protocolo `app://bundle`:** em produção o bundle não é servido via `file://` (que quebraria o `BrowserRouter`, os paths absolutos `/assets/...` e o `localStorage` da sessão Supabase, pois `file://` não tem origem). Um protocolo privilegiado próprio (`standard` + `secure`) serve `dist/` com **fallback SPA** — o equivalente desktop dos rewrites da Vercel — e injeta os headers de segurança (CSP, `X-Frame-Options`, `nosniff`) em cada resposta HTML, além de bloquear path traversal.

**Zero mudança no backend:** o desktop usa as mesmas tabelas, RPCs e políticas RLS. Os novos eventos de segurança são registrados pela RPC `insert_security_log` já existente.

### 7.3 Hardening do Processo Electron

Electron mal configurado é um vetor clássico de RCE (Node exposto à página). A configuração segue as recomendações oficiais de segurança do Electron:

| Configuração | Valor | Efeito |
|---|---|---|
| `contextIsolation` | `true` | Renderer não acessa internals do Electron |
| `nodeIntegration` | `false` | Página não tem acesso a APIs Node.js |
| `sandbox` | `true` | Renderer roda no sandbox do Chromium |
| `devTools` | `false` em produção | DevTools inacessível no executável final |
| Preload via `contextBridge` | API mínima | Só 5 funções expostas, canais IPC fixos — sem passthrough genérico |
| Validação de IPC | `senderFrame` | Todo handler IPC valida a URL do frame remetente antes de executar |
| `requestSingleInstanceLock` | ativo | Impossível abrir duas instâncias do app (ex.: uma em prova, outra livre) |
| Menu da aplicação | `null` | Sem menus nativos com atalhos de escape |
| CSP via protocolo | espelho da web | Mesma CSP de produção (sem Turnstile), injetada pelo handler `app://` |

### 7.4 Modo Kiosk Durante a Prova

Quando o aluno inicia uma avaliação, o renderer invoca `enterKioskMode()` (pelo mesmo hook `useAssessmentProtection` da web) e o processo main assume o controle:

| Mecanismo | Implementação | O que impede |
|---|---|---|
| Tela cheia kiosk | `setKiosk(true)` + `setAlwaysOnTop("screen-saver")` | Minimizar, redimensionar, taskbar |
| **Bloqueio de captura** | `setContentProtection(true)` | PrintScreen, gravadores e compartilhamento de tela capturam **tela preta** (nível do compositor do Windows) |
| **Monitores secundários** | Janelas-overlay pretas em tela cheia sobre cada display extra (`focusable: false`, fora da taskbar, também com content protection) | Uso livre do segundo monitor — vetor encontrado em teste real e corrigido |
| Monitor plugado no meio da prova | Listeners `display-added/removed/metrics-changed` recriam os overlays e registram evento `DISPLAY_CHANGE` | Burlar conectando monitor após o início |
| Atalhos globais | `globalShortcut` registra PrintScreen, Ctrl+P, F12, Ctrl+Shift+I/J/C, Ctrl+U/R/W, F5, F11, Alt+F4 (+ backup `before-input-event` dentro da janela) | Impressão, DevTools, reload, fechar |
| Fechamento | `close` e `before-quit` com `preventDefault` durante a prova | Alt+F4, fechar pela taskbar, encerrar o processo pela UI |
| **Desvio de foco** | `blur` → `win.focus()` + `moveTop()` imediatos + evento `WINDOW_BLUR_ELECTRON` ao renderer | Alt+Tab e clique em outro app: a janela da prova retoma o foco em milissegundos |

**Contagem imediata de violação:** na web, a violação de blur é contada após 5 segundos fora da aba (evita falsos positivos). No desktop esse timer nunca dispararia — o refocus automático devolve o foco antes. Por isso a violação é contada **na hora**, via evento do processo main, com throttle de 4 s (evita múltiplas contagens num único desvio) e período de carência de 1,5 s na entrada do kiosk (a própria transição dispara blur/focus). O sistema de **3 avisos progressivos com cancelamento automático** é exatamente o mesmo da web — o desktop só muda o gatilho.

### 7.5 Vetores de Fraude — Web × Desktop

| Vetor | Web | Desktop (Electron) |
|---|---|---|
| Copiar/colar, clique direito, atalhos | Bloqueados | Bloqueados (mesmos hooks) |
| DevTools | Detecção heurística + bloqueio de atalhos | **Inexistente** (desabilitado no binário) |
| Troca de aba/janela | Detectada após 5 s → aviso | **Refocus imediato + violação instantânea** |
| Segundo monitor | **Sem qualquer controle** | **Bloqueado** (overlay em tela cheia) |
| PrintScreen / gravação | Bloqueio de tecla apenas (gravador externo passa) | **Captura sai preta** (content protection) |
| Fechar a prova | Confirmação `beforeunload` | **Bloqueado** durante a prova |
| Extensões de browser | Risco presente | **Inexistente** (não há browser) |
| Impressão (Ctrl+P) | Bloqueada via tecla | Bloqueada (atalho global + in-window) |

### 7.6 Turnstile na Versão Desktop

O Cloudflare Turnstile exige um **hostname web autorizado** no dashboard — um aplicativo local (`app://bundle`) não tem como passar nessa validação. A decisão foi dispensar o Turnstile **no Electron e em ambiente de desenvolvimento**, mantendo-o obrigatório no deploy web:

```typescript
// auth-form.tsx — Turnstile só roda em produção web (deploy)
const skipTurnstile = isElectron() || import.meta.env.DEV;
```

O risco é baixo: o vetor que o Turnstile mitiga (bots automatizados em formulário público) não se aplica a um executável distribuído de forma controlada pelo professor. Toda a autenticação (Supabase Auth + JWT + RLS) permanece idêntica.

### 7.7 Distribuição

- **Arquivo único**: `CyberAccessShield-1.0.0-portable.exe` — sem instalador, sem dependências; o aluno executa direto.
- **Sem assinatura de código**: binários Electron não assinados costumam disparar alertas heurísticos de ML em antivírus (ex.: `Suspicious.low.ml.score` no VirusTotal) e o SmartScreen do Windows. São **falsos positivos típicos** de executáveis novos sem reputação acumulada — nenhuma engine de assinatura tradicional acusa o arquivo. A solução definitiva é certificado de assinatura de código (custo anual), listada como trabalho futuro.

### 7.8 Limitações Conhecidas (transparência metodológica)

- **Ctrl+Alt+Del, combos com tecla Win e Alt+Tab** não são bloqueáveis por aplicação alguma sem hook nativo de teclado ou Windows Assigned Access (modo quiosque corporativo). Mitigação adotada: refocus automático em milissegundos + violação contada na hora + sistema de 3 avisos.
- **Máquina virtual ou segundo dispositivo físico** (outro computador, celular fotografando a tela) estão fora do alcance de qualquer solução por software — limitação compartilhada por todos os proctoring tools comerciais.

---

## 8. Qualidade e Testes

### 8.1 Testes Unitários (Vitest)

126 testes em 7 arquivos cobrindo funções puras de segurança e utilidades:

| Arquivo | Testes | Cobertura |
|---|---|---|
| `user-utils.ts` | 54 | 87% |
| `fraud-logs-utils.ts` | 29 | 100% |
| `assessment-availability.ts` | 12 | 93% |
| `session-progress.ts` | 10 | 100% |
| `secure-utils.ts` | 13 | 90%+ |
| `lib/utils.ts` + `date-utils.ts` | 8 | 100% |

### 8.2 SonarCloud (SAST)

Quality Gate "Sonar way" obrigatório: Security A, Reliability A, Maintainability A, 100% Security Hotspots revisados. Integrado ao CI via GitHub Actions com token `SONAR_TOKEN` como secret do repositório.

### 8.3 ESLint com Plugins de Segurança

`eslint-plugin-security` detecta padrões inseguros (eval, regex DoS). `eslint-plugin-no-secrets` previne tokens hardcoded.

---

## 9. CI/CD (GitHub Actions)

| Pipeline | Trigger | Etapas |
|---|---|---|
| **CI — Lint & Build** | Push em `main`/`develop`, PRs | ESLint → Testes → TypeCheck → Build |
| **SonarCloud Analysis** | Push em `main`, PRs | Testes → Cobertura → SAST |
| **Dependency Audit** | Semanal + push/PRs | `npm audit --audit-level=high` |

Todas as Actions são pinadas por SHA completo (supply chain security). Dependabot configurado para monitoramento mensal.

---

## 10. Mapeamento OWASP Top 10 (2021)

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

## 11. Limitações e Trabalhos Futuros

1. **Verificação server-side do Turnstile**: implementar Edge Function no Supabase que valide o token via API da Cloudflare antes de processar o login.
2. **WAF Cloudflare com domínio customizado**: ao adquirir domínio, o proxy Cloudflare ativa WAF, rate limiting e DDoS protection como camada adicional antes do Vercel.
3. **Cloudflare Web Analytics**: analytics sem cookies e compatível com LGPD.
4. **DAST**: testes dinâmicos de segurança (ex: OWASP ZAP) não implementados.
5. **MFA**: disponível no Supabase mas não habilitado.
6. **Code splitting**: bundle atual ultrapassa 800 KB — divisão por `import()` dinâmico reduziria tempo de carregamento.
7. **Testes de componentes React**: React Testing Library para aumentar cobertura geral.
8. **Assinatura de código do executável desktop**: certificado de code signing eliminaria alertas SmartScreen/heurísticas de antivírus no `.exe` portátil.
9. **Auto-update do desktop**: hoje uma nova versão exige redistribuir o `.exe`; `electron-updater` automatizaria isso.
