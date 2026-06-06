# Relatório Tecnológico — Cyber Access Shield
**TCC — Plataforma de Avaliações Seguras**
Autores: Cleber Brant & Pedro  
Data: Junho de 2026

---

## 1. Contextualização do Projeto

O **Cyber Access Shield** é uma plataforma web de avaliações acadêmicas com foco em segurança, desenvolvida como Trabalho de Conclusão de Curso (TCC). O sistema abrange dois eixos principais:

- **Segurança no ambiente avaliativo**: proteção contra fraudes durante a realização de provas (cópia, troca de aba, uso de DevTools, captura de tela).
- **Segurança da plataforma**: conformidade com as diretrizes da OWASP Top 10, políticas de controle de acesso, testes automatizados e esteira de integração contínua com análise estática de segurança (SAST).

O projeto foi inteiramente desenvolvido com tecnologias modernas e validado por ferramentas especializadas de análise de qualidade e segurança de software.

---

## 2. Justificativa das Tecnologias Utilizadas

### 2.1 Frontend: React 18 + TypeScript + Vite

**React 18** foi escolhido por ser a biblioteca JavaScript mais adotada para construção de interfaces de usuário reativas, com vasto ecossistema de componentes, suporte ativo da comunidade e modelo de componentes funcionais baseado em hooks — padrão ideal para isolar lógica de proteção anti-fraude em hooks reutilizáveis.

**TypeScript** adiciona tipagem estática ao JavaScript, eliminando categorias inteiras de erros em tempo de compilação. No contexto de segurança, garante que dados sensíveis (como respostas corretas de questões) nunca sejam passados a componentes que não deveriam recebê-los, por força do sistema de tipos.

**Vite** é o bundler/dev server de nova geração, com suporte nativo a módulos ES e configuração de headers HTTP de segurança diretamente no servidor de desenvolvimento. A build de produção remove automaticamente todos os `console.*` e `debugger` via `esbuild.drop`, evitando exposição de informações de diagnóstico.

### 2.2 Backend-as-a-Service: Supabase (PostgreSQL + Auth)

**Supabase** combina banco de dados PostgreSQL com autenticação gerenciada, API REST gerada automaticamente (PostgREST) e mecanismo de Row Level Security (RLS) nativo. A escolha elimina a necessidade de um servidor de backend dedicado, reduzindo a superfície de ataque e a complexidade operacional, sem abrir mão de controle granular de acesso aos dados.

O PostgreSQL como banco subjacente permite implementar políticas de segurança diretamente no banco (`SECURITY DEFINER` functions, views com `security_barrier`), garantindo que regras de negócio críticas (como verificação de admin e correção de provas) executem com privilégios controlados, independente do que o cliente envie.

### 2.3 Estilização: Tailwind CSS + shadcn/ui

**Tailwind CSS** é um framework utility-first que elimina CSS global arbitrário, reduzindo o risco de injeção de estilos e tornando o código visual auditável. **shadcn/ui** provê componentes acessíveis e testados baseados em Radix UI (primitivos sem estilo), garantindo que elementos interativos como formulários sigam padrões de acessibilidade (ARIA) por padrão.

### 2.4 Gerenciamento de Estado e Requisições: TanStack Query (React Query)

Gerencia o cache de dados do servidor com invalidação automática, prevenindo que dados stale (desatualizados) como status de admin ou gabarito de avaliações sejam exibidos indevidamente após uma sessão expirar.

---

## 3. Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTE (Browser)                     │
│                                                          │
│  React 18 + TypeScript                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Páginas     │  │  Hooks de    │  │  Componentes  │  │
│  │  (Admin/     │  │  Proteção    │  │  UI (shadcn)  │  │
│  │   Aluno)     │  │  Anti-Fraude │  │               │  │
│  └──────┬───────┘  └──────────────┘  └───────────────┘  │
│         │ Supabase JS SDK                                │
└─────────┼───────────────────────────────────────────────┘
          │ HTTPS
┌─────────▼───────────────────────────────────────────────┐
│                    SUPABASE (BaaS)                        │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Auth        │  │  PostgREST   │  │  PostgreSQL   │  │
│  │  (JWT +      │  │  (REST API   │  │  + RLS +      │  │
│  │   Sessions)  │  │   automática)│  │  Functions    │  │
│  └──────────────┘  └──────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Fluxo de correção de avaliação (gabarito protegido):**
1. Aluno submete respostas → cliente chama RPC `submit_and_grade_assessment`
2. A função executa no servidor PostgreSQL com `SECURITY DEFINER`
3. O gabarito nunca trafega para o cliente — a nota é calculada e armazenada server-side
4. Cliente recebe apenas o resultado final (acertos/erros/nota)

