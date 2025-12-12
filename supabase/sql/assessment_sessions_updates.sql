-- =============================================================================
-- ATUALIZAÇÃO DA TABELA assessment_sessions
-- =============================================================================
-- Adiciona campos para controlar cancelamentos e avisos de segurança

-- Adicionar campo is_cancelled (indica se prova foi cancelada por violação)
ALTER TABLE assessment_sessions
ADD COLUMN IF NOT EXISTS is_cancelled BOOLEAN DEFAULT false;

-- Adicionar campo cancellation_reason (motivo do cancelamento)
ALTER TABLE assessment_sessions
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Adicionar campo warning_count (contador de avisos de saída da aba)
ALTER TABLE assessment_sessions
ADD COLUMN IF NOT EXISTS warning_count INTEGER DEFAULT 0;

-- Criar índice para consultas de provas canceladas
CREATE INDEX IF NOT EXISTS idx_assessment_sessions_cancelled 
  ON assessment_sessions(is_cancelled) 
  WHERE is_cancelled = true;

-- =============================================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =============================================================================

COMMENT ON COLUMN assessment_sessions.is_cancelled IS 
  'Indica se a avaliação foi cancelada por violação de segurança';

COMMENT ON COLUMN assessment_sessions.cancellation_reason IS 
  'Motivo do cancelamento (ex: "3 violações de saída da aba")';

COMMENT ON COLUMN assessment_sessions.warning_count IS 
  'Número de avisos de saída da aba/janela durante a avaliação';

-- =============================================================================
-- FUNÇÃO PARA INCREMENTAR CONTADOR DE AVISOS
-- =============================================================================

CREATE OR REPLACE FUNCTION increment_warning_count(p_session_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_count INTEGER;
BEGIN
  UPDATE assessment_sessions
  SET warning_count = warning_count + 1
  WHERE id = p_session_id
  RETURNING warning_count INTO v_new_count;
  
  RETURN v_new_count;
END;
$$;

COMMENT ON FUNCTION increment_warning_count IS 
  'Incrementa o contador de avisos de uma sessão e retorna o novo valor';

-- =============================================================================
-- ATUALIZAR VIEW security_report PARA INCLUIR DADOS DE CANCELAMENTO
-- =============================================================================

-- Primeiro, remover a view existente para evitar conflitos de colunas
DROP VIEW IF EXISTS security_report;

-- Recriar a view com os novos campos
CREATE VIEW security_report AS
SELECT 
  sl.id,
  sl.created_at,
  sl.event_type,
  sl.event_details,
  
  -- Informações do usuário
  sl.user_id,
  au.email as user_email,
  p.full_name as user_name,
  
  -- Informações da avaliação
  a.id as assessment_id,
  a.title as assessment_title,
  
  -- Informações da sessão (com novos campos)
  asr.id as session_id,
  asr.started_at as session_started_at,
  asr.is_cancelled,
  asr.cancellation_reason,
  asr.warning_count,
  asr.score,
  
  -- Metadados
  sl.user_agent,
  sl.ip_address
FROM security_logs sl
LEFT JOIN auth.users au ON sl.user_id = au.id
LEFT JOIN profiles p ON sl.user_id = p.id
LEFT JOIN assessments a ON sl.assessment_id = a.id
LEFT JOIN assessment_sessions asr ON sl.session_id = asr.id
ORDER BY sl.created_at DESC;

-- =============================================================================
-- ATUALIZAR TIPOS DE EVENTOS NO COMENTÁRIO
-- =============================================================================

COMMENT ON COLUMN security_logs.event_type IS 
  'Tipo de evento: devtools_opened, copy_attempt, context_menu_attempt, paste_attempt, cut_attempt, print_attempt, keyboard_shortcut, tab_switch, window_blur, window_focus, fullscreen_exit, assessment_cancelled';
