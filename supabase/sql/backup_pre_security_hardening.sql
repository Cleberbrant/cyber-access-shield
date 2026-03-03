-- =====================================================
-- BACKUP PRE-SECURITY HARDENING
-- Data: 2026-03-03
-- Projeto: cyber-access-shield (erbyxhjehrvpxvfycxwx)
-- Propósito: Snapshot do estado do banco antes das
--            modificações de segurança antifraude
-- =====================================================

-- =====================================================
-- 1. FUNÇÕES / RPCs
-- =====================================================

CREATE OR REPLACE FUNCTION public.can_user_attempt_assessment(p_user_id uuid, p_assessment_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_max_attempts INTEGER;
  v_current_attempts INTEGER;
BEGIN
  SELECT max_attempts INTO v_max_attempts FROM assessments WHERE id = p_assessment_id;
  IF v_max_attempts = 0 THEN RETURN true; END IF;
  v_current_attempts := count_user_attempts(p_user_id, p_assessment_id);
  RETURN v_current_attempts < v_max_attempts;
END;
$function$;

CREATE OR REPLACE FUNCTION public.change_own_password(p_current_password text, p_new_password text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
  v_encrypted_password TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Usuário não autenticado'; END IF;
  SELECT encrypted_password INTO v_encrypted_password FROM auth.users WHERE id = v_user_id;
  IF v_encrypted_password != crypt(p_current_password, v_encrypted_password) THEN
    RAISE EXCEPTION 'Senha atual incorreta';
  END IF;
  UPDATE auth.users SET encrypted_password = crypt(p_new_password, gen_salt('bf')), updated_at = now() WHERE id = v_user_id;
  UPDATE profiles SET temp_password = NULL, temp_password_created_at = NULL WHERE id = v_user_id AND temp_password IS NOT NULL;
  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.clear_temp_password(p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE profiles SET temp_password = NULL, temp_password_created_at = NULL WHERE id = p_user_id AND temp_password IS NOT NULL;
  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.count_user_attempts(p_user_id uuid, p_assessment_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  attempt_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO attempt_count FROM assessment_sessions WHERE user_id = p_user_id AND assessment_id = p_assessment_id AND is_completed = true;
  RETURN COALESCE(attempt_count, 0);
END;
$function$;

CREATE OR REPLACE FUNCTION public.delete_assessment_with_logs(p_assessment_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_is_admin BOOLEAN;
  v_deleted_count INTEGER := 0;
  v_logs_count INTEGER := 0;
  v_sessions_count INTEGER := 0;
  v_questions_count INTEGER := 0;
BEGIN
  SELECT is_admin INTO v_is_admin FROM profiles WHERE id = auth.uid();
  IF NOT v_is_admin THEN RAISE EXCEPTION 'Apenas administradores podem deletar avaliações'; END IF;
  SELECT COUNT(*) INTO v_logs_count FROM security_logs WHERE assessment_id = p_assessment_id;
  SELECT COUNT(*) INTO v_sessions_count FROM assessment_sessions WHERE assessment_id = p_assessment_id;
  SELECT COUNT(*) INTO v_questions_count FROM questions WHERE assessment_id = p_assessment_id;
  DELETE FROM assessments WHERE id = p_assessment_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN jsonb_build_object('success', true, 'deleted', v_deleted_count > 0, 'assessment_id', p_assessment_id, 'logs_deleted', v_logs_count, 'sessions_deleted', v_sessions_count, 'questions_deleted', v_questions_count);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_stats()
 RETURNS TABLE(total bigint, admins bigint, students bigint, inactive bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY SELECT COUNT(*)::BIGINT as total, COUNT(*) FILTER (WHERE is_admin = true AND is_active = true)::BIGINT as admins, COUNT(*) FILTER (WHERE is_admin = false AND is_active = true)::BIGINT as students, COUNT(*) FILTER (WHERE is_active = false)::BIGINT as inactive FROM profiles;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, is_admin) VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url', COALESCE(NEW.raw_user_meta_data->>'is_admin', 'false')::boolean);
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.increment_warning_count(p_session_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_new_count INTEGER;
BEGIN
  UPDATE assessment_sessions SET warning_count = warning_count + 1 WHERE id = p_session_id RETURNING warning_count INTO v_new_count;
  RETURN v_new_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.insert_security_log(p_event_type text, p_event_details text DEFAULT NULL::text, p_assessment_id uuid DEFAULT NULL::uuid, p_session_id uuid DEFAULT NULL::uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO security_logs (user_id, event_type, event_details, assessment_id, session_id, user_agent, ip_address) VALUES (auth.uid(), p_event_type, p_event_details, p_assessment_id, p_session_id, current_setting('request.headers', true)::json->>'user-agent', inet_client_addr()) RETURNING id INTO v_log_id;
  RETURN v_log_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  is_admin BOOLEAN;
BEGIN
  SELECT p.is_admin INTO is_admin FROM public.profiles p WHERE p.id = uid;
  RETURN COALESCE(is_admin, FALSE);
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  is_admin_result BOOLEAN;
BEGIN
  SELECT is_admin INTO is_admin_result FROM profiles WHERE id = user_id;
  RETURN COALESCE(is_admin_result, false);
END;
$function$;

CREATE OR REPLACE FUNCTION public.reset_user_password(p_target_user_id uuid, p_temp_password text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_admin_id UUID;
BEGIN
  v_admin_id := auth.uid();
  IF NOT is_user_admin(v_admin_id) THEN RAISE EXCEPTION 'Apenas administradores podem resetar senhas'; END IF;
  IF v_admin_id = p_target_user_id THEN RAISE EXCEPTION 'Use a função de auto-edição para mudar sua própria senha'; END IF;
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_target_user_id) THEN RAISE EXCEPTION 'Usuário não encontrado'; END IF;
  UPDATE auth.users SET encrypted_password = crypt(p_temp_password, gen_salt('bf')), updated_at = now() WHERE id = p_target_user_id;
  UPDATE profiles SET temp_password = p_temp_password, temp_password_created_at = now() WHERE id = p_target_user_id;
  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_session_last_activity()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.last_activity_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- =====================================================
-- 2. VIEWS
-- =====================================================

CREATE OR REPLACE VIEW public.security_report AS
  SELECT sl.id, sl.created_at, sl.event_type, sl.event_details, sl.user_id,
    au.email AS user_email, p.full_name AS user_name,
    a.id AS assessment_id, a.title AS assessment_title,
    asr.id AS session_id, asr.started_at AS session_started_at,
    asr.is_cancelled, asr.cancellation_reason, asr.warning_count, asr.score,
    sl.user_agent, sl.ip_address
  FROM security_logs sl
    LEFT JOIN auth.users au ON sl.user_id = au.id
    LEFT JOIN profiles p ON sl.user_id = p.id
    LEFT JOIN assessments a ON sl.assessment_id = a.id
    LEFT JOIN assessment_sessions asr ON sl.session_id = asr.id
  ORDER BY sl.created_at DESC;

CREATE OR REPLACE VIEW public.user_management_view AS
  SELECT p.id, au.email, p.display_name, p.is_admin, p.is_active,
    p.temp_password, p.temp_password_created_at,
    au.created_at, au.last_sign_in_at, au.confirmed_at
  FROM profiles p
    JOIN auth.users au ON p.id = au.id
  ORDER BY au.created_at DESC;

-- =====================================================
-- 3. RLS POLICIES (40 políticas em 7 tabelas)
-- =====================================================

-- === assessment_sessions (8 políticas) ===
-- "Administradores podem gerenciar sessões" | ALL | authenticated | USING: is_admin(auth.uid())
-- "Administradores podem ver todas as sessões" | SELECT | authenticated | USING: is_admin(auth.uid())
-- "Alunos podem atualizar suas próprias sessões" | UPDATE | authenticated | USING: (user_id = auth.uid())
-- "Alunos podem criar suas próprias sessões" | INSERT | authenticated | WITH CHECK: (user_id = auth.uid())
-- "Alunos podem ver suas próprias sessões" | SELECT | authenticated | USING: (user_id = auth.uid())
-- "Users can insert their own sessions" | INSERT | public | WITH CHECK: (auth.uid() = user_id)
-- "Users can update their own sessions" | UPDATE | public | USING: (auth.uid() = user_id) WITH CHECK: (auth.uid() = user_id)
-- "Users can view their own sessions" | SELECT | public | USING: (auth.uid() = user_id)

-- === assessments (6 políticas) ===
-- "Administradores podem gerenciar avaliações" | ALL | authenticated | USING: is_admin(auth.uid())
-- "Admins can create assessments" | INSERT | authenticated | WITH CHECK: EXISTS(profiles.is_admin=true)
-- "Admins can delete assessments" | DELETE | authenticated | USING: EXISTS(profiles.is_admin=true)
-- "Admins can update assessments" | UPDATE | authenticated | USING: EXISTS(profiles.is_admin=true)
-- "Admins can view all assessments" | SELECT | authenticated | USING: EXISTS(profiles.is_admin=true)
-- "Students can view available assessments" | SELECT | authenticated | USING: NOT admin AND (available_from IS NULL OR available_from <= now())
-- "Todos os usuários autenticados podem ver avaliações ativas" | SELECT | authenticated | USING: (is_active = true)

-- === profiles (8 políticas) ===
-- "Administradores podem ver todos os perfis" | SELECT | authenticated | USING: is_admin(auth.uid())
-- "Admins can update all profiles" | UPDATE | authenticated | USING/CHECK: is_user_admin(auth.uid())
-- "Admins can view all profiles" | SELECT | authenticated | USING: (id = auth.uid()) OR is_user_admin
-- "Novos usuários podem inserir seus próprios perfis" | INSERT | authenticated | WITH CHECK: (auth.uid() = id)
-- "Users can update own profile" | UPDATE | authenticated | USING: (id = auth.uid()) CHECK: blocks is_admin/is_active self-change
-- "Users can view own profile" | SELECT | authenticated | USING: (id = auth.uid())
-- "Usuários podem atualizar seus próprios perfis" | UPDATE | authenticated | USING: (auth.uid() = id)
-- "Usuários podem ver seus próprios perfis" | SELECT | authenticated | USING: (auth.uid() = id)

-- === questions (6 políticas) ===
-- "Administradores podem gerenciar questões" | ALL | authenticated | USING: is_admin(auth.uid())
-- "Alunos podem ver questões durante a avaliação" | SELECT | authenticated | USING: EXISTS(session ativa)
-- "Apenas administradores podem atualizar questões" | UPDATE | public | USING: EXISTS(profiles.is_admin=true)
-- "Apenas administradores podem criar questões" | INSERT | public | WITH CHECK: EXISTS(profiles.is_admin=true)
-- "Apenas administradores podem deletar questões" | DELETE | public | USING: EXISTS(profiles.is_admin=true)
-- "Usuários autenticados podem ler questões" | SELECT | public | USING: (auth.uid() IS NOT NULL)

-- === security_logs (3 políticas) ===
-- "Admins can view all security logs" | SELECT | authenticated | USING: EXISTS(profiles.is_admin=true)
-- "Users can insert their own security logs" | INSERT | authenticated | WITH CHECK: (auth.uid() = user_id)
-- "Users can view their own security logs" | SELECT | authenticated | USING: (auth.uid() = user_id)

-- === user_answers (6 políticas) ===
-- "Administradores podem ver todas as respostas" | SELECT | authenticated | USING: is_admin(auth.uid())
-- "Alunos podem inserir suas próprias respostas" | INSERT | authenticated | WITH CHECK: EXISTS(session do user)
-- "Alunos podem ver suas próprias respostas" | SELECT | authenticated | USING: EXISTS(session do user)
-- "Usuários podem atualizar suas próprias respostas" | UPDATE | public | USING: EXISTS(session do user)
-- "Usuários podem inserir suas próprias respostas" | INSERT | public | WITH CHECK: EXISTS(session do user)
-- "Usuários podem ler suas próprias respostas" | SELECT | public | USING: EXISTS(session do user)

-- === user_management_logs (2 políticas) ===
-- "Admins can insert audit logs" | INSERT | authenticated | WITH CHECK: (auth.uid() = admin_id) AND is_user_admin
-- "Admins can view all audit logs" | SELECT | authenticated | USING: is_user_admin(auth.uid())
