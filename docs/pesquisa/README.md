# Pesquisa de Avaliação do CyberAccessShield (TCC)

Este diretório reúne o **protocolo de pesquisa** usado para coletar dados com usuários
reais sobre a plataforma **CyberAccessShield** — sistema de avaliações online com
ambiente anti-fraude (web e desktop/Electron).

A pesquisa é dividida em **dois formulários independentes**, porque os dois perfis da
plataforma fazem coisas diferentes:

| Perfil | Quem participa | O que testa | Documento |
|---|---|---|---|
| **Aluno** | Distribuição em massa (qualquer estudante voluntário) | Fazer avaliação no ambiente seguro; tentar "burlar" o anti-fraude | [form_aluno.md](form_aluno.md) |
| **Professor (Admin)** | Distribuição restrita (apenas docentes confiáveis) | Criar avaliação, publicar para a turma, ver logs de fraude, gerenciar contas | [form_professor.md](form_professor.md) |

> **Por que dois formulários separados?** O perfil de professor é também **administrador**
> (cria/edita/exclui avaliações, ativa/desativa contas, redefine senhas, vê todos os logs).
> Esse poder não pode cair em mãos de participantes anônimos, então o formulário de
> professor é entregue só a docentes de confiança. O de aluno pode ser aberto a todos.

---

## 1. Ambientes de teste (o participante escolhe)

A plataforma roda em **duas vias** e o participante é livre para escolher uma ou as duas.
Ambas são válidas para a pesquisa — o formulário pergunta qual foi usada para podermos
comparar os dados depois.

### Via A — Web (deploy, sem instalar nada)
- **URL:** https://cyber-access-shield.vercel.app/
- Roda direto no navegador. Recomendado **Google Chrome ou Microsoft Edge** atualizados.
- Proteções anti-fraude aplicadas via navegador (bloqueio de DevTools, menu de contexto,
  copiar/colar, troca de aba, perda de foco da janela, saída de tela cheia).
- **Vantagem:** zero atrito, qualquer pessoa testa em segundos.
- **Limitação:** o navegador não consegue impedir tudo (ex.: trocar de janela com Alt+Tab
  só é *detectado* e contado como violação, não *bloqueado*).

### Via B — Desktop / Electron (instalar o aplicativo)
- Aplicativo Windows portátil (`.exe`). Durante a prova entra em **modo kiosk total**:
  tela cheia travada, atalhos de sistema bloqueados, troca de janela impedida.
- **Vantagem:** ambiente muito mais fechado — o dado mais forte do TCC sobre segurança real.
- **Limitação:** exige baixar/executar o aplicativo (pode gerar aviso do SmartScreen no Windows).

> **Onde conseguir o `.exe`:** o pesquisador disponibiliza o instalador/portátil
> (ex.: link de release no GitHub ou arquivo enviado direto). _Defina o link antes de
> divulgar a pesquisa e cole-o no formulário do aluno._

---

## 2. Estratégia de contas

### Alunos — **cada participante cria a própria conta**
1. Acessa a plataforma (web ou desktop) e vai em **Registrar**.
2. Cria conta com e-mail e senha. Toda conta nova entra **como aluno** (nunca admin).
3. Se a plataforma pedir **confirmação de e-mail**, o participante confirma pelo link
   recebido antes de logar.

**Por que essa estratégia:** os logs anti-fraude são gravados **por usuário**, então cada
participante gera dados isolados e limpos. Um participante mal-intencionado ("troll") só
suja os **próprios** logs — ele **não** consegue alterar a avaliação nem atrapalhar o teste
de outro aluno (isso é poder exclusivo do admin). O pesquisador **modera**: desativa pela
tela de gestão de usuários qualquer conta obviamente falsa/abusiva antes de analisar os dados.

> Contas de teste prontas (caso queira demonstrar sem registrar):
> - **Aluno:** `aluno.teste@cyberaccessshield.com` / `AlunoTeste@2026`

### Professores — **conta entregue/aprovada pelo pesquisador**
O cadastro com poderes de professor (admin) **não** é aberto. O pesquisador fornece
diretamente ao docente de confiança:
- a conta de demonstração **`professor.teste@cyberaccessshield.com`** / `ProfesorTeste@2026`, **ou**
- uma conta dedicada que o pesquisador cria/promove a admin pelo painel de gestão.

---

## 3. Como conduzir a pesquisa (fluxo recomendado)

1. **Pesquisador** publica pelo menos **uma avaliação de demonstração** com a conta de
   professor, para que ela já apareça na lista dos alunos. (Roteiro em [form_professor.md](form_professor.md).)
2. **Pesquisador** define e cola no formulário do aluno: o **link do `.exe`** (se oferecer a
   via desktop) e confirma a **URL web**.
3. Divulga o **formulário do aluno** em massa; entrega o **formulário do professor** só a
   docentes selecionados.
4. Participante **testa** seguindo o roteiro do seu formulário e **responde** as perguntas.
5. **Pesquisador** modera contas (desativa trolls), exporta as respostas do Google Forms
   (planilha) e cruza com os **logs de fraude** da plataforma.

---

## 4. Proteção de dados (LGPD) — resumo

Os formulários trazem o **Termo de Consentimento Livre e Esclarecido (TCLE)** completo.
Princípios aplicados:

- **Finalidade:** dados usados exclusivamente para o Trabalho de Conclusão de Curso.
- **Minimização:** coletamos só o necessário; **não** é obrigatório informar nome/identidade.
- **Anonimização:** os resultados são apresentados de forma agregada; respostas não são
  vinculadas à identidade civil do participante no texto do TCC.
- **Base legal:** consentimento (art. 7º, I da Lei 13.709/2018 — LGPD).
- **Direitos do titular:** acesso, correção e exclusão dos dados mediante contato com o
  pesquisador (e-mail informado no termo).
- **Voluntariedade:** participação livre; o participante pode desistir a qualquer momento
  sem prejuízo.
- **Segurança:** respostas armazenadas no Google Forms/Sheets sob conta do pesquisador;
  contas de teste da plataforma protegidas por senha e moderadas.

> ⚠️ **Antes de publicar:** o pesquisador deve preencher nos formulários os campos entre
> colchetes `[...]` — nome do pesquisador, orientador, instituição, e-mail de contato e
> link do instalador desktop.

---

## 5. Arquivos deste diretório

- **[README.md](README.md)** — este guia (visão geral, contas, ambientes, LGPD).
- **[form_aluno.md](form_aluno.md)** — roteiro de teste do aluno + estrutura pronta para montar no **Google Forms**.
- **[form_professor.md](form_professor.md)** — roteiro de teste do professor + estrutura pronta para montar no **Google Forms**.