---

## 4. Segurança — Conformidade com OWASP Top 10 (2021)

A tabela abaixo mapeia cada categoria de risco da OWASP Top 10 às medidas implementadas na plataforma:

| OWASP | Risco | Medidas Implementadas |
|-------|-------|----------------------|
| A01 | Broken Access Control | RLS em todas as 7 tabelas; `is_admin()` verificado server-side via PostgreSQL; admin nunca inferido do localStorage |
| A02 | Cryptographic Failures | `crypto.getRandomValues()` para geração de senhas temporárias (não `Math.random`); HTTPS enforced via HSTS; source maps desabilitados em produção |
| A03 | Injection | Supabase SDK usa queries parametrizadas; `sanitizeInput()` com `textContent` para encoding de HTML entities; nenhuma concatenação direta de SQL |
| A04 | Insecure Design | Gabarito nunca enviado ao frontend; sessão de avaliação controlada server-side; arquitetura com threat model documentado |
| A05 | Security Misconfiguration | Headers HTTP configurados: CSP, HSTS, X-Frame-Options DENY, X-Content-Type-Options, Permissions-Policy; `console.*` removidos no build |
| A06 | Vulnerable Components | `npm audit --audit-level=high` bloqueante no CI; Dependabot configurado; 6 vulnerabilidades corrigidas via `npm overrides` |
| A07 | Authentication Failures | Supabase Auth com JWT; verificação de sessão em toda rota protegida; logout limpa localStorage |
| A08 | Software Integrity | SHA pinning em todas as GitHub Actions; supply chain protegida contra substituição de ação maliciosa |
| A09 | Logging & Monitoring | Tabela `security_logs` com IP, tipo de evento e timestamp; `user_management_logs` com audit trail completo de ações administrativas |
| A10 | SSRF | Não aplicável (sem requisições server-side a URLs externas) |

---

## 5. Proteção Anti-Fraude no Ambiente Avaliativo

O sistema implementa uma camada de proteção comportamental ativada durante avaliações, composta por hooks React especializados:

| Hook | Proteção | Evento Registrado |
|------|----------|-------------------|
| `useKeyboardProtection` | Bloqueia Ctrl+C, Ctrl+V, Ctrl+P, PrintScreen, F12, Ctrl+Shift+I | `keyboard_shortcut` |
| `useMouseProtection` | Desativa clique direito e menu de contexto | `context_menu_attempt` |
| `useWindowBlurProtection` | Detecta troca de aba ou saída da janela | `window_blur`, `tab_switch` |
| `useBeforeUnloadProtection` | Confirma antes de sair da avaliação | `assessment_cancelled` |
| `useDevToolsDetection` | Detecta abertura do DevTools por diferença de viewport | `devtools_opened` |
| `useAssessmentProtection` | Orquestrador central — aplica proteções apenas para alunos | — |

Todos os eventos são persistidos na tabela `security_logs` via RPC `insert_security_log`, incluindo captura de IP via `inet_client_addr()` no PostgreSQL. Administradores podem auditar tentativas de fraude por avaliação, aluno ou tipo de evento.

**Importante**: as proteções são desativadas automaticamente para usuários com perfil de administrador, evitando impacto na usabilidade de quem gerencia a plataforma.

---

## 6. Controle de Acesso — Row Level Security (RLS)

O Supabase utiliza PostgreSQL RLS para garantir que cada operação de banco de dados seja autorizada no nível da linha, não apenas da API. Todas as 7 tabelas do sistema têm RLS habilitado:

### Tabelas e Políticas Principais

| Tabela | Políticas | Resumo |
|--------|-----------|--------|
| `profiles` | 6 | Usuários veem/atualizam apenas o próprio perfil; admins veem todos; usuário não pode promover a si mesmo a admin |
| `assessments` | 5 | Admins gerenciam todas; alunos veem apenas avaliações ativas e disponíveis |
| `questions` | 4 | Admins gerenciam; alunos veem apenas questões de avaliações que estão realizando |
| `assessment_sessions` | 5 | Alunos acessam apenas as próprias sessões; admins gerenciam todas |
| `user_answers` | 5 | Alunos leem/escrevem apenas respostas vinculadas às próprias sessões |
| `security_logs` | 3 | Alunos inserem próprios logs; admins veem todos |
| `user_management_logs` | 2 | Apenas admins inserem e leem logs de auditoria |

### Funções com SECURITY DEFINER

