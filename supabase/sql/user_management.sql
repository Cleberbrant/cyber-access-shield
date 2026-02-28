-- =============================================================================
-- GERENCIAMENTO DE USUÁRIOS - ESTRUTURA COMPLETA
-- =============================================================================
-- Este arquivo contém toda a estrutura necessária para o gerenciamento de
-- usuários por administradores, incluindo:
-- - Campos adicionais na tabela profiles
-- - Tabela de logs de auditoria
-- - Políticas RLS (Row Level Security)
-- - Funções para manipulação segura de dados
-- - Views otimizadas para consultas

-- =============================================================================
-- 1. ADICIONAR CAMPOS NA TABELA PROFILES
-- =============================================================================

-- Campo para controle de ativação de conta
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Campo para nome de exibição (gerado automaticamente do email)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Campos para senha temporária (quando admin reseta)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS temp_password TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS temp_password_created_at TIMESTAMPTZ;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON profiles(display_name);

-- =============================================================================
-- 2. TABELA DE LOGS DE AUDITORIA
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_management_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Quem fez a ação
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_email TEXT NOT NULL,
  
  -- Em quem foi feita a ação
  target_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_email TEXT NOT NULL,
  
  -- Tipo de ação realizada
  action TEXT NOT NULL CHECK (
    action IN (
      'edit_role',              -- Mudou tipo de conta (admin/aluno)
      'edit_display_name',      -- Mudou nome de exibição
      'reset_password',         -- Admin resetou senha de outro usuário
      'self_password_change',   -- Admin mudou própria senha
      'self_display_name_change', -- Admin mudou próprio nome
      'deactivate',             -- Desativou conta
      'activate'                -- Reativou conta
    )
  ),
  
  -- Valores antes e depois da alteração (JSON para flexibilidade)
  old_value JSONB,
  new_value JSONB,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_user_mgmt_logs_admin ON user_management_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_user_mgmt_logs_target ON user_management_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_user_mgmt_logs_action ON user_management_logs(action);
CREATE INDEX IF NOT EXISTS idx_user_mgmt_logs_created ON user_management_logs(created_at DESC);

-- Habilitar Row Level Security
ALTER TABLE user_management_logs ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 3. FUNÇÃO AUXILIAR PARA VERIFICAR SE É ADMIN (SEM RECURSÃO)
-- =============================================================================

-- Esta função usa SECURITY DEFINER para contornar as políticas RLS
-- e evitar recursão infinita
CREATE OR REPLACE FUNCTION is_user_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin_result BOOLEAN;
BEGIN
  SELECT is_admin INTO is_admin_result
  FROM profiles
  WHERE id = user_id;
  
  RETURN COALESCE(is_admin_result, false);
END;
$$;

-- Grant para authenticated
GRANT EXECUTE ON FUNCTION is_user_admin(UUID) TO authenticated;

-- =============================================================================
-- 4. POLÍTICAS RLS PARA PROFILES (SEM RECURSÃO)
-- =============================================================================

-- Remover políticas antigas que podem existir
DROP POLICY IF EXISTS "Admins can view all profiles for management" ON profiles;
DROP POLICY IF EXISTS "Admins can update other users profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own display_name" ON profiles;

-- Política 1: Usuários podem ver seu próprio perfil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Política 2: Admins podem ver todos os perfis (usando função auxiliar)
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()  -- Sempre pode ver o próprio
    OR is_user_admin(auth.uid())  -- Ou é admin (via função auxiliar)
  );

-- Política 3: Usuários podem atualizar seu próprio perfil
-- (mas não podem mudar is_admin ou is_active)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    -- Garantir que não estão mudando campos sensíveis
    AND is_admin IS NOT DISTINCT FROM (SELECT is_admin FROM profiles WHERE id = auth.uid())
    AND is_active IS NOT DISTINCT FROM (SELECT is_active FROM profiles WHERE id = auth.uid())
  );

-- Política 4: Admins podem atualizar qualquer perfil
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (is_user_admin(auth.uid()))
  WITH CHECK (is_user_admin(auth.uid()));

-- =============================================================================
-- 4. POLÍTICAS RLS PARA USER_MANAGEMENT_LOGS
-- =============================================================================

-- Política: Administradores podem inserir logs de auditoria
DROP POLICY IF EXISTS "Admins can insert audit logs" ON user_management_logs;
CREATE POLICY "Admins can insert audit logs"
  ON user_management_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = admin_id
    AND is_user_admin(auth.uid())
  );

-- Política: Administradores podem visualizar todos os logs
DROP POLICY IF EXISTS "Admins can view all audit logs" ON user_management_logs;
CREATE POLICY "Admins can view all audit logs"
  ON user_management_logs FOR SELECT
  TO authenticated
  USING (is_user_admin(auth.uid()));

-- =============================================================================
-- 5. FUNÇÃO PARA RESETAR SENHA (GERA SENHA TEMPORÁRIA)
-- =============================================================================

CREATE OR REPLACE FUNCTION reset_user_password(
  p_target_user_id UUID,
  p_temp_password TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id UUID;
BEGIN
  v_admin_id := auth.uid();
  
  -- Verificar se quem está chamando é admin (usando função auxiliar)
  IF NOT is_user_admin(v_admin_id) THEN
    RAISE EXCEPTION 'Apenas administradores podem resetar senhas';
  END IF;
  
  -- Não pode resetar própria senha por esta função
  IF v_admin_id = p_target_user_id THEN
    RAISE EXCEPTION 'Use a função de auto-edição para mudar sua própria senha';
  END IF;
  
  -- Verificar se usuário alvo existe
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_target_user_id) THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;
  
  -- Atualizar senha no auth.users
  UPDATE auth.users
  SET encrypted_password = crypt(p_temp_password, gen_salt('bf')),
      updated_at = now()
  WHERE id = p_target_user_id;
  
  -- Salvar senha temporária no profile
  UPDATE profiles
  SET temp_password = p_temp_password,
      temp_password_created_at = now()
  WHERE id = p_target_user_id;
  
  RETURN true;
