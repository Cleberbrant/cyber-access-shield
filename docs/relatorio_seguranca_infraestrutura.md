# Relatório de Segurança e Infraestrutura — Cyber Access Shield
**TCC — Plataforma de Avaliações Seguras**  
Autores: Cleber Brant & Pedro  
Data: Junho de 2026

---

## 1. Introdução

Este relatório documenta as práticas de segurança e infraestrutura implementadas no **Cyber Access Shield**, seguindo o **OWASP SAMM (Software Assurance Maturity Model)** e as diretrizes do **OWASP Top 10 (2021)**. Cobre o ciclo completo: desenvolvimento seguro (SSDLC), análise estática (SAST), composição de software (SCA), deploy seguro e proteção em produção.

---

## 2. Análise Estática de Código (SAST) — SonarCloud

### 2.1 Configuração

O **SonarCloud** é integrado ao GitHub via Actions. O Quality Gate "Sonar way" é obrigatório a cada push no `main`:

| Métrica | Requisito |
|---|---|
| Security Rating | A |
| Reliability Rating | A |
| Maintainability Rating | A |
| Security Hotspots Reviewed | 100% |
| Coverage on New Code | ≥ 80% |
| Duplicated Lines on New Code | ≤ 3% |

O workflow `sonarcloud.yml` executa testes com cobertura (`lcov.info`) e envia para análise. O secret `SONAR_TOKEN` é armazenado nas GitHub Secrets do repositório.

### 2.2 Issues Identificadas e Corrigidas

**Segurança (Security Hotspots):**

| Issue | Arquivo | Correção |
|---|---|---|
| `Math.random()` em geração de senhas | `user-utils.ts` | Substituído por `crypto.getRandomValues()` (CSPRNG) |
| Regex vulnerável a ReDoS | `user-utils.ts` | Substituída por regex sem backtracking exponencial |
| Actions sem SHA pinning | Todos os workflows | Pinadas por hash completo do commit |

**Confiabilidade (Reliability):**

| Issue | Correção |
|---|---|
| Comparação NULL com `=` em SQL | Substituído por `COALESCE()` |
| `parseInt()` / `isNaN()` globais | Substituídos por `Number.parseInt()` / `Number.isNaN()` |
| `String.match()` em vez de `RegExp.exec()` | Corrigido em `useAssessmentProtection.ts` |
| Elementos HTML sem labels ARIA | Adicionados `role`, `aria-label`, `<section>` semântico |

**Manutenibilidade:**

| Issue | Correção |
|---|---|
| Props React sem `Readonly<>` | Adicionado em `badge.tsx`, `skeleton.tsx` |
| Assertion de tipo desnecessária | Removido `as keyof typeof config` em `chart.tsx` |
| Ícones deprecated do lucide-react | Substituídos por SVGs inline |

---

## 3. Testes Automatizados

### 3.1 Framework: Vitest + coverage-v8

126 testes unitários em 7 arquivos, focados em funções puras (sem dependência de DOM, Supabase ou React):

| Arquivo | Testes | Cobertura |
|---|---|---|
| `user-utils.ts` | 54 | 87% |
| `fraud-logs-utils.ts` | 29 | 100% |
| `assessment-availability.ts` | 12 | 93% |
| `session-progress.ts` | 10 | 100% |
| `secure-utils.ts` | 13 | 90%+ |
| `lib/utils.ts` | 5 | 100% |
| `date-utils.ts` | 3 | 100% |

Cobertura exportada em LCOV para importação pelo SonarCloud. Exclusões configuradas para componentes React e hooks (requerem React Testing Library).

---

## 4. Análise de Composição de Software (SCA)

### 4.1 Vulnerabilidades Corrigidas

6 vulnerabilidades identificadas pelo GitHub Dependency Graph e corrigidas:

| Dependência | Severidade | Vulnerabilidade | Correção |
|---|---|---|---|
| `@remix-run/router` 1.23.1 | **High** | XSS via Open Redirects | Atualização `react-router-dom` → ^6.30.3 |
| `minimatch` 3.1.2 | **High** | ReDoS via wildcards | Override `package.json` → ^3.1.3 |
| `minimatch` 9.0.5 | **High** | ReDoS via GLOBSTAR | Override `package.json` → ^9.0.6 |
| `rollup` 4.53.3 | **High** | Arbitrary File Write | Atualização `vite` → ^6.4.1 |
| `esbuild` 0.21.5 | **Moderate** | Vulnerabilidade de segurança | Atualização `vite` → ^6.4.1 |
| `lodash` 4.17.21 | **Moderate** | Prototype Pollution | Atualização `recharts` → ^3.7.0 |