Para evitar recursão nas políticas RLS (um problema documentado do PostgreSQL com auto-referência em tabelas), funções críticas usam `SECURITY DEFINER`:

- `is_admin(uid)` / `is_user_admin(uid)` — Verificação de admin sem recursão
- `submit_and_grade_assessment(session_id, answers)` — Correção server-side com acesso protegido ao gabarito
- `insert_security_log(...)` — Inserção de logs de fraude com contexto de sessão
- `delete_assessment_with_logs(assessment_id)` — Deleção em cascata com auditoria
- `reset_user_password(user_id, temp_password)` — Gestão de senhas temporárias por admins

---

## 7. Esteira CI/CD — DevSecOps

O projeto implementa uma pipeline de integração contínua com foco em segurança (DevSecOps), composta por três workflows no GitHub Actions:

### 7.1 CI — Lint & Build (`ci.yml`)
**Gatilhos**: push para `main`/`develop`, pull requests para `main`

| Etapa | Ferramenta | Resultado |
|-------|-----------|-----------|
| Análise estática | ESLint + `eslint-plugin-security` + `eslint-plugin-no-secrets` | Detecta padrões inseguros e segredos hardcoded |
| Testes + cobertura | Vitest | 126/126 testes, cobertura > 80% nas funções utilitárias |
| Verificação de tipos | TypeScript `--noEmit` | Zero erros de tipo no código de produção |
| Build de produção | Vite + Rollup | Bundle minificado sem console/debugger |

### 7.2 Análise SAST — SonarCloud (`sonarcloud.yml`)
**Gatilhos**: push para `main`, pull requests

O **SonarCloud** é uma plataforma de análise estática de segurança (SAST) que avalia o código em 5 dimensões com Quality Gate obrigatório nível A:

| Métrica | Status | Alvo |
|---------|--------|------|
| Security Rating | A | A |
| Reliability Rating | A | A |
| Maintainability Rating | A | A |
| Coverage | ≥ 80% | ≥ 80% |
| Security Hotspots Reviewed | 100% | 100% |

Problemas corrigidos durante o ciclo de desenvolvimento via SonarCloud:
- `Math.random()` substituído por `crypto.getRandomValues()` (A02 Crypto)
- Regex com potencial ReDoS corrigida
- SHA pinning aplicado em todas as GitHub Actions

### 7.3 Auditoria de Dependências (`dependency-audit.yml`)
**Gatilhos**: push para `main`, PRs, schedule mensal

Executa `npm audit --audit-level=high` (bloqueante) para impedir que dependências com vulnerabilidades HIGH ou CRITICAL sejam mergeadas. Seis vulnerabilidades foram corrigidas na esteira:
- 4 HIGH: XSS via redirect, ReDoS, path traversal
- 2 MODERATE: problemas em dependências transitivas

---

## 8. Qualidade e Testes

### 8.1 Testes Unitários
126 testes distribuídos em 7 arquivos, cobrindo todas as funções utilitárias críticas:

| Arquivo de Testes | Testes | Cobertura | Foco |
|-------------------|--------|-----------|------|
| `secure-utils.test.ts` | 13 | 100% | Sanitização, hash, verificação de admin |
| `user-utils.test.ts` | 54 | 100% | Formatação, filtros, paginação |
| `fraud-logs-utils.test.ts` | 29 | 100% | Formatação de eventos de segurança |
| `assessment-availability.test.ts` | 12 | 100% | Lógica de disponibilização por data/hora |
| `session-progress.test.ts` | 10 | 100% | Progresso de sessão de avaliação |
| `date-utils.test.ts` | 3 | 100% | Utilitários de data |
| `utils.test.ts` | 5 | 100% | Utilitários gerais |

### 8.2 Ferramentas de Análise Estática
- **ESLint** com `eslint-plugin-security`: detecta uso de `eval()`, `innerHTML`, `dangerouslySetInnerHTML`, regex insegura e outros padrões de risco
- **eslint-plugin-no-secrets**: impede commit acidental de tokens, chaves de API e senhas
- **TypeScript strict mode**: configuração mais restrita do compilador, eliminando `any` implícito e acessos inseguros a propriedades

---

## 9. Headers HTTP de Segurança

Configurados no `vite.config.ts` para o servidor de produção:

