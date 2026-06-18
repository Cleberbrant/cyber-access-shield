# Formulário de Pesquisa — Perfil PROFESSOR (Admin)

> **Distribuição restrita:** este formulário é entregue **apenas a docentes de confiança**,
> porque o perfil de professor é também **administrador** da plataforma (cria/edita/exclui
> avaliações, gerencia contas, vê todos os logs). Não divulgue em massa.
>
> **Como usar:** estrutura pronta para montar no **Google Forms**. Cada `SEÇÃO N` vira uma
> seção; cada pergunta indica o **tipo de campo**. Textos entre `[...]` o pesquisador preenche.

---

## Configurações gerais do Google Forms

- **Título do formulário:** Avaliação de Usabilidade e Segurança — CyberAccessShield (Professor)
- **Coletar e-mail:** _Opcional_ (pode ativar, já que o grupo é restrito e conhecido).
- **Limitar a 1 resposta:** _Opcional_.
- **Barra de progresso:** _Ativada_.
- **Mensagem de confirmação:** "Obrigado, professor(a)! Seu retorno é decisivo para este TCC. 🛡️"

---

## SEÇÃO 1 — Apresentação

**(Texto descritivo, sem campo)**

> ### Avaliação do CyberAccessShield — Visão do Professor
>
> Você foi convidado(a), como docente, a avaliar o **CyberAccessShield** — plataforma de
> **avaliações online com ambiente anti-fraude**. Sua tarefa: **criar e publicar uma
> avaliação**, acompanhar os **logs de fraude** e explorar a **gestão de contas**; depois,
> responder este formulário.
>
> ⏱️ **Tempo estimado:** 15 a 25 minutos (teste + formulário).
>
> 🔒 Participação **voluntária**; dados tratados conforme a LGPD (termo na próxima seção).
>
> **Pesquisador(a):** [nome] · **Orientador(a):** [nome] · **Instituição:** [instituição/curso]
> · **Contato:** [e-mail do pesquisador]

---

## SEÇÃO 2 — Termo de Consentimento Livre e Esclarecido (TCLE / LGPD)

**(Texto descritivo, sem campo)**

> ### Termo de Consentimento Livre e Esclarecido
>
> Pesquisa de **finalidade exclusivamente acadêmica** (TCC), avaliando a usabilidade e a
> eficácia de segurança da plataforma sob a ótica de um docente.
>
> **Tratamento de dados (Lei nº 13.709/2018 — LGPD):**
> - **Base legal:** seu **consentimento** (art. 7º, inciso I).
> - **Dados coletados:** respostas deste formulário e dados profissionais não sensíveis
>   (área de atuação, tempo de docência). **Não** é obrigatório informar nome ou instituição.
> - **Finalidade:** análise agregada para o TCC; resultados divulgados de forma **anônima**.
> - **Armazenamento:** Google Forms/Sheets, sob conta protegida do pesquisador.
> - **Compartilhamento:** os dados **não** são vendidos nem repassados a terceiros.
> - **Direitos:** acesso, correção, **exclusão** e retirada de consentimento a qualquer
>   momento pelo e-mail [e-mail do pesquisador], sem prejuízo.
>
> ⚠️ **Sobre a conta de professor:** você usará uma conta com **privilégios de administrador**
> em um **ambiente de teste**. As avaliações, contas e logs que você manipular são apenas
> para fins de avaliação da pesquisa. Evite inserir dados reais de terceiros.

**Pergunta 2.1 — Consentimento** *(obrigatória)*
- **Tipo:** Múltipla escolha
- **Enunciado:** Li e compreendi o termo e **concordo em participar** voluntariamente.
- **Opções:**
  - ( ) Sim, concordo em participar.
  - ( ) Não concordo. *(Configurar para encerrar o formulário nessa resposta.)*

---

## SEÇÃO 3 — Roteiro do teste (faça antes de responder)

**(Texto descritivo, sem campo)**