**Resultado: 0 vulnerabilidades ativas** (verificado via `npm audit`).

### 4.2 Monitoramento Contínuo

| Ferramenta | Frequência | Ação |
|---|---|---|
| **Dependabot** | Mensal | Cria PRs para updates de segurança |
| **`npm audit` no CI** | Cada push | Falha o pipeline se houver high+ |
| **npm overrides** | Permanente | Força versões seguras de transitivas |

---

## 5. Pipeline de CI/CD

### 5.1 Workflows

**Pipeline 1 — CI Lint & Build (`ci.yml`)**  
Trigger: push em `main`/`develop` + PRs para `main`
```
ESLint (security plugins) → Testes (126) → TypeCheck → Build de produção
```

**Pipeline 2 — SonarCloud Analysis (`sonarcloud.yml`)**  
Trigger: push em `main` + PRs para `main`
```
npm ci → Testes com cobertura → SonarCloud Scan (SONAR_TOKEN secret)
```

**Pipeline 3 — Dependency Audit (`dependency-audit.yml`)**  
Trigger: toda segunda-feira 09:00 BRT + push/PRs para `main`
```
npm audit --audit-level=high → falha se high ou critical
```

### 5.2 Supply Chain Security

Todas as GitHub Actions são pinadas por SHA completo:
```yaml
uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5  # v4
uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020  # v4
```
Impede que comprometimento de uma Action injete código malicioso nas builds.

---

## 6. Headers de Segurança HTTP

### 6.1 Camada de Desenvolvimento (vite.config.ts)

Aplicados no servidor de desenvolvimento (não interferem com HMR):
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

Em modo produção são adicionados CSP + HSTS + X-XSS-Protection.

### 6.2 Camada de Produção (vercel.json)

Headers aplicados pelo Vercel em todas as respostas — reforçam e complementam os do Vite:

| Header | Valor Configurado |
|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `X-XSS-Protection` | `1; mode=block` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=()` |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'unsafe-inline'; ...` |

O HSTS com `preload` e `max-age=63072000` (2 anos) garante que navegadores sempre usem HTTPS, mesmo antes de qualquer requisição.

---

## 7. Proteções no Nível de Aplicação

### 7.1 Cloudflare Turnstile (Anti-Bot)

Integrado nos formulários de login e cadastro via `@marsidev/react-turnstile`. Bloqueia a submissão enquanto o token Cloudflare não for gerado:

```typescript
const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

const handleSubmit = async (e) => {
  if (!turnstileToken) {
    setErrors({ form: "Confirme que você não é um robô antes de continuar." });
    return;
  }
  // prossegue com login/cadastro
};
```

O token expira automaticamente — re-verificação necessária se demorar. Configura-se via `VITE_TURNSTILE_SITE_KEY` no Vercel (Settings → Environment Variables).

### 7.2 Bloqueio de Dispositivos Móveis

Componente `MobileBlock` envolve toda a aplicação:
```typescript
const MOBILE_UA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
function isMobileDevice() {
  return MOBILE_UA.test(navigator.userAgent) || window.innerWidth < 768;
}
```
Exibe tela de bloqueio para mobile — plataforma exclusiva para desktop por requisito do ambiente de avaliação.

### 7.3 Gabarito Server-Side

A coluna `correct_answer` nunca é enviada ao frontend. A RPC `submit_and_grade_assessment` executa no PostgreSQL:
- Compara respostas com gabarito no banco
- Calcula score
- Finaliza sessão
- Retorna apenas o resultado

Antes: `select('*')` expunha `correct_answer` na Network tab. Após correção: impossível inspecionar gabarito via DevTools.

### 7.4 Detecção de DevTools

Implementado em `secure-utils.ts` e `useDevToolsDetection.ts`:
- Threshold de **129px** entre `outerWidth`/`outerHeight` e `innerWidth`/`innerHeight` indica DevTools docked
- Detecção Firebug para navegadores legados
- Bypass automático para administradores (verificado via Supabase, não localStorage)

