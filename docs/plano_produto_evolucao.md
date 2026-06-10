# Plano de Evolução de Produto — Cyber Access Shield
**De projeto acadêmico a SaaS multi-instituição**
Autores: Cleber Brant & Pedro
Data: Junho de 2026
Status: **PLANEJAMENTO — nada deste documento está em desenvolvimento**

---

## 1. Diagnóstico do Modelo Atual

O sistema hoje funciona muito bem para **um único contexto**: um grupo de administradores e um grupo de alunos, todos no mesmo "espaço". O schema real reflete isso:

```
profiles ──── is_admin: boolean        ← papel binário (admin OU aluno)
assessments ── created_by              ← pertence a um admin, mas é
                                          visível para TODOS os alunos
assessment_sessions / user_answers / security_logs
                                       ← amarrados a user + assessment
```

**Limitações estruturais para virar produto:**

| # | Limitação | Consequência prática |
|---|---|---|
| 1 | Não existe conceito de **instituição** | Impossível atender 2 escolas no mesmo banco sem que dados se misturem |
| 2 | Não existe conceito de **turma** | Professor não consegue aplicar prova só para "Turma A 2026/1" |
| 3 | Avaliação é **global** | Toda avaliação ativa aparece para todo aluno cadastrado |
| 4 | Papel é **binário** (`is_admin`) | Não há professor sem poder total, nem coordenador, nem dono da conta |
| 5 | Cadastro é **aberto** | Qualquer pessoa se registra e vira "aluno" da plataforma inteira |
| 6 | Disponibilidade é da **avaliação** | `available_from` é único — não dá para aplicar a mesma prova em horários diferentes por turma |

Nada disso é defeito — é o escopo certo para o TCC. Mas é exatamente a fronteira entre "sistema" e "produto".

---

## 2. Visão de Produto

**Tese:** plataforma B2B de avaliações seguras vendida para instituições de ensino, com o desktop anti-fraude como diferencial competitivo difícil de copiar.

**Segmentos possíveis (ordenar por validação, não por opinião):**

| Segmento | Dor | Disposição a pagar | Complexidade de venda |
|---|---|---|---|
| Cursinhos preparatórios / concursos | Simulados com integridade, ranking confiável | Média-alta | Baixa (dono decide) |
| Faculdades privadas / EAD | Provas online com validade, exigência do MEC sobre integridade | Alta | Alta (ciclo longo) |
| Escolas técnicas / profissionalizantes | Avaliações práticas padronizadas multi-unidade | Média | Média |
| Certificadoras / treinamento corporativo | Certificação remota auditável, compliance | Alta | Média |
| Escolas K-12 | Provas digitais | Baixa | Alta + LGPD de menores |

**Recomendação inicial:** cursinhos e certificadoras como ICP (perfil de cliente ideal) de validação — ciclo de venda curto, dor clara, sem dados de menores. Universidades como segundo passo, quando houver casos de uso comprovados.

**Personas:**

- **Dono/coordenador da instituição** — compra, configura, quer relatórios e marca própria.
- **Professor/aplicador** — cria provas, gerencia suas turmas, corrige, acompanha fraude.
- **Aluno/candidato** — entra por convite, faz prova, vê resultado.
- **(Plataforma) Super admin** — nós: suporte, billing, métricas de uso.

---

## 3. Modelo de Domínio Alvo

A mudança central: **tudo passa a pertencer a uma organização**, e o acesso do aluno passa a ser **por atribuição**, não por existência.

```
┌──────────────────────────────────────────────────────────────────┐
│ organizations (tenant)                                           │
│  nome · slug · branding(jsonb) · plano · settings                │
└───────┬──────────────────────────────────────────────────────────┘
        │
        ├── organization_members  (user × org × papel)
        │     papel: owner | admin | teacher | student
        │     → substitui profiles.is_admin
        │     → mesmo usuário pode estar em N orgs com papéis diferentes
        │
        ├── classes (turmas)
        │     nome · período · código de auto-matrícula · arquivada
        │     └── class_members (aluno × turma)
        │
        ├── assessments  (+ organization_id)
        │     └── assessment_assignments  ← A PEÇA-CHAVE
        │           avaliação × (turma OU aluno avulso)
        │           available_from / available_until POR ATRIBUIÇÃO
        │           max_attempts pode sobrescrever por atribuição
        │
        └── invites
              email · papel · turma(s) · token · expiração · aceito_em
```

