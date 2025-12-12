-- Políticas RLS para a tabela questions
-- Execute este script no painel SQL do Supabase

-- Habilitar RLS para a tabela questions (se ainda não estiver habilitado)
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Política para permitir que todos os usuários autenticados possam ler questões
-- (necessário para que estudantes possam visualizar questões durante avaliações e resultados)
CREATE POLICY "Usuários autenticados podem ler questões"
ON public.questions
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Política para permitir que apenas administradores possam criar questões
CREATE POLICY "Apenas administradores podem criar questões"
ON public.questions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Política para permitir que apenas administradores possam atualizar questões
CREATE POLICY "Apenas administradores podem atualizar questões"
ON public.questions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Política para permitir que apenas administradores possam deletar questões
CREATE POLICY "Apenas administradores podem deletar questões"
ON public.questions
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);
