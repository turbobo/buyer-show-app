-- =============================================
-- 买家说 — v5.2 admin 初始化脚本（走 GoTrue signup）
--
-- 用法：
--   SELECT public.admin_init(
--     'https://xxxxx.supabase.co',        -- 项目 URL
--     'eyJhbGciOiJIUzI1NiIsInR5cCI6I...' -- anon public key
--   );
--
-- 默认账号：admin@buyer-show.local / admin123
-- =============================================

CREATE EXTENSION IF NOT EXISTS net;

CREATE OR REPLACE FUNCTION public.admin_init(
  project_url  TEXT,
  anon_key     TEXT,
  target_email TEXT DEFAULT 'admin@buyer-show.local',
  target_nick  TEXT DEFAULT 'admin',
  target_password TEXT DEFAULT 'admin123'
)
RETURNS TEXT AS $$
DECLARE
  status_code INT;
  resp_body   TEXT;
  new_user_id UUID;
BEGIN
  IF (SELECT public.has_any_admin()) THEN
    RAISE EXCEPTION '系统已有管理员，禁止再次初始化。如需新建，先 UPDATE profiles SET role=''user'' WHERE role=''admin''';
  END IF;

  IF EXISTS (SELECT 1 FROM auth.users WHERE email = target_email) THEN
    RAISE EXCEPTION '账号 % 已存在。如登录报错请到 Authentication → Users 删除后再试', target_email;
  END IF;

  IF project_url IS NULL OR project_url = '' OR anon_key IS NULL OR anon_key = '' THEN
    RAISE EXCEPTION 'project_url / anon_key 不能为空';
  END IF;

  SELECT status, COALESCE(content::text, '')
  INTO   status_code, resp_body
  FROM   net.http_post(
    url := rtrim(project_url, '/') || '/auth/v1/signup',
    body := jsonb_build_object(
      'email', target_email,
      'password', target_password,
      'data', jsonb_build_object('nickname', target_nick)
    ),
    headers := jsonb_build_object(
      'apikey', anon_key,
      'Authorization', 'Bearer ' || anon_key,
      'Content-Type', 'application/json'
    )
  );

  IF status_code IS DISTINCT FROM 200 THEN
    RAISE EXCEPTION 'GoTrue signup 失败: status=%, body=%', status_code, resp_body;
  END IF;

  SELECT id INTO new_user_id
  FROM   auth.users
  WHERE  email = target_email
  ORDER  BY created_at DESC
  LIMIT  1;

  IF new_user_id IS NULL THEN
    RAISE EXCEPTION 'GoTrue 返回 200 但 auth.users 找不到对应行：%', resp_body;
  END IF;

  UPDATE profiles
  SET    role = 'admin',
         nickname = COALESCE(NULLIF(nickname, ''), target_nick),
         updated_at = NOW()
  WHERE  id = new_user_id;

  RETURN format('admin 账号创建成功 (id=%s, email=%s, nickname=%s)', new_user_id, target_email, target_nick);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 跑法：
--   SELECT public.admin_init(
--     'https://dlbeqnibaxkqontvxdhs.supabase.co',
--     '你的 anon public key'
--   );