**O que muda nas tabelas existentes:**

| Tabela | Mudança |
|---|---|
| `profiles` | Perde `is_admin` (vira papel em `organization_members`); ganha nada de tenant — perfil é global, vínculo é que é por org |
| `assessments` | Ganha `organization_id`; `available_from` migra para `assessment_assignments` |
| `assessment_sessions` | Ganha `organization_id` (desnormalizado, para RLS barata) |
| `security_logs` | Ganha `organization_id` (admin só vê fraude da própria org) |
| `questions` / `user_answers` | Herdam tenant via avaliação/sessão — avaliar se RLS via join aguenta ou se desnormaliza |
| `user_management_logs` | Ganha `organization_id`; ações de gestão ficam restritas à org |

**Regra de visibilidade nova (a mais importante do produto):**
aluno vê uma avaliação **somente se** existe `assessment_assignment` ligando a avaliação a uma turma em que ele está (ou a ele diretamente) **e** a janela da atribuição está aberta. Hoje: "é aluno → vê tudo". Amanhã: "foi atribuído → vê".

---

## 4. Estratégia Multi-Tenant no Supabase

Três caminhos clássicos:

| Estratégia | Prós | Contras | Veredito |
|---|---|---|---|
| **A. Banco único + `organization_id` + RLS** | Padrão Supabase; um deploy; barato; RLS já é nossa competência central | Blast radius de bug de policy é todo o sistema | **Recomendada** |
| B. Schema por tenant | Isolamento médio | Migrações multiplicadas, tooling Supabase não ajuda | Não |
| C. Projeto Supabase por tenant | Isolamento máximo | Custo e operação por cliente; inviável self-service | Só como oferta enterprise dedicada, lá na frente |

**Detalhes da opção A:**

- Papel/org ativos resolvidos por função `SECURITY DEFINER` (`current_user_role(org_id)`) ou custom claims no JWT (Supabase Auth Hooks) — claims são mais rápidos, função é mais simples de manter. Decidir em spike técnico.
- Toda policy nova segue o template `organization_id = qualquer-org-em-que-sou-X`.
- `submit_and_grade_assessment` e demais RPCs ganham verificação de org no topo.

### ⚠️ Risco número 1 do projeto inteiro

**Reescrever as 38 policies RLS é a operação mais perigosa do roadmap.** Histórico nosso: mudanças no Supabase já causaram bugs gerais no sistema. Mitigações obrigatórias antes de qualquer migração:

1. **Supabase branching** (banco de teste idêntico) para todo desenvolvimento de policy — nunca direto na produção.
2. **Suíte de testes de policies** (pgTAP ou scripts SQL de asserção): para cada tabela × papel × org, testar "vê o que deve" E "não vê o que não deve". Vira gate de CI.
3. Migração **expand → migrate → contract**: adicionar colunas/policies novas convivendo com as antigas, migrar dados, só então remover o legado.
4. Org "default" criada na primeira migração; todos os dados atuais movidos para ela; `is_admin = true` vira papel `admin` na org default. Sistema atual continua funcionando idêntico no dia seguinte.

---

## 5. Papéis e Permissões Alvo

| Capacidade | Owner | Admin | Teacher | Student |
|---|---|---|---|---|
| Billing, plano, branding, domínio | ✓ | — | — | — |
| Convidar/remover membros da org | ✓ | ✓ | só alunos p/ suas turmas | — |
| Criar/arquivar turmas | ✓ | ✓ | ✓ (suas) | — |
| Criar avaliações | ✓ | ✓ | ✓ | — |
| Atribuir avaliação a turma | ✓ | ✓ | ✓ (suas turmas) | — |
| Ver resultados/fraude | org inteira | org inteira | suas turmas | só os próprios |
| Fazer avaliação atribuída | — | — | — | ✓ |

