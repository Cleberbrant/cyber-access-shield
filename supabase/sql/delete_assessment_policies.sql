-- =============================================================================
-- POLÍTICAS E MODIFICAÇÕES PARA EXCLUSÃO DE AVALIAÇÕES
-- =============================================================================
-- Este arquivo contém as modificações necessárias para permitir que
-- administradores excluam avaliações e seus dados relacionados (incluindo logs)

-- =============================================================================
-- MODIFICAR CONSTRAINT DE security_logs PARA CASCADE DELETE
-- =============================================================================

-- Primeiro, remover a constraint existente
ALTER TABLE security_logs 
  DROP CONSTRAINT IF EXISTS security_logs_assessment_id_fkey;

-- Recriar com CASCADE DELETE
ALTER TABLE security_logs
  ADD CONSTRAINT security_logs_assessment_id_fkey
  FOREIGN KEY (assessment_id)
  REFERENCES assessments(id)
  ON DELETE CASCADE;  -- Quando avaliação for deletada, logs também serão

-- Comentário explicativo
COMMENT ON CONSTRAINT security_logs_assessment_id_fkey ON security_logs IS 
  'Foreign key com CASCADE DELETE - quando avaliação é deletada, logs associados também são removidos';

-- =============================================================================
-- POLÍTICAS RLS PARA EXCLUSÃO DE AVALIAÇÕES
-- =============================================================================

-- Habilitar RLS na tabela assessments (caso não esteja habilitado)
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Política: Administradores podem deletar avaliações
CREATE POLICY "Admins can delete assessments"
  ON assessments
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Verificar se já existe política de SELECT para admins
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'assessments' 
    AND policyname = 'Admins can view all assessments'
  ) THEN
    CREATE POLICY "Admins can view all assessments"
      ON assessments
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.is_admin = true
        )
      );
  END IF;
END $$;

-- Verificar se já existe política de INSERT para admins
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'assessments' 
    AND policyname = 'Admins can create assessments'
  ) THEN
    CREATE POLICY "Admins can create assessments"
      ON assessments
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.is_admin = true
        )
      );
  END IF;
END $$;

-- Verificar se já existe política de UPDATE para admins
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'assessments' 
    AND policyname = 'Admins can update assessments'
  ) THEN
    CREATE POLICY "Admins can update assessments"
      ON assessments
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.is_admin = true
        )
      );
  END IF;
END $$;

-- Política: Alunos podem visualizar avaliações disponíveis
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'assessments' 
    AND policyname = 'Students can view available assessments'
  ) THEN
    CREATE POLICY "Students can view available assessments"
      ON assessments
      FOR SELECT
      TO authenticated
      USING (true);  -- Todos podem ver avaliações
  END IF;
END $$;

-- =============================================================================
-- FUNÇÃO HELPER PARA DELETAR AVALIAÇÃO COM SEGURANÇA
-- =============================================================================

CREATE OR REPLACE FUNCTION delete_assessment_with_logs(
  p_assessment_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_deleted_count INTEGER := 0;
  v_logs_count INTEGER := 0;
  v_sessions_count INTEGER := 0;
  v_questions_count INTEGER := 0;
BEGIN
  -- Verificar se o usuário é admin
  SELECT is_admin INTO v_is_admin
  FROM profiles
  WHERE id = auth.uid();
  
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Apenas administradores podem deletar avaliações';
  END IF;
  
  -- Contar logs que serão deletados (antes de deletar)
  SELECT COUNT(*) INTO v_logs_count
  FROM security_logs
  WHERE assessment_id = p_assessment_id;
  
  -- Contar sessões que serão deletadas
  SELECT COUNT(*) INTO v_sessions_count
  FROM assessment_sessions
  WHERE assessment_id = p_assessment_id;
  
  -- Contar questões que serão deletadas
  SELECT COUNT(*) INTO v_questions_count
  FROM questions
  WHERE assessment_id = p_assessment_id;
  
  -- Deletar a avaliação (CASCADE vai cuidar dos relacionamentos)
  DELETE FROM assessments
  WHERE id = p_assessment_id;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  -- Retornar resumo da operação
  RETURN jsonb_build_object(
    'success', true,
    'deleted', v_deleted_count > 0,
    'assessment_id', p_assessment_id,
    'logs_deleted', v_logs_count,
    'sessions_deleted', v_sessions_count,
    'questions_deleted', v_questions_count
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

COMMENT ON FUNCTION delete_assessment_with_logs IS 
  'Deleta avaliação e todos os dados relacionados (logs, sessões, questões) com verificação de permissão de admin';

-- =============================================================================
-- VERIFICAR CONSTRAINTS EXISTENTES EM OUTRAS TABELAS
-- =============================================================================

-- Garantir que assessment_sessions também tem CASCADE
ALTER TABLE assessment_sessions 
  DROP CONSTRAINT IF EXISTS assessment_sessions_assessment_id_fkey;

ALTER TABLE assessment_sessions
  ADD CONSTRAINT assessment_sessions_assessment_id_fkey
  FOREIGN KEY (assessment_id)
  REFERENCES assessments(id)
  ON DELETE CASCADE;

-- Garantir que questions também tem CASCADE
ALTER TABLE questions 
  DROP CONSTRAINT IF EXISTS questions_assessment_id_fkey;

ALTER TABLE questions
  ADD CONSTRAINT questions_assessment_id_fkey
  FOREIGN KEY (assessment_id)
  REFERENCES assessments(id)
  ON DELETE CASCADE;

-- =============================================================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================================================

-- Índice já existe, mas garantir
CREATE INDEX IF NOT EXISTS idx_security_logs_assessment_id 
  ON security_logs(assessment_id);

CREATE INDEX IF NOT EXISTS idx_assessment_sessions_assessment_id 
  ON assessment_sessions(assessment_id);

CREATE INDEX IF NOT EXISTS idx_questions_assessment_id 
  ON questions(assessment_id);

-- =============================================================================
-- DOCUMENTAÇÃO
-- =============================================================================

COMMENT ON TABLE assessments IS 
  'Avaliações criadas por administradores. Ao deletar, todos os dados relacionados são removidos em cascata (logs, sessões, questões, respostas)';
