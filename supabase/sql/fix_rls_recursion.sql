-- =============================================================================
-- CORREÇÃO DE BUG: RECURSÃO INFINITA NAS POLÍTICAS RLS
-- =============================================================================
-- Este script corrige o erro de recursão infinita causado pelas políticas
-- que fazem auto-referência à tabela profiles.
--
-- Execute este script IMEDIATAMENTE no SQL Editor do Supabase

-- =============================================================================
-- 1. REMOVER POLÍTICAS PROBLEMÁTICAS
-- =============================================================================

-- Remover as 3 políticas que causam recursão
DROP POLICY IF EXISTS "Admins can view all profiles for management" ON profiles;
DROP POLICY IF EXISTS "Admins can update other users profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own display_name" ON profiles;

-- =============================================================================
-- 2. RECRIAR POLÍTICAS SEM RECURSÃO
-- =============================================================================

-- Política 1: Usuários podem ver seu próprio perfil
-- (Não causa recursão pois não consulta profiles dentro da condição)
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Política 2: Usuários podem atualizar seu próprio perfil
-- (Para display_name, senha, etc. - mas não is_admin ou is_active)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    -- Garantir que não estão mudando is_admin ou is_active
    AND is_admin IS NOT DISTINCT FROM (SELECT is_admin FROM profiles WHERE id = auth.uid())
    AND is_active IS NOT DISTINCT FROM (SELECT is_active FROM profiles WHERE id = auth.uid())
  );

-- =============================================================================
-- 3. CRIAR FUNÇÃO AUXILIAR PARA VERIFICAR SE É ADMIN (SEM RECURSÃO)
-- =============================================================================

-- Esta função usa SECURITY DEFINER para contornar as políticas RLS
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
-- 4. POLÍTICAS PARA ADMINS (USANDO A FUNÇÃO AUXILIAR)
-- =============================================================================

-- Política 3: Admins podem ver todos os perfis
-- Usa a função auxiliar para evitar recursão
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()  -- Sempre pode ver o próprio
    OR is_user_admin(auth.uid())  -- Ou é admin (via função auxiliar)
  );

-- Política 4: Admins podem atualizar qualquer perfil
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (is_user_admin(auth.uid()))
  WITH CHECK (is_user_admin(auth.uid()));

-- =============================================================================
-- 5. AJUSTAR VIEW (REMOVER ORDER BY QUE PODE CAUSAR PROBLEMAS)
-- =============================================================================

DROP VIEW IF EXISTS user_management_view;

CREATE VIEW user_management_view AS
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
JOIN auth.users au ON p.id = au.id;

-- Grant acesso
GRANT SELECT ON user_management_view TO authenticated;

-- =============================================================================
-- 6. VERIFICAR E CORRIGIR DADOS EXISTENTES
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
-- 7. COMENTÁRIOS
-- =============================================================================

COMMENT ON FUNCTION is_user_admin IS 'Verifica se um usuário é admin sem causar recursão RLS';

-- =============================================================================
-- FIM DA CORREÇÃO
-- =============================================================================

-- Execute este comando para verificar as políticas criadas:
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';
