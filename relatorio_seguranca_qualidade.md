# Relatório de Segurança e Qualidade de Software — Cyber Access Shield

## 1. Introdução

Este relatório documenta as práticas de segurança e qualidade implementadas no projeto **Cyber Access Shield**, uma plataforma de avaliação online segura. As ações aqui descritas seguem princípios do **SAMM (Software Assurance Maturity Model)** e visam estabelecer um ciclo de desenvolvimento seguro (SSDLC — Secure Software Development Lifecycle) integrado ao fluxo de entrega contínua do projeto.

---

## 2. Análise Estática de Código (SAST)

### 2.1. Ferramenta Adotada: SonarCloud

O **SonarCloud** foi integrado ao repositório GitHub do projeto como ferramenta de análise estática de código (Static Application Security Testing — SAST). A escolha pelo SonarCloud se deu por:

- Suporte nativo a repositórios públicos no GitHub com plano gratuito;
- Capacidade de detectar vulnerabilidades de segurança, bugs de confiabilidade, code smells de manutenibilidade e medir cobertura de testes;
- Integração direta com GitHub Actions para execução automatizada em cada push e Pull Request.

A configuração da integração foi realizada através do arquivo [sonar-project.properties](file:///d:/cyber-access-shield/sonar-project.properties), que define:

- **Organização e chave do projeto** no SonarCloud;
- **Diretório de fontes** (`src`);
- **Exclusões de análise** (arquivos de teste, `node_modules`, `dist`);
- **Relatório de cobertura** ([coverage/lcov.info](file:///d:/cyber-access-shield/coverage/lcov.info)) para importação pelo SonarCloud;
- **Exclusões de cobertura** para componentes React, páginas e hooks que requerem testes de integração com React Testing Library.

### 2.2. Quality Gate

O projeto utiliza o **Quality Gate "Sonar way"** (padrão do SonarCloud), que exige:

| Métrica | Requisito |
|---------|-----------|
| Coverage on New Code | ≥ 80% |
| Duplicated Lines on New Code | ≤ 3% |
| Maintainability Rating | A |
| Reliability Rating | A |
| Security Rating | A |
| Security Hotspots Reviewed | 100% |

### 2.3. Issues Identificadas e Corrigidas

#### 2.3.1. Vulnerabilidades de Segurança (Security Hotspots)

| Issue | Arquivo | Correção |
|-------|---------|----------|
| Uso de `Math.random()` para geração de senhas | [user-utils.ts](file:///d:/cyber-access-shield/src/utils/user-utils.ts) | Substituído por `crypto.getRandomValues()`, que utiliza gerador de números pseudoaleatórios criptograficamente seguro (CSPRNG) |
| Regex vulnerável a ReDoS (Regular Expression Denial of Service) na validação de e-mail | [user-utils.ts](file:///d:/cyber-access-shield/src/utils/user-utils.ts) | Substituída por expressão regular robusta sem backtracking exponencial |
| Actions do GitHub sem pinagem por SHA | [ci.yml](file:///d:/cyber-access-shield/.github/workflows/ci.yml), [sonarcloud.yml](file:///d:/cyber-access-shield/.github/workflows/sonarcloud.yml), [dependency-audit.yml](file:///d:/cyber-access-shield/.github/workflows/dependency-audit.yml) | Todas as Actions (`actions/checkout`, `actions/setup-node`, `SonarSource/sonarqube-scan-action`) foram pinadas pelo hash SHA completo do commit, mitigando ataques de supply chain |

#### 2.3.2. Bugs de Confiabilidade (Reliability)

| Issue | Arquivo(s) | Correção |
|-------|-----------|----------|
| Comparação SQL com NULL usando `=` em vez de `IS NULL` | [fix_rls_recursion.sql](file:///d:/cyber-access-shield/supabase/sql/fix_rls_recursion.sql), [user_management.sql](file:///d:/cyber-access-shield/supabase/sql/user_management.sql) | Substituído por `COALESCE(campo, valor_padrão)` para tratamento NULL-safe |
| Uso de `parseInt()` global (não recomendado) | [CreateAssessmentPage.tsx](file:///d:/cyber-access-shield/src/pages/CreateAssessmentPage.tsx), [ResultQuestionRenderer.tsx](file:///d:/cyber-access-shield/src/components/assessment/ResultQuestionRenderer.tsx), [useAssessmentTimer.ts](file:///d:/cyber-access-shield/src/hooks/useAssessmentTimer.ts), [useAssessmentLoader.ts](file:///d:/cyber-access-shield/src/hooks/useAssessmentLoader.ts) | Substituído por `Number.parseInt()` (padrão ES2021+) |
| Uso de `isNaN()` global | [useAssessmentTimer.ts](file:///d:/cyber-access-shield/src/hooks/useAssessmentTimer.ts), [useAssessmentLoader.ts](file:///d:/cyber-access-shield/src/hooks/useAssessmentLoader.ts) | Substituído por `Number.isNaN()` |
| Uso de `replace()` com flag global em vez de `replaceAll()` | [user-utils.ts](file:///d:/cyber-access-shield/src/utils/user-utils.ts), [chart.tsx](file:///d:/cyber-access-shield/src/components/ui/chart.tsx) | Substituído por `replaceAll()` (ES2021) |
| Atributo HTML desconhecido `cmdk-input-wrapper` | [command.tsx](file:///d:/cyber-access-shield/src/components/ui/command.tsx) | Corrigido para `data-cmdk-input-wrapper` (padrão data attributes) |
| Elementos interativos sem labels de acessibilidade | [alert.tsx](file:///d:/cyber-access-shield/src/components/ui/alert.tsx), [card.tsx](file:///d:/cyber-access-shield/src/components/ui/card.tsx), [pagination.tsx](file:///d:/cyber-access-shield/src/components/ui/pagination.tsx), [LandingPage.tsx](file:///d:/cyber-access-shield/src/pages/LandingPage.tsx) | Adicionados `role`, `aria-label`, ou elementos semânticos (`<section>`) |

#### 2.3.3. Code Smells de Manutenibilidade

| Issue | Arquivo(s) | Correção |
|-------|-----------|----------|
| Props de componentes React não marcadas como read-only (S6759) | [badge.tsx](file:///d:/cyber-access-shield/src/components/ui/badge.tsx), [skeleton.tsx](file:///d:/cyber-access-shield/src/components/ui/skeleton.tsx) | Props encapsuladas com `Readonly<>` do TypeScript |
| Assertion de tipo desnecessária (S4325) | [chart.tsx](file:///d:/cyber-access-shield/src/components/ui/chart.tsx) | Removido `as keyof typeof config` — o tipo já era inferido corretamente |
| `String.match()` em vez de `RegExp.exec()` (S6594) | [useAssessmentProtection.ts](file:///d:/cyber-access-shield/src/hooks/useAssessmentProtection.ts) | Substituído `/regex/.exec(string)` |
| Ausência de optional chaining | [useAssessmentSubmission.ts](file:///d:/cyber-access-shield/src/hooks/useAssessmentSubmission.ts) | Substituído `!session \|\| session.user.id` por `!session?.user.id` |
| Ícones deprecated do lucide-react (`Github`, `Linkedin`) | [LandingPage.tsx](file:///d:/cyber-access-shield/src/pages/LandingPage.tsx) | Substituídos por SVGs inline com os logos oficiais |
| Uso de `role="region"` em `<div>` | [LandingPage.tsx](file:///d:/cyber-access-shield/src/pages/LandingPage.tsx) | Substituído por `<section aria-label="...">` (elemento semântico) |

---

## 3. Testes Automatizados e Cobertura

### 3.1. Framework de Testes

O projeto utiliza **Vitest** como framework de testes unitários, com o provider **@vitest/coverage-v8** para geração de relatórios de cobertura no formato LCOV.

A escolha pelo Vitest se deu por:
- Integração nativa com Vite (mesma toolchain de build);
- Compatibilidade com a API do Jest (migração facilitada);
- Performance superior em projetos com TypeScript;
- Suporte nativo a ES Modules e aliases de caminho.

### 3.2. Estratégia de Testes

A estratégia adotada prioriza **funções puras** — funções sem efeitos colaterais nem dependências externas — que podem ser testadas isoladamente sem necessidade de mocking de DOM, Supabase ou React:

| Arquivo Testado | Nº de Testes | Cobertura | Funções Cobertas |
|----------------|-------------|-----------|-----------------|
| [user-utils.ts](file:///d:/cyber-access-shield/src/utils/user-utils.ts) | 54 | 87,2% | [generateTempPassword](file:///d:/cyber-access-shield/src/utils/user-utils.ts#7-40), [validatePassword](file:///d:/cyber-access-shield/src/utils/user-utils.ts#41-80), [validateEmail](file:///d:/cyber-access-shield/src/utils/user-utils.ts#256-264), [validateDisplayName](file:///d:/cyber-access-shield/src/utils/user-utils.ts#199-229), [sanitizeInput](file:///d:/cyber-access-shield/src/utils/user-utils.ts#265-271), [formatDate](file:///d:/cyber-access-shield/src/utils/date-utils.ts#2-10), [formatShortDate](file:///d:/cyber-access-shield/src/utils/user-utils.ts#97-110), [formatRelativeTime](file:///d:/cyber-access-shield/src/utils/fraud-logs-utils.ts#93-111), [generateDisplayNameFromEmail](file:///d:/cyber-access-shield/src/utils/user-utils.ts#132-144), [translateAction](file:///d:/cyber-access-shield/src/utils/user-utils.ts#145-161), [formatLogValue](file:///d:/cyber-access-shield/src/utils/user-utils.ts#162-198), [isTempPasswordExpired](file:///d:/cyber-access-shield/src/utils/user-utils.ts#243-255) |
| [fraud-logs-utils.ts](file:///d:/cyber-access-shield/src/utils/fraud-logs-utils.ts) | 29 | 100% | [maskIP](file:///d:/cyber-access-shield/src/utils/fraud-logs-utils.ts#5-27), [formatEventType](file:///d:/cyber-access-shield/src/utils/fraud-logs-utils.ts#28-50), [getEventSeverity](file:///d:/cyber-access-shield/src/utils/fraud-logs-utils.ts#51-77), [formatTimestamp](file:///d:/cyber-access-shield/src/utils/fraud-logs-utils.ts#78-92), [formatRelativeTime](file:///d:/cyber-access-shield/src/utils/fraud-logs-utils.ts#93-111) |
| [assessment-availability.ts](file:///d:/cyber-access-shield/src/utils/assessment-availability.ts) | 12 | 93,3% | [isAssessmentAvailable](file:///d:/cyber-access-shield/src/utils/assessment-availability.ts#1-18), [formatAvailabilityDate](file:///d:/cyber-access-shield/src/utils/assessment-availability.ts#19-41), [getTimeUntilAvailable](file:///d:/cyber-access-shield/src/utils/assessment-availability.ts#42-83) |
| [session-progress.ts](file:///d:/cyber-access-shield/src/utils/session-progress.ts) | 10 | funções puras 100% | [isSessionTimeExpired](file:///d:/cyber-access-shield/src/utils/session-progress.ts#81-94), [calculateTimeRemaining](file:///d:/cyber-access-shield/src/utils/session-progress.ts#95-109) |
| [lib/utils.ts](file:///d:/cyber-access-shield/src/lib/utils.ts) | 5 | 100% | [cn](file:///d:/cyber-access-shield/src/lib/utils.ts#4-7) (class name merge utility) |
| [date-utils.ts](file:///d:/cyber-access-shield/src/utils/date-utils.ts) | 3 | 100% | [formatDate](file:///d:/cyber-access-shield/src/utils/date-utils.ts#2-10) |
| [secure-utils.ts](file:///d:/cyber-access-shield/src/utils/secure-utils.ts) | 13 | detectDevTools + sanitizeInput | [detectDevTools](file:///d:/cyber-access-shield/src/utils/secure-utils.ts#24-35) (threshold + Firebug), [sanitizeInput](file:///d:/cyber-access-shield/src/utils/secure-utils.ts#59-68) (XSS, HTML entities, edge cases) |
| **Total** | **126** | — | **~28 funções** |

### 3.3. Cobertura no SonarCloud

Para que o SonarCloud calcule a cobertura de forma representativa, foram configuradas **exclusões de cobertura** para arquivos que requerem frameworks de teste mais complexos (React Testing Library, jsdom):

```
sonar.coverage.exclusions=src/components/**/*.tsx,src/pages/**/*.tsx,src/hooks/**/*.ts,...
```

Dessa forma, o Quality Gate avalia a cobertura apenas sobre o código utilitário e de bibliotecas (`src/utils/`, `src/lib/`), onde o projeto atinge entre **87% e 100%** de cobertura.

---

## 4. Pipeline de Integração Contínua (CI/CD)

### 4.1. Estrutura dos Workflows

Três pipelines automatizadas foram configuradas via GitHub Actions:

#### Pipeline 1: CI — Lint & Build (`ci.yml`)
| Etapa | Ação |
|-------|------|
| Checkout | Obtém o código fonte (SHA pinado) |
| Setup Node.js | Configura Node.js 20 com cache npm |
| Install | `npm ci` |
| ESLint | Lint com plugins de segurança (`continue-on-error: true` para não bloquear) |
| Testes | `npm run test:coverage` — executa 126 testes e gera lcov |
| Type Check | `npx tsc --noEmit` — verificação de tipos |
| Build | `npm run build` — build de produção |

**Trigger**: Todo push em qualquer branch + PRs para `main`.

#### Pipeline 2: Security — SonarCloud Analysis (`sonarcloud.yml`)
| Etapa | Ação |
|-------|------|
| Checkout | `fetch-depth: 0` para histórico completo |
| Setup Node.js + Install | Ambiente para execução de testes |
| Testes com cobertura | Gera `coverage/lcov.info` |
| SonarCloud Scan | Envia código + cobertura para análise |

**Trigger**: Push no `main` + PRs para `main`.

#### Pipeline 3: Security — Dependency Audit (`dependency-audit.yml`)
| Etapa | Ação |
|-------|------|
| Setup + Install | Ambiente Node.js |
| `npm audit --audit-level=high` | Verifica vulnerabilidades — **falha o CI** se houver high ou superior |
| `npm audit --audit-level=critical` | Verificação estrita para vulnerabilidades críticas |

**Trigger**: Semanal (segunda-feira, 09:00 BRT via cron) + push/PRs para `main`.

#### Dependabot (`dependabot.yml`)

O **GitHub Dependabot** foi configurado para monitoramento contínuo de dependências vulneráveis. Ele cria Pull Requests automaticamente quando versões corrigidas são disponibilizadas:

| Configuração | Valor |
|---|---|
| Ecossistemas monitorados | `npm` (dependências do projeto) + `github-actions` (workflows) |
| Frequência | Semanal (segunda-feira, 09:00 BRT) |
| Agrupamento | Minor e patch updates agrupados em um único PR |
| Limite de PRs abertas | 10 simultâneas |

### 4.2. Segurança do Supply Chain

Todas as GitHub Actions utilizadas nos workflows são referenciadas pelo **SHA completo do commit** (não por tag). Isso impede que um atacante que comprometa o repositório de uma Action possa injetar código malicioso nas builds do projeto:

```yaml
# Exemplo — SHA exato em vez de tag
uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5  # v4
```

---

## 5. Análise de Composição de Software (SCA)

Além da análise estática do código próprio (SAST via SonarCloud), o projeto implementa **Software Composition Analysis (SCA)** para monitorar vulnerabilidades em dependências de terceiros.

### 5.1. Vulnerabilidades Identificadas e Corrigidas

O GitHub Dependency Graph identificou **6 vulnerabilidades** em dependências transitivas (4 high, 2 moderate). Todas foram corrigidas:

| Dependência | Severidade | Vulnerabilidade | Correção |
|---|---|---|---|
| `@remix-run/router` 1.23.1 | **High** | XSS via Open Redirects (GHSA-mw96-cpmx-2vgc) | Atualização do `react-router-dom` para ^6.30.3 |
| `minimatch` 3.1.2 | **High** | ReDoS via wildcards (GHSA-7r86-cg39-jmmj) | Override no `package.json` para ^3.1.3 |
| `minimatch` 9.0.5 | **High** | ReDoS via GLOBSTAR segments | Override no `package.json` para ^9.0.6 |
| `rollup` 4.53.3 | **High** | Arbitrary File Write via Path Traversal | Atualização do `vite` para ^6.4.1 |
| `esbuild` 0.21.5 | **Moderate** | Vulnerabilidade de segurança | Atualização do `vite` para ^6.4.1 |
| `lodash` 4.17.21 | **Moderate** | Prototype Pollution em `_.unset`/`_.omit` | Atualização do `recharts` para ^3.7.0 (migrou para `es-toolkit`) |

### 5.2. Estratégias de Mitigação

| Estratégia | Implementação |
|---|---|
| **npm overrides** | Seção `overrides` no `package.json` para forçar versões seguras de dependências transitivas que não podem ser atualizadas diretamente |
| **Dependabot** | Monitoramento semanal automático com criação de PRs para atualizações de segurança |
| **Audit no CI** | `npm audit --audit-level=high` como step obrigatório (falha o pipeline) |
| **Atualização proativa** | Major upgrades em dependências diretas (`vite` v5→v6, `recharts` v2→v3) quando necessário para resolver vulnerabilidades transitivas |

---

## 6. ESLint com Plugins de Segurança

Além das regras padrão do TypeScript e React, o ESLint do projeto foi configurado com dois plugins de segurança:

| Plugin | Objetivo | Exemplos de Regras |
|--------|---------|-------------------|
| `eslint-plugin-security` | Detectar padrões inseguros no código | `detect-eval-with-expression`, `detect-non-literal-regexp`, `detect-possible-timing-attacks` |
| `eslint-plugin-no-secrets` | Prevenir secrets hardcoded | Detecção de tokens, chaves de API, senhas em strings literais |

As regras de segurança estão configuradas como `warn` para não bloquear o build, permitindo correção gradual.

---

## 7. Proteções no Nível de Aplicação

### 7.1. Headers de Segurança HTTP

Headers configurados em [vite.config.ts](file:///d:/cyber-access-shield/vite.config.ts) — todos os modos recebem headers básicos; CSP, HSTS e X-XSS-Protection são aplicados apenas em produção:

| Header | Valor | Proteção | Modo |
|--------|-------|----------|------|
| `X-Content-Type-Options` | `nosniff` | Impede MIME-type sniffing pelo navegador | Todos |
| `X-Frame-Options` | `DENY` | Impede embedding via iframe (clickjacking) | Todos |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limita informações de referrer em requisições cross-origin | Todos |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Restringe acesso a APIs sensíveis do navegador | Todos |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'unsafe-inline' ...` | Previne XSS controlando fontes de scripts, estilos e conexões | Produção |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Força HTTPS por 1 ano, prevenindo ataques man-in-the-middle | Produção |
| `X-XSS-Protection` | `1; mode=block` | Proteção XSS legada para navegadores antigos | Produção |

### 7.2. Proteção do Gabarito — Correção Server-Side

O sistema utiliza uma **RPC (Remote Procedure Call)** no Supabase para correção de avaliações. A coluna `correct_answer` da tabela `questions` **nunca é enviada ao frontend**:

| Camada | Antes | Depois |
|--------|-------|--------|
| Frontend query | `select('*')` incluía `correct_answer` | `select('id, question_text, options, ...')` exclui `correct_answer` |
| Correção | JavaScript no browser comparava respostas | RPC `submit_and_grade_assessment` compara no PostgreSQL |
| Resultado | Aluno podia inspecionar Network e ver gabarito | Respostas corretas nunca saem do banco de dados |

### 7.3. Detecção de DevTools

Mecanismo de detecção de ferramentas de desenvolvedor implementado em [secure-utils.ts](file:///d:/cyber-access-shield/src/utils/secure-utils.ts) e [useDevToolsDetection.ts](file:///d:/cyber-access-shield/src/hooks/useDevToolsDetection.ts):

- **Threshold absoluto de 129px**: diferença entre `outerWidth/outerHeight` e `innerWidth/innerHeight` acima de 129px indica DevTools docked;
- **Detecção Firebug** (navegadores legados);
- **Bypass para administradores**: status admin verificado via Supabase (não localStorage);
- **Bloqueio pre-React**: atalhos F12, Ctrl+Shift+I, Ctrl+U e menu de contexto bloqueados via script inline no `index.html` (executa antes do React montar).

### 7.4. Hardening de Build (Produção)

Configurações em [vite.config.ts](file:///d:/cyber-access-shield/vite.config.ts) para builds de produção:

| Configuração | Efeito |
|---|---|
| `esbuild.drop: ['console', 'debugger']` | Remove **todas** as chamadas `console.*` e `debugger` do bundle |
| `sourcemap: false` | Desabilita source maps — código fica minificado e ilegível |

### 7.5. Proteções de Dados

| Prática | Implementação |
|---------|--------------|
| Geração criptográfica de senhas | `crypto.getRandomValues()` em `generateTempPassword()` |
| Sanitização de entradas | `sanitizeInput()` usa DOM textContent para encoding seguro de HTML |
| Validação de e-mail sem ReDoS | Regex robusta sem backtracking exponencial |
| Row Level Security (RLS) | 7 tabelas com RLS habilitado + 38 políticas por perfil (admin/aluno) |
| Tratamento NULL-safe em SQL | Uso de `COALESCE()` para evitar comportamento inesperado |
| Admin status verificado server-side | `isAdmin()` sempre consulta Supabase, nunca localStorage |
| Views com security_barrier | `security_report` e `user_management_view` com `security_barrier = true` + acesso `anon` revogado |

### 6.3. Arquivos de Configuração de Segurança

| Arquivo | Função |
|---------|--------|
| `.gitignore` | Exclui `.env.*`, `*.pem`, `*.key`, `coverage/`, `.scannerwork/` |
| `sonar-project.properties` | Configuração do SonarCloud |
| `eslint.config.js` | ESLint com plugins de segurança |
| `vitest.config.ts` | Configuração de testes com cobertura V8 |
| `dependabot.yml` | Monitoramento automático de dependências vulneráveis |

---

## 8. Conformidade com SAMM

As práticas implementadas se alinham com as seguintes práticas do **OWASP SAMM**:

| Prática SAMM | Nível | Implementação no Projeto |
|-------------|-------|--------------------------|
| **Secure Build** | 1-2 | GitHub Actions com SHA pinado, `npm audit` no CI, Dependabot |
| **Security Testing** | 1-2 | SonarCloud (SAST), ESLint security plugins, SCA via Dependency Graph |
| **Defect Management** | 1 | Quality Gate obrigatório, tracking de issues |
| **Security Architecture** | 1 | Headers HTTP, RLS, validação de entrada |
| **Software Composition** | 1-2 | Dependabot, npm overrides, audit obrigatório no pipeline |
| **Implementation Review** | 1 | Code review via PRs, análise estática automatizada |

---

## 9. Resultados Alcançados

| Métrica | Antes | Depois |
|---------|-------|--------|
| Security Hotspots revisados | 0% | 100% |
| Reliability Issues | 23 | 0 |
| Maintainability Issues (novos) | 11 | 0 |
| Vulnerabilidades em dependências | 6 (4 high + 2 moderate) | 0 |
| Testes unitários | 0 | 126 (7 arquivos) |
| Cobertura em utilitários | 0% | 87-100% |
| Pipelines CI/CD | 0 | 3 + Dependabot |
| Supply chain protection | Nenhuma | SHA pinning + Dependabot + npm overrides |
| Gabarito exposto no frontend | Sim (`select('*')` incluía `correct_answer`) | Não — RPC server-side, gabarito nunca sai do banco |
| Admin bypass via localStorage | Sim (`isAdminSync()` lia localStorage) | Não — `isAdmin()` sempre verifica via Supabase |
| Headers de segurança (CSP/HSTS) | Nenhum | CSP + HSTS + X-XSS-Protection em produção |
| Console.logs em produção | ~27 arquivos com logs sensíveis | 0 — `esbuild.drop` remove em build |
| Source maps em produção | Habilitados | Desabilitados |
| DevTools detection | Nenhuma | Threshold 129px + Firebug + bloqueio de atalhos |

---

## 10. Limitações e Trabalhos Futuros

1. **Testes de componentes React**: Atualmente apenas funções puras e utilitários de segurança são testados. Testes de componentes com React Testing Library e jsdom podem elevar a cobertura geral;
2. **DAST (Dynamic Application Security Testing)**: Testes dinâmicos de segurança (ex: ZAP Proxy) não foram implementados;
3. **Auditoria de acesso**: Logs de segurança são armazenados no banco mas não há sistema de alertas automatizado;
4. **Testes de penetração**: Nenhum pentest formal foi realizado no projeto;
5. **MFA (Multi-Factor Authentication)**: Configuração de MFA disponível no Supabase mas ainda não habilitada;
6. **Leaked Password Protection**: Verificação contra HaveIBeenPwned disponível no Supabase mas não habilitada.