> ### O que fazer na plataforma
>
> **Passo 1 — Escolha o ambiente (você decide):**
> - **Web:** **https://cyber-access-shield.vercel.app/** (Chrome/Edge atualizado); ou
> - **Desktop (Electron):** baixe e abra em **[link do instalador/.exe]**.
>
> **Passo 2 — Faça login como professor:**
> - **E-mail:** `professor.teste@cyberaccessshield.com`
> - **Senha:** `ProfesorTeste@2026`
> *(ou use a conta dedicada que o pesquisador forneceu a você.)*
>
> **Passo 3 — Crie uma avaliação:** vá em **Criar Avaliação** e monte uma prova com algumas
> questões. Experimente **tipos diferentes** de questão (múltipla escolha, verdadeiro/falso,
> resposta curta, código, associação) e defina título, descrição e tempo, se houver.
>
> **Passo 4 — Publique** a avaliação e confirme que ela fica **disponível para os alunos**
> (ela passa a aparecer na lista de quem tem perfil de aluno).
>
> **Passo 5 — Veja os Logs de Fraude:** abra a tela de **Logs de Fraude** e observe os
> eventos registrados (troca de aba, perda de foco, copiar/colar, DevTools, etc.), agrupados
> por aluno e por avaliação. *(Se possível, peça a alguém — ou use a conta de aluno
> `aluno.teste@cyberaccessshield.com` / `AlunoTeste@2026` em outra janela — para fazer a
> prova e tentar burlar, gerando logs reais para você analisar.)*
>
> **Passo 6 — Explore a Gestão de Usuários:** veja a lista de contas e as ações de admin —
> **ativar/desativar** conta, **redefinir senha**, **alterar perfil** (aluno↔admin) e os
> **logs de auditoria**. (Não precisa aplicar de fato; basta explorar para avaliar.)
>
> Ao terminar, responda as próximas seções. 👇

---

## SEÇÃO 4 — Perfil do docente

**Pergunta 4.1 — Área de atuação / disciplina:** *(opcional)*
- **Tipo:** Resposta curta

**Pergunta 4.2 — Tempo de experiência como docente:** *(obrigatória)*
- **Tipo:** Múltipla escolha
- **Opções:** ( ) Menos de 2 anos ( ) 2–5 anos ( ) 6–10 anos ( ) Mais de 10 anos

**Pergunta 4.3 — Você já aplicou provas ONLINE para seus alunos?** *(obrigatória)*
- **Tipo:** Múltipla escolha
- **Opções:** ( ) Nunca ( ) Algumas vezes ( ) Com frequência

**Pergunta 4.4 — A fraude/cola em provas online é uma preocupação real para você?** *(obrigatória)*
- **Tipo:** Escala linear (1 a 5) — 1 = Nenhuma preocupação · 5 = Grande preocupação

**Pergunta 4.5 — Qual ambiente você usou no teste?** *(obrigatória)*
- **Tipo:** Múltipla escolha
- **Opções:** ( ) Apenas Web ( ) Apenas Desktop ( ) Os dois

---

## SEÇÃO 5 — Criação e publicação de avaliações

> **(Texto)** Marque o quanto concorda. **1 = Discordo totalmente · 5 = Concordo totalmente.**

**Escala linear (1 a 5)**, *(obrigatórias)*:

- **5.1** — Foi **fácil criar** uma avaliação do zero.
- **5.2** — A variedade de **tipos de questão** (múltipla escolha, V/F, resposta curta,
  código, associação) atende às minhas necessidades.
- **5.3** — Foi **claro como publicar** e disponibilizar a prova para os alunos.
- **5.4** — Confirmei que a avaliação **apareceu para o perfil de aluno** sem problemas.
- **5.5** — O processo de criação é **rápido** o suficiente para o meu dia a dia.

**Pergunta 5.6 — Faltou algum tipo de questão ou recurso na criação da prova?** *(opcional)*
- **Tipo:** Resposta longa (parágrafo)

---

## SEÇÃO 6 — Logs de fraude (núcleo da pesquisa)

**Escala linear (1 a 5)**, *(obrigatórias)*, 1 = Discordo totalmente / 5 = Concordo totalmente:

- **6.1** — Os **logs de fraude** são fáceis de entender.
- **6.2** — As informações registradas (tipo de evento, aluno, avaliação, horário) são
  **suficientes** para eu identificar comportamento suspeito.
- **6.3** — O agrupamento **por aluno e por avaliação** facilita a análise.
- **6.4** — Eu **confiaria** nesses logs para fundamentar uma decisão sobre a prova de um aluno.