END;
$$;

-- =============================================================================
-- 6. FUNÇÃO PARA LIMPAR SENHA TEMPORÁRIA (CHAMADA MANUALMENTE)
-- =============================================================================

CREATE OR REPLACE FUNCTION clear_temp_password(
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Limpar senha temporária do perfil
  UPDATE profiles
  SET temp_password = NULL,
      temp_password_created_at = NULL
  WHERE id = p_user_id
  AND temp_password IS NOT NULL;
  
  RETURN true;
END;
$$;

-- =============================================================================
-- 7. FUNÇÃO PARA ALTERAR PRÓPRIA SENHA (COM VERIFICAÇÃO)
-- =============================================================================

CREATE OR REPLACE FUNCTION change_own_password(
  p_current_password TEXT,
  p_new_password TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_encrypted_password TEXT;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;
  
  -- Buscar senha atual criptografada
  SELECT encrypted_password INTO v_encrypted_password
  FROM auth.users
  WHERE id = v_user_id;
  
  -- Verificar se a senha atual está correta
  IF v_encrypted_password != crypt(p_current_password, v_encrypted_password) THEN
    RAISE EXCEPTION 'Senha atual incorreta';
  END IF;
  
  -- Atualizar para nova senha
  UPDATE auth.users
  SET encrypted_password = crypt(p_new_password, gen_salt('bf')),
      updated_at = now()
  WHERE id = v_user_id;
  
  -- Limpar senha temporária se existir
  UPDATE profiles
  SET temp_password = NULL,
      temp_password_created_at = NULL
  WHERE id = v_user_id
  AND temp_password IS NOT NULL;
  
  RETURN true;
END;
$$;

-- =============================================================================
-- 8. VIEW PARA LISTA DE USUÁRIOS (OTIMIZADA)
-- =============================================================================

CREATE OR REPLACE VIEW user_management_view AS
SELECT 
  p.id,
  au.email,
  p.display_name,
  p.is_admin,
  p.is_active,
  p.temp_password,
  p.temp_password_created_at,
  au.created_at,
  au.last_sign_in_at,
  au.confirmed_at
FROM profiles p
JOIN auth.users au ON p.id = au.id
ORDER BY au.created_at DESC;

-- Grant acesso para usuários autenticados
GRANT SELECT ON user_management_view TO authenticated;

-- =============================================================================
-- 9. FUNÇÃO PARA BUSCAR ESTATÍSTICAS DE USUÁRIOS
-- =============================================================================

CREATE OR REPLACE FUNCTION get_user_stats()
RETURNS TABLE (
  total BIGINT,
  admins BIGINT,
  students BIGINT,
  inactive BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total,
    COUNT(*) FILTER (WHERE is_admin = true AND is_active = true)::BIGINT as admins,
    COUNT(*) FILTER (WHERE is_admin = false AND is_active = true)::BIGINT as students,
    COUNT(*) FILTER (WHERE is_active = false)::BIGINT as inactive
  FROM profiles;
END;
$$;

-- =============================================================================
-- 10. GRANT PERMISSIONS
-- =============================================================================

-- Permitir execução das funções para usuários autenticados
GRANT EXECUTE ON FUNCTION is_user_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION reset_user_password(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION clear_temp_password(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION change_own_password(TEXT, TEXT) TO authenticated;

-- =============================================================================
-- 11. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =============================================================================

COMMENT ON FUNCTION is_user_admin IS 'Verifica se um usuário é admin sem causar recursão RLS';
COMMENT ON TABLE user_management_logs IS 'Registra todas as ações de gerenciamento de usuários realizadas por administradores';
COMMENT ON COLUMN profiles.is_active IS 'Indica se a conta está ativa (true) ou desativada (false)';
COMMENT ON COLUMN profiles.display_name IS 'Nome de exibição do usuário (gerado do email antes do @)';
COMMENT ON COLUMN profiles.temp_password IS 'Senha temporária gerada pelo admin (visível até usuário trocar)';
COMMENT ON COLUMN profiles.temp_password_created_at IS 'Data/hora em que a senha temporária foi criada';

COMMENT ON FUNCTION reset_user_password IS 'Reseta senha de um usuário e salva senha temporária';
COMMENT ON FUNCTION clear_temp_password IS 'Limpa senha temporária após usuário trocar';
COMMENT ON FUNCTION change_own_password IS 'Permite usuário mudar própria senha com verificação da senha atual';
COMMENT ON FUNCTION get_user_stats IS 'Retorna estatísticas de usuários (total, admins, alunos, inativos)';

-- =============================================================================
-- 12. POPULAR DADOS INICIAIS (SE NECESSÁRIO)
-- =============================================================================

-- Garantir que todos os perfis tenham is_active = true por padrão
UPDATE profiles
SET is_active = true
WHERE is_active IS NULL;

-- Gerar display_name para perfis que não têm
UPDATE profiles 
SET display_name = SPLIT_PART(
  (SELECT email FROM auth.users WHERE auth.users.id = profiles.id), 
  '@', 
  1
)
WHERE COALESCE(display_name, '') = '';

-- =============================================================================
-- FIM DO ARQUIVO
-- =============================================================================