Professor deixa de ser "admin com poder total" — hoje qualquer admin gerencia usuários e vê tudo. Essa separação é requisito de venda para instituição (coordenador não quer professor mexendo em billing nem vendo turma alheia).

---

## 6. Fluxos Gerenciais Novos

**Onboarding da instituição (self-service):**
cadastro → cria org (vira owner) → assistente: criar primeira turma → convidar alunos → criar primeira avaliação → atribuir. Meta: primeira prova aplicada em < 30 min sem falar com a gente.

**Entrada de alunos (3 mecanismos, do mais barato ao mais formal):**
1. **Código de turma** — professor projeta o código, aluno se cadastra e digita (estilo Google Classroom). Mínimo atrito, ideal para cursinho.
2. **Convite por e-mail** — individual ou CSV em lote; aluno chega com vínculo pronto.
3. **Domínio autorizado** — quem se cadastra com `@instituicao.edu.br` entra automaticamente na org (futuro, junto com SSO).

**Aplicação de prova:** criar avaliação (já existe) → atribuir a turmas com janela própria por turma → acompanhar em tempo real quem está fazendo (Realtime do Supabase já disponível) → resultados e logs de fraude **filtrados por turma** → exportar CSV/PDF.

**Dashboards por papel:** owner/admin vê org inteira (uso, professores, fraude agregada); professor vê suas turmas (notas, distribuição, violações); aluno vê histórico próprio (já existe).

---

## 7. White Label

Quatro níveis, do barato ao caro — vender como degraus de plano:

| Nível | O quê | Esforço técnico |
|---|---|---|
| **1. Branding** | Logo, cores, nome exibido dentro do app | **Baixo** — design system já é 100% CSS variables HSL; tema por org = aplicar `branding` jsonb da org como overrides de tokens no login |
| **2. Subdomínio** | `instituicao.cyberaccessshield.com.br` | Médio — wildcard DNS + resolução de org pelo host |
| **3. Domínio próprio + e-mails** | `provas.instituicao.edu.br`, e-mails transacionais com remetente do cliente | Médio-alto — domínio custom no Vercel + SMTP custom no Supabase Auth |
| **4. Desktop com marca** | Exe com nome/ícone do cliente | Duas rotas: (a) **runtime** — exe único que aplica branding da org após login (barato, recomendado); (b) **build por cliente** — ícone/nome próprios no executável (caro: build + assinatura de código por cliente; só enterprise) |

Decisão de arquitetura desde já: **nenhum texto/cor/logo hardcoded em tela nova** — tudo via token e via componente `Logo` (já é assim pós-redesign; manter disciplina).

---

## 8. Monetização (hipóteses a validar — não implementar)

| Plano | Alvo | Conteúdo | Modelo de preço |
|---|---|---|---|
| **Free** | professor individual | 1 professor, 1 turma, ~30 alunos, provas web | R$ 0 (aquisição/virada de chave) |
| **Pro** | cursinho, professor power | turmas ilimitadas, desktop anti-fraude, relatórios, exportação | por aluno ativo/mês **ou** faixa (até 200/500/1000 alunos) |
| **Institucional** | faculdade, certificadora | white label, SSO, multi-unidade, SLA, DPA assinado | contrato anual |

**O desktop anti-fraude fica atrás do paywall** — é o diferencial que justifica preço e que concorrente web-only não tem.

Implicação técnica para planejar desde a fundação: `organizations.plan` + checagem de limites (nº alunos, nº turmas) **server-side** (RPC/policy), nunca só na UI. Billing em si (Stripe) fica para a última fase.

---

## 9. Empresa e Conformidade

