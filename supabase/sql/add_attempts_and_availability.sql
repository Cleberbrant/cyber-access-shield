-- =============================================================================
-- MIGRATION: SISTEMA DE TENTATIVAS E DISPONIBILIZAÇÃO DE AVALIAÇÕES
-- =============================================================================
-- Este arquivo adiciona funcionalidades de:
-- 1. Controle de tentativas máximas por avaliação
-- 2. Agendamento de disponibilização de avaliações
-- 3. Persistência de progresso de sessão (continuação de prova)

-- =============================================================================
-- PARTE 1: MODIFICAÇÕES NA TABELA ASSESSMENTS
-- =============================================================================

-- Adicionar coluna de tentativas máximas
ALTER TABLE assessments 
  ADD COLUMN IF NOT EXISTS max_attempts INTEGER NOT NULL DEFAULT 1;

-- Adicionar coluna de data/hora de disponibilização
ALTER TABLE assessments 
  ADD COLUMN IF NOT EXISTS available_from TIMESTAMPTZ;

-- Adicionar constraint para garantir tentativas válidas
-- 0 = ilimitado, >= 1 = número específico de tentativas
ALTER TABLE assessments 
  ADD CONSTRAINT check_max_attempts CHECK (max_attempts >= 0);

-- Comentários explicativos
COMMENT ON COLUMN assessments.max_attempts IS 
  'Número máximo de tentativas permitidas. 0 = ilimitado, >= 1 = número específico';

COMMENT ON COLUMN assessments.available_from IS 
  'Data e hora a partir da qual a avaliação ficará disponível para os alunos. NULL = disponível imediatamente';

-- =============================================================================
-- PARTE 2: MODIFICAÇÕES NA TABELA ASSESSMENT_SESSIONS
-- =============================================================================

-- Adicionar coluna para índice da questão atual
ALTER TABLE assessment_sessions 
  ADD COLUMN IF NOT EXISTS current_question_index INTEGER DEFAULT 0;

-- Adicionar coluna para tempo decorrido em segundos
ALTER TABLE assessment_sessions 
  ADD COLUMN IF NOT EXISTS time_elapsed_seconds INTEGER DEFAULT 0;

-- Adicionar coluna para última atividade (para detectar abandono)
ALTER TABLE assessment_sessions 
  ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();

-- Comentários explicativos
COMMENT ON COLUMN assessment_sessions.current_question_index IS 
  'Índice da questão atual (0-based) para permitir continuação de onde parou';

COMMENT ON COLUMN assessment_sessions.time_elapsed_seconds IS 
  'Tempo decorrido em segundos desde o início da avaliação. Permite continuação com timer correto';

COMMENT ON COLUMN assessment_sessions.last_activity_at IS 
  'Timestamp da última atividade do usuário na sessão. Útil para detectar sessões abandonadas';

-- =============================================================================
-- PARTE 3: ÍNDICES PARA OTIMIZAÇÃO DE CONSULTAS
-- =============================================================================

-- Índice composto para buscar sessões de um usuário em uma avaliação
CREATE INDEX IF NOT EXISTS idx_sessions_user_assessment_completed 
  ON assessment_sessions(user_id, assessment_id, is_completed);

-- Índice para buscar avaliações disponíveis
CREATE INDEX IF NOT EXISTS idx_assessments_available_from 
  ON assessments(available_from) 
  WHERE available_from IS NOT NULL;

-- Índice para buscar sessões ativas recentes
CREATE INDEX IF NOT EXISTS idx_sessions_last_activity 
  ON assessment_sessions(last_activity_at) 
  WHERE is_completed = false;

-- =============================================================================
-- PARTE 4: FUNÇÃO PARA ATUALIZAR LAST_ACTIVITY_AT AUTOMATICAMENTE
-- =============================================================================

-- Criar ou substituir função trigger
CREATE OR REPLACE FUNCTION update_session_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar timestamp sempre que a sessão for modificada
  NEW.last_activity_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar automaticamente
DROP TRIGGER IF EXISTS trigger_update_session_activity ON assessment_sessions;

CREATE TRIGGER trigger_update_session_activity
  BEFORE UPDATE ON assessment_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_session_last_activity();

-- =============================================================================
-- PARTE 5: ATUALIZAR POLÍTICAS RLS PARA AVAILABLE_FROM
-- =============================================================================

-- Remover política antiga de visualização para estudantes
DROP POLICY IF EXISTS "Students can view available assessments" ON assessments;

-- Criar nova política que considera a data de disponibilização
CREATE POLICY "Students can view available assessments"
  ON assessments
  FOR SELECT
  TO authenticated
  USING (
    -- Não é admin E avaliação está disponível
    NOT EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
    AND (
      available_from IS NULL OR
      available_from <= NOW()
    )
  );

-- Admins podem ver todas as avaliações independente de available_from
-- (política já existe, apenas garantindo que está correta)

-- =============================================================================
-- PARTE 6: FUNÇÃO AUXILIAR PARA CONTAR TENTATIVAS
-- =============================================================================

-- Criar função para contar tentativas completadas de um usuário
CREATE OR REPLACE FUNCTION count_user_attempts(
  p_user_id UUID,
  p_assessment_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO attempt_count
  FROM assessment_sessions
  WHERE user_id = p_user_id
    AND assessment_id = p_assessment_id
    AND is_completed = true;
  
  RETURN COALESCE(attempt_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário da função
COMMENT ON FUNCTION count_user_attempts IS 
  'Retorna o número de tentativas completadas de um usuário em uma avaliação específica';

-- =============================================================================
-- PARTE 7: FUNÇÃO PARA VERIFICAR SE PODE TENTAR
-- =============================================================================

-- Criar função para verificar se usuário pode fazer avaliação
CREATE OR REPLACE FUNCTION can_user_attempt_assessment(
  p_user_id UUID,
  p_assessment_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_max_attempts INTEGER;
  v_current_attempts INTEGER;
BEGIN
  -- Buscar número máximo de tentativas
  SELECT max_attempts
  INTO v_max_attempts
  FROM assessments
  WHERE id = p_assessment_id;
  
  -- Se max_attempts = 0, tentativas ilimitadas
  IF v_max_attempts = 0 THEN
    RETURN true;
  END IF;
  
  -- Contar tentativas já realizadas
  v_current_attempts := count_user_attempts(p_user_id, p_assessment_id);
  
  -- Retornar se ainda pode tentar
  RETURN v_current_attempts < v_max_attempts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário da função
COMMENT ON FUNCTION can_user_attempt_assessment IS 
  'Verifica se um usuário ainda pode fazer uma avaliação baseado no limite de tentativas';

-- =============================================================================
-- PARTE 8: ATUALIZAR AVALIAÇÕES EXISTENTES
-- =============================================================================

-- Definir max_attempts = 1 para todas as avaliações existentes
-- (para garantir retrocompatibilidade)
UPDATE assessments 
SET max_attempts = 1 
WHERE max_attempts IS NULL;

-- =============================================================================
-- FIM DA MIGRATION
-- =============================================================================

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ Migration concluída com sucesso!';
  RAISE NOTICE '   - Campo max_attempts adicionado (padrão: 1)';
  RAISE NOTICE '   - Campo available_from adicionado';
  RAISE NOTICE '   - Campos de progresso de sessão adicionados';
  RAISE NOTICE '   - Índices criados para otimização';
  RAISE NOTICE '   - Funções auxiliares criadas';
  RAISE NOTICE '   - Políticas RLS atualizadas';
END $$;
