# Material para o TCC — Diagramas + Prints (atualizados)

Gerado em 22/06/2026 a partir do schema real (Supabase MCP) e da aplicação rodando
(branch `feature/electron-desktop`). Resolução das telas web: 1440×900 @2x.

---

## 1. Diagramas atualizados (substituem Figuras 7 e 8 do PDF)

| Arquivo | Substitui | Conteúdo |
|---|---|---|
| [../diagramas/fig7_modelo_relacional.png](../diagramas/fig7_modelo_relacional.png) | **Figura 7** — Diagrama inicial do banco relacional | Modelo completo, **8 tabelas**, com cardinalidade (pé-de-galinha), PK/FK e todas as colunas |
| [../diagramas/fig8_monitoramento_seguranca.png](../diagramas/fig8_monitoramento_seguranca.png) | **Figura 8** — Modelo de monitoramento de eventos suspeitos | Subconjunto de segurança/auditoria |

Fontes editáveis (Mermaid): `fig7_modelo_relacional.mmd`, `fig8_monitoramento_seguranca.mmd`.
Para re-renderizar: `npx -p @mermaid-js/mermaid-cli mmdc -i ARQUIVO.mmd -o ARQUIVO.png -t neutral -b white --scale 3`.

### O que mudou vs. os diagramas antigos do PDF
- `user_events` **deixou de existir** → virou **`security_logs`** (com `event_type`, `event_details`, `ip_address`, `user_agent`, ligada a usuário/avaliação/sessão).
- Nova tabela **`user_management_logs`** — auditoria de ações de admin (trocar papel, resetar senha, ativar/desativar).
- `assessment_sessions` ganhou colunas anti-fraude: `is_cancelled`, `cancellation_reason`, `warning_count`, `current_question_index`, `time_elapsed_seconds`, `last_activity_at`.
- `assessments` ganhou `max_attempts` e `available_from` (agendamento).
- `profiles` ganhou `display_name`, `is_active`, `temp_password`, `temp_password_created_at`.

---

## 2. Prints das telas (automatizados via Playwright)

| Arquivo | Tela | Uso no TCC |
|---|---|---|
| `01-landing.png` | Landing — parte inicial (hero) | Apresentação do produto |
| `02-login.png` | Login (web, dark) | Autenticação |
| `03-register.png` | Cadastro | Autenticação |
| `04-mobile-block.png` | Bloqueio mobile (tema claro) | **Bloqueio de dispositivos móveis** |
| `04b-mobile-block-dark.png` | Bloqueio mobile (tema escuro) | idem (variante) |
| `05-prof-dashboard.png` | Dashboard do professor/admin | Painel administrativo |
| `06-prof-create-assessment-01..03.png` | Criar avaliação (fracionado por seção) | Criação de prova |
| `07-prof-edit-assessment-01..03.png` | Editar avaliação (fracionado por seção) | Edição de prova |
| `08-prof-fraud-logs.png` | Logs de fraude (80 registros, estatísticas) | **Monitoramento de eventos suspeitos** |
| `09-prof-user-management.png` | Gerenciamento de usuários | Administração |
| `10-aluno-dashboard.png` | Dashboard do aluno | Visão do estudante |
| `11-aluno-assessment-kiosk.png` | Prova em andamento (toast "Modo Avaliação Ativado") | Realização da prova / modo seguro |
| `12-aluno-result.png` | Resultado (mostra cancelamento por violação) | Correção / gabarito |
| `13-turnstile-login.png` | Login **com Cloudflare Turnstile** (deploy) | **Cloudflare Turnstile** |
| `14-turnstile-register.png` | Cadastro com Turnstile (deploy) | **Cloudflare Turnstile** |

> Turnstile só aparece em produção (`skipTurnstile = isElectron() || import.meta.env.DEV`),
> por isso 13/14 foram capturados do deploy Vercel; as demais telas do dev local refletem o redesign atual.

---

## 3. Testes unitários (tópico "126 testes e SonarCloud")

Saída real de `npm run test` (22/06/2026):

```
 Test Files  7 passed (7)
      Tests  126 passed (126)
   Duration  ~0.6s
```

Confirma a contagem de **126 testes**. Para cobertura: `npm run test:coverage`.

---

## 4. Prints do app desktop (Electron) — capturados por câmera

> **Metodologia:** durante a prova no app desktop, a captura digital de tela
> (PrintScreen / gravação / snipping) é **bloqueada** pela proteção de conteúdo
> (`setContentProtection`, [electron/kiosk.ts](../../electron/kiosk.ts)) — retorna
> imagem preta. Por isso estas telas foram **fotografadas por câmera externa**, o que
> por si só **evidencia a proteção de captura funcionando**. App versão 1.0.1.

| Arquivo | Recurso demonstrado |
|---|---|
| `15-desktop-kiosk-prova.jpg` | Prova em **modo kiosk** (tela cheia travada, janela nativa Electron) |
| `16-desktop-monitor-secundario-bloqueado.jpg` | **Bloqueio de monitor secundário** ("Este monitor está bloqueado durante a prova") |
| `17-desktop-menu-contexto-bloqueado.jpg` | **Menu de contexto** (botão direito) desativado na prova |
| `18-desktop-copiar-colar-bloqueado.jpg` | **Copiar/colar/recortar** desativados na prova |

> A própria impossibilidade de captura digital cobre o tópico **"Proteção de captura de tela"**.

## 5. CHECKLIST — ainda faltam (externos / opcionais)

- [x] **Modalidade desktop (Electron / kiosk)** → `15-desktop-kiosk-prova.jpg`
- [x] **Proteção de captura de tela** → evidenciada pela captura digital bloqueada (fotos 15-18)
- [x] **Bloqueio de monitores secundários** → `16-desktop-monitor-secundario-bloqueado.jpg`
- [ ] **Aviso de DevTools** — abrir DevTools (F12) durante a prova e fotografar o overlay
      ([src/components/DevToolsWarning.tsx](../../src/components/DevToolsWarning.tsx)).
- [ ] **Gabarito server-side** — sem tela própria. Sugestão: print do código da função
      `submit_and_grade_assessment` (gabarito nunca sai do servidor) + tela de
      Resultado (`12-aluno-result.png`).
- [ ] **SonarCloud** — print do dashboard (Quality Gate **Passed**, cobertura). Já está verde.
- [ ] **Resultados dos testes com usuários (formulário)** — print das respostas do
      Google Forms (protocolo de pesquisa aluno/professor).

---

## Como regenerar os prints automatizados
1. `npm run dev` (sobe em localhost:8080)
2. Rodar o script Playwright em `C:/Users/clebe/AppData/Local/Temp/pwshot/` (`capture.mjs`, `capture3.mjs`).

Contas de teste usadas: `professor.teste@cyberaccessshield.com` (admin) e
`aluno.teste@cyberaccessshield.com` (aluno).