| Header | Valor | Proteção |
|--------|-------|----------|
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'unsafe-inline'` | XSS, injeção de scripts |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Forçar HTTPS, downgrade attacks |
| `X-Frame-Options` | `DENY` | Clickjacking |
| `X-Content-Type-Options` | `nosniff` | MIME sniffing |
| `X-XSS-Protection` | `1; mode=block` | XSS legado |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Vazamento de URL |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Acesso a hardware |

---

## 10. Restrição de Plataforma — Bloqueio Mobile

A plataforma foi projetada exclusivamente para computadores e notebooks. Dispositivos móveis são bloqueados na camada de entrada da aplicação (`App.tsx`) por dois critérios combinados:

1. **User-Agent**: detecção de Android, iOS, Windows Phone e outros sistemas mobile
2. **Viewport**: largura de tela menor que 768px (breakpoint `sm` do Tailwind)

Justificativa técnica: o ambiente de avaliação segura requer controle sobre eventos de teclado, mouse e janela. Em dispositivos touch, esses eventos têm comportamento diferente e as proteções anti-fraude (bloqueio de PrintScreen, detecção de blur de janela, monitoramento de DevTools) não operam de forma confiável.

---

## 11. MCPs (Model Context Protocol) — Integração com IA

O projeto foi integrado ao ecossistema de MCPs (Model Context Protocol), permitindo que ferramentas de IA como o Claude Code interajam diretamente com a infraestrutura do projeto:

| MCP | Escopo | Capacidades |
|-----|--------|-------------|
| **Supabase MCP** | Projeto | Consulta de tabelas, execução de SQL, aplicação de migrations, análise de advisors de segurança |
| **GitHub MCP** | Global | Leitura de repositório, issues, pull requests, workflows |
| **SonarQube MCP** | Global | Consulta de issues de qualidade, security hotspots, quality gate status |

Esta integração permitiu, no escopo deste trabalho, executar a auditoria de segurança do banco de dados diretamente via MCP, validando políticas RLS, identificando vulnerabilidades e aplicando correções de performance.

---

## 12. Métricas e Resultados

### 12.1 Segurança
| Métrica | Valor |
|---------|-------|
| Vulnerabilidades npm (high/critical) | 0 |
| SonarCloud Security Rating | A |
| Security Hotspots revisados | 100% |
| Tabelas com RLS habilitado | 7/7 (100%) |
| OWASP Top 10 cobertos | 9/10 (A10 não aplicável) |

### 12.2 Qualidade de Código
| Métrica | Valor |
|---------|-------|
| Testes unitários | 126/126 passando |
| Cobertura de testes (utilitários) | ~100% |
| SonarCloud Reliability Rating | A |
| SonarCloud Maintainability Rating | A |
| Erros de TypeScript em produção | 0 |

### 12.3 DevSecOps
| Métrica | Valor |
|---------|-------|
| Workflows de CI/CD | 3 (Lint+Build, SAST, Dep Audit) |
| SHA pinning em Actions | Sim (todas) |
| Dependabot configurado | Sim |
| npm audit bloqueante no CI | Sim (high+critical) |

---

## 13. Limitações Conhecidas e Trabalhos Futuros

As seguintes melhorias foram identificadas mas não implementadas no escopo do TCC, por requererem recursos pagos, tempo adicional ou maior risco de regressão:

| Melhoria | Justificativa da Não Implementação | Prioridade |
|----------|------------------------------------|-----------|
| **MFA (Autenticação Multi-Fator)** | Recurso disponível no Supabase; não habilitado no plano free tier | Alta |
| **HaveIBeenPwned** | API disponível; requer configuração adicional no Supabase Auth | Média |
| **DAST (Teste Dinâmico de Segurança)** | OWASP ZAP requer ambiente de staging dedicado | Alta |
| **Pentest formal** | Requer contratação ou voluntários especializados | Alta |
| **Testes de integração (React Testing Library)** | Cobertura atual foca em funções puras; componentes React requerem mock de Supabase | Média |
| **Alertas automáticos de segurança** | Logs registrados mas sem notificação em tempo real | Baixa |
| **CSP sem `unsafe-inline`** | shadcn/ui e Radix UI injetam estilos inline; requer refatoração da lib de componentes | Baixa |

---

## 14. Referências Tecnológicas

- React 18 — https://react.dev
- TypeScript — https://www.typescriptlang.org
- Vite — https://vitejs.dev
- Supabase — https://supabase.com/docs
- OWASP Top 10 (2021) — https://owasp.org/Top10
- OWASP SAMM — https://owaspsamm.org
- SonarCloud — https://sonarcloud.io/documentation
- shadcn/ui — https://ui.shadcn.com
- TanStack Query — https://tanstack.com/query
- Tailwind CSS — https://tailwindcss.com
- Vitest — https://vitest.dev
- GitHub Actions — https://docs.github.com/actions
- Model Context Protocol — https://modelcontextprotocol.io
