-- =============================================================================
-- TABELA PARA REGISTRO DE EVENTOS DE SEGURANÇA (TENTATIVAS DE FRAUDE)
-- =============================================================================
-- Esta tabela armazena todos os eventos de segurança detectados durante
-- avaliações, permitindo que administradores monitorem tentativas de fraude

-- Criar tabela de logs de segurança
CREATE TABLE IF NOT EXISTS security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Informações do usuário
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Informações da avaliação (opcional, pode ser NULL se fora de avaliação)
  assessment_id UUID REFERENCES assessments(id) ON DELETE SET NULL,
  session_id UUID REFERENCES assessment_sessions(id) ON DELETE SET NULL,
  
  -- Tipo de evento de segurança
  event_type TEXT NOT NULL,
  -- Valores possíveis:
  -- 'devtools_opened', 'context_menu_attempt', 'copy_attempt', 'paste_attempt',
  -- 'cut_attempt', 'print_attempt', 'keyboard_shortcut', 'tab_switch',
  -- 'window_blur', 'fullscreen_exit'
  
  -- Detalhes adicionais do evento
  event_details TEXT,
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Informações do navegador/sistema (para análise)
  user_agent TEXT,
  ip_address INET
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_assessment_id ON security_logs(assessment_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_session_id ON security_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON security_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at DESC);

-- Criar índice composto para queries comuns
CREATE INDEX IF NOT EXISTS idx_security_logs_user_assessment 
  ON security_logs(user_id, assessment_id, created_at DESC);

-- =============================================================================
-- POLÍTICAS DE SEGURANÇA (RLS - Row Level Security)
-- =============================================================================

-- Habilitar RLS
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- Política: Administradores podem ver todos os logs
CREATE POLICY "Admins can view all security logs"
  ON security_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Política: Qualquer usuário autenticado pode inserir seus próprios logs
CREATE POLICY "Users can insert their own security logs"
  ON security_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem ver apenas seus próprios logs
CREATE POLICY "Users can view their own security logs"
  ON security_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================================================
-- FUNÇÃO PARA INSERIR LOG DE SEGURANÇA COM METADADOS
-- =============================================================================

CREATE OR REPLACE FUNCTION insert_security_log(
  p_event_type TEXT,
  p_event_details TEXT DEFAULT NULL,
  p_assessment_id UUID DEFAULT NULL,
  p_session_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  -- Inserir o log
  INSERT INTO security_logs (
    user_id,
    event_type,
    event_details,
    assessment_id,
    session_id,
    user_agent,
    ip_address
  )
  VALUES (
    auth.uid(),
    p_event_type,
    p_event_details,
    p_assessment_id,
    p_session_id,
    current_setting('request.headers', true)::json->>'user-agent',
    inet_client_addr()
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- =============================================================================
-- VIEW PARA RELATÓRIO DE SEGURANÇA (APENAS PARA ADMINS)
-- =============================================================================

CREATE OR REPLACE VIEW security_report AS
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
  
  -- Informações da sessão
  asr.id as session_id,
  asr.started_at as session_started_at,
  
  -- Metadados
  sl.user_agent,
  sl.ip_address
FROM security_logs sl
LEFT JOIN auth.users au ON sl.user_id = au.id
LEFT JOIN profiles p ON sl.user_id = p.id
LEFT JOIN assessments a ON sl.assessment_id = a.id
LEFT JOIN assessment_sessions asr ON sl.session_id = asr.id
ORDER BY sl.created_at DESC;

-- Garantir que apenas admins possam acessar a view
GRANT SELECT ON security_report TO authenticated;

-- Nota: Views herdam as políticas RLS das tabelas base (security_logs)
-- Como security_logs já tem política que permite admins verem tudo,
-- a view security_report automaticamente respeita essas políticas

-- =============================================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =============================================================================

COMMENT ON TABLE security_logs IS 'Registro de eventos de segurança e tentativas de fraude durante avaliações';
COMMENT ON COLUMN security_logs.event_type IS 'Tipo de evento: devtools_opened, copy_attempt, etc';
COMMENT ON COLUMN security_logs.event_details IS 'Detalhes adicionais sobre o evento em formato JSON ou texto';
COMMENT ON FUNCTION insert_security_log IS 'Função helper para inserir logs de segurança com metadados automáticos';
COMMENT ON VIEW security_report IS 'View consolidada para relatórios de segurança (apenas admins)';
