
-- Este arquivo serve apenas como referência para as políticas RLS que precisam ser criadas no Supabase
-- Execute as seguintes consultas no painel SQL do Supabase

-- Habilitar RLS para a tabela user_answers (caso ainda não esteja habilitado)
ALTER TABLE public.user_answers ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir que usuários leiam suas próprias respostas
CREATE POLICY "Usuários podem ler suas próprias respostas"
ON public.user_answers
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.assessment_sessions
    WHERE assessment_sessions.id = user_answers.session_id
    AND assessment_sessions.user_id = auth.uid()
  )
);

-- Criar política para permitir que usuários insiram suas próprias respostas
CREATE POLICY "Usuários podem inserir suas próprias respostas"
ON public.user_answers
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.assessment_sessions
    WHERE assessment_sessions.id = user_answers.session_id
    AND assessment_sessions.user_id = auth.uid()
  )
);

-- Criar política para permitir que usuários atualizem suas próprias respostas
CREATE POLICY "Usuários podem atualizar suas próprias respostas"
ON public.user_answers
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.assessment_sessions
    WHERE assessment_sessions.id = user_answers.session_id
    AND assessment_sessions.user_id = auth.uid()
  )
);