### 7.5 Bloqueio Pre-React

Script inline no `index.html` bloqueia atalhos críticos antes mesmo do React montar:
```javascript
// Executa imediatamente — não pode ser bypassado desabilitando bundle
document.addEventListener('keydown', (e) => {
  if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key))) {
    e.preventDefault();
  }
});
document.addEventListener('contextmenu', (e) => e.preventDefault());
```

### 7.6 Build Hardening

| Configuração | Efeito |
|---|---|
| `esbuild.drop: ['console', 'debugger']` | Remove todos os `console.*` do bundle de produção |
| `sourcemap: false` | Código minificado e ilegível em produção |

### 7.7 Remoção de Dependências Externas Não Auditadas

O scaffold inicial (Lovable) havia inserido no `index.html`:
- Script externo `https://cdn.gpteng.co/gptengineer.js` (terceiro não auditado)
- `og:image` apontando para `lovable.dev` (branding externo nos previews de link)
- `twitter:site: @lovable_dev`

Todos foram removidos. A CSP agora proíbe qualquer script externo além do próprio bundle.

---

## 8. Banco de Dados — Segurança

### 8.1 Row Level Security (RLS)

7 tabelas com RLS habilitado + 38 políticas por perfil. Funções `SECURITY DEFINER` executam com privilégios elevados apenas quando necessário, sem expor permissões ao chamador.

Views administrativas (`security_report`, `user_management_view`) configuradas com `security_barrier = true` e acesso `anon` revogado.

### 8.2 Geração de Senhas Temporárias

```typescript
// Usa CSPRNG — nunca Math.random()
function generateTempPassword(): string {
  const array = new Uint8Array(12);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array)).slice(0, 12);
}
```

### 8.3 Sanitização de Entradas

```typescript
function sanitizeInput(input: string): string {
  const div = document.createElement('div');
  div.textContent = input;  // encoding seguro via DOM
  return div.innerHTML;
}
```

---

## 9. Conformidade OWASP SAMM

| Prática SAMM | Nível | Implementação |
|---|---|---|
| **Secure Build** | 2 | SHA pinning, `npm audit` no CI, Dependabot |
| **Security Testing** | 2 | SonarCloud SAST, ESLint security plugins, SCA |
| **Defect Management** | 1 | Quality Gate obrigatório |
| **Security Architecture** | 2 | Headers HTTP (dev + prod), RLS, CSP, Turnstile |
| **Software Composition** | 2 | Dependabot, npm overrides, audit obrigatório |
| **Implementation Review** | 1 | PRs com análise estática automatizada |

---

## 10. Resultados

| Métrica | Antes | Depois |
|---|---|---|
| Vulnerabilidades em dependências | 6 (4 high + 2 moderate) | **0** |
| Security Hotspots revisados | 0% | **100%** |
| Testes unitários | 0 | **126** |
| Cobertura em utilitários | 0% | **87–100%** |
| Pipelines CI/CD | 0 | **3 + Dependabot** |
| Console.logs em produção | ~27 arquivos | **0** (esbuild.drop) |
| Gabarito exposto no frontend | Sim | **Não** (RPC server-side) |
| Admin bypass via localStorage | Sim | **Não** (Supabase server-side) |
| Scripts externos não auditados | 1 (gptengineer.js) | **0** |
| Proteção anti-bot no login | Nenhuma | **Cloudflare Turnstile** |
| Acesso mobile | Permitido | **Bloqueado** (MobileBlock) |

---

## 11. Limitações e Trabalhos Futuros

1. **Verificação server-side do Turnstile**: Edge Function no Supabase validando o token via `https://challenges.cloudflare.com/turnstile/v0/siteverify`.
2. **WAF Cloudflare**: ativado ao adquirir domínio próprio — rate limiting, geo-bloqueio, regras OWASP.
3. **DAST**: testes dinâmicos de segurança (OWASP ZAP) não implementados.
4. **MFA**: disponível no Supabase mas não habilitado.
5. **Leaked Password Protection**: verificação HaveIBeenPwned disponível no Supabase mas não habilitada.
6. **Pentest formal**: não realizado — recomendado antes de deploy em produção institucional.