- **LGPD**: ao atender instituições, nós viramos **operador** e a instituição **controladora** → precisa de DPA (acordo de processamento) padrão anexo ao contrato. Dados de menores (K-12) exigem consentimento de responsável — mais um motivo para ICP inicial ser cursinho/certificadora (maiores de idade).
- **Retenção**: política explícita para `security_logs` e respostas (ex.: 2 anos, configurável por org no plano institucional).
- **Termos de uso e privacidade**: por enquanto um só da plataforma; white label nível 3+ exige aceite também dos termos da instituição.
- **Formalização**: CNPJ + contrato de sócios (Cleber & Pedro) antes do primeiro cliente pagante; marca — verificar disponibilidade de registro "Cyber Access Shield" no INPI (e considerar se o nome de produto comercial será outro).

---

## 10. Roadmap em Fases

Cada fase entrega valor sozinha e termina com gate de qualidade (testes de policy + suíte atual + smoke web e desktop). **Nenhuma fase começa antes de fecharmos as decisões da seção 11.**

| Fase | Entrega | Risco | Observação |
|---|---|---|---|
| **F0 — Validação** | 5–10 conversas com donos de cursinho/certificadoras; definir ICP, preço-teste e nome comercial | — | Sem código. Decide tudo que vem depois |
| **F1 — Fundação multi-tenant** | `organizations` + `organization_members` + papéis; migração `is_admin` → papel; **reescrita RLS com suíte de testes de policy**; org default com dados atuais | **ALTO** (RLS) | A fase mais longa e mais perigosa; branching + expand/contract obrigatórios |
| **F2 — Turmas e atribuições** | `classes`, `class_members`, `assessment_assignments`; visibilidade por atribuição; janela por turma | Médio | Muda a regra central de visibilidade — segunda maior reescrita de policy |
| **F3 — Onboarding e convites** | invites por e-mail + CSV, código de turma, assistente de primeira prova | Baixo | Primeiro momento "self-service de verdade" |
| **F4 — Relatórios e gestão** | dashboards por turma/org, exportação CSV/PDF, fraude filtrada por turma | Baixo | O que o coordenador compra |
| **F5 — White label 1–2 + billing** | theming por org, subdomínio, planos com limites server-side, Stripe | Médio | Primeiro faturamento |
| **F6 — Enterprise** | SSO (SAML/Google Workspace), domínio próprio, desktop com branding runtime, DPA | Médio | Puxado por contrato assinado, não especulativo |

**Princípio de sequenciamento:** F1 e F2 são o produto; F3–F4 são a venda; F5–F6 são a receita. Não pular etapas — white label sem multi-tenant sólido é fachada.

---

## 11. Decisões em Aberto (discutir Cleber × Pedro antes da F1)

1. **ICP de validação**: cursinho, certificadora, ou os dois? (define linguagem do produto e preço)
2. **Nome comercial**: manter "Cyber Access Shield" ou nome novo para o produto? (afeta marca, domínio, INPI)
3. **Self-service vs venda assistida** no início? (recomendação: assistida nos 5 primeiros clientes, self-service depois)
4. **Resolução de papel**: JWT custom claims vs função SQL? (spike técnico de 1 dia na F1)
5. **Aluno multi-org**: mesmo e-mail em duas instituições — confirmar que o modelo membership cobre (cobre, mas a UX de "trocar de organização" precisa ser desenhada).
6. **Preço-teste** para as conversas da F0 (sugestão: ancorar em R$ X por aluno/mês no Pro e reagir).
7. **O TCC congela onde?** Sugestão: branch/tag `tcc-final` intocável; produto evolui em branch própria depois da banca.

---

## 12. Riscos Principais

| Risco | Mitigação |
|---|---|
| **Regressão de RLS na migração multi-tenant** (já aconteceu antes) | Branching de banco, suíte pgTAP de policies como gate de CI, expand→migrate→contract, org default |
| Construir multi-tenant sem cliente validado | F0 antes de qualquer linha de código |
| Escopo crescer (SSO, billing, white label) antes da fundação | Roadmap sequencial; F5+ só com F1–F2 estáveis |
| Conflito produto × TCC (banca avalia o que está congelado) | Tag/branch de congelamento do TCC |
| Custo Supabase/Vercel ao escalar | Single-DB mantém custo linear; revisar limites de plano na F5 |