**Pergunta 6.5 — Que informação você gostaria de ver nos logs e hoje NÃO aparece?** *(opcional)*
- **Tipo:** Resposta longa (parágrafo)

**Pergunta 6.6 — Na sua visão, o conjunto de detecções é suficiente para coibir cola?** *(obrigatória)*
- **Tipo:** Múltipla escolha
- **Opções:**
  - ( ) Sim, cobre bem
  - ( ) Cobre o essencial, mas falta algo
  - ( ) Insuficiente
- *(Se "falta algo" ou "insuficiente", responda a 6.7.)*

**Pergunta 6.7 — O que mais deveria ser detectado/bloqueado?** *(opcional)*
- **Tipo:** Resposta longa (parágrafo)

---

## SEÇÃO 7 — Gestão de contas e moderação

**Escala linear (1 a 5)**, *(obrigatórias)*:

- **7.1** — A tela de **gestão de usuários** é clara e fácil de navegar.
- **7.2** — As ações de admin (**ativar/desativar**, **redefinir senha**, **alterar perfil**)
  são suficientes para administrar uma turma.
- **7.3** — Os **logs de auditoria** das ações administrativas me passam segurança/controle.

**Pergunta 7.4 — A estratégia "cada aluno cria a própria conta + professor modera
(desativa contas falsas)" parece adequada para uma turma real?** *(obrigatória)*
- **Tipo:** Múltipla escolha
- **Opções:**
  - ( ) Sim, adequada
  - ( ) Adequada com ressalvas
  - ( ) Não, eu preferiria outro modelo

**Pergunta 7.5 — Se respondeu "ressalvas" ou "não", qual modelo você preferiria?** *(opcional)*
- **Tipo:** Resposta longa (parágrafo)
- **Texto de ajuda:** Ex.: professor cria as contas, código de turma, aprovação manual de
  cadastro, integração com sistema da instituição, etc.

---

## SEÇÃO 8 — Segurança percebida e comparação de ambientes

**Escala linear (1 a 5)**, *(obrigatórias)*:

- **8.1** — De modo geral, a plataforma **dificulta a fraude** de forma convincente.
- **8.2** — Eu **adotaria** esta plataforma para aplicar provas que valem nota.

**Pergunta 8.3 — (Se testou os dois) Qual ambiente você considera mais seguro para uma prova
de verdade?** *(opcional)*
- **Tipo:** Múltipla escolha
- **Opções:** ( ) Web (navegador) ( ) Desktop (Electron/kiosk) ( ) Pareceram equivalentes
  ( ) Testei só um

**Pergunta 8.4 — Exigir que o aluno BAIXE o aplicativo desktop é um obstáculo aceitável em
troca de mais segurança?** *(obrigatória)*
- **Tipo:** Múltipla escolha
- **Opções:**
  - ( ) Sim, vale a pena pela segurança
  - ( ) Depende do peso da prova
  - ( ) Não, o atrito afastaria os alunos
  - ( ) A versão web já é suficiente

---

## SEÇÃO 9 — Percepção geral e encerramento

**Pergunta 9.1 — De 0 a 10, qual a chance de você recomendar esta plataforma a outro
professor/instituição?** *(obrigatória)*
- **Tipo:** Escala linear (0 a 10) — *(métrica NPS)*

**Pergunta 9.2 — Maior ponto FORTE da plataforma:** *(opcional)*
- **Tipo:** Resposta longa (parágrafo)

**Pergunta 9.3 — Maior ponto FRACO ou o que mudaria primeiro:** *(opcional)*
- **Tipo:** Resposta longa (parágrafo)

**Pergunta 9.4 — Que recurso faria você ADOTAR esta plataforma de fato?** *(opcional)*
- **Tipo:** Resposta longa (parágrafo)

**Pergunta 9.5 — Comentários livres.** *(opcional)*
- **Tipo:** Resposta longa (parágrafo)

> **(Texto final)** Obrigado pela avaliação detalhada, professor(a)! 🛡️ Seu retorno orienta
> diretamente as melhorias do CyberAccessShield. Dúvidas/dados: [e-mail do pesquisador].
