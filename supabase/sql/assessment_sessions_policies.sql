-- =============================================================================
-- POLÍTICAS RLS PARA ASSESSMENT_SESSIONS
-- =============================================================================
-- Este arquivo garante que as políticas corretas estejam configuradas

-- Habilitar RLS na tabela assessment_sessions (se ainda não estiver)
ALTER TABLE public.assessment_sessions ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.assessment_sessions;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON public.assessment_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.assessment_sessions;

-- Política para VISUALIZAR suas próprias sessões (incluindo completas)
CREATE POLICY "Users can view their own sessions"
ON public.assessment_sessions
FOR SELECT
USING (
  auth.uid() = user_id
);

-- Política para INSERIR suas próprias sessões
CREATE POLICY "Users can insert their own sessions"
ON public.assessment_sessions
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
);

-- Política para ATUALIZAR suas próprias sessões
CREATE POLICY "Users can update their own sessions"
ON public.assessment_sessions
FOR UPDATE
USING (
  auth.uid() = user_id
)
WITH CHECK (
  auth.uid() = user_id
);

-- Comentários
COMMENT ON POLICY "Users can view their own sessions" ON public.assessment_sessions IS 
  'Permite que usuários visualizem todas as suas próprias sessões, incluindo completas e incompletas';

COMMENT ON POLICY "Users can insert their own sessions" ON public.assessment_sessions IS 
  'Permite que usuários criem novas sessões de avaliação';

COMMENT ON POLICY "Users can update their own sessions" ON public.assessment_sessions IS 
  'Permite que usuários atualizem suas próprias sessões (marcar como completas, atualizar progresso, etc)';

-- Verificação
DO $$
BEGIN
  RAISE NOTICE '✅ Políticas de assessment_sessions configuradas com sucesso!';
END $$;
