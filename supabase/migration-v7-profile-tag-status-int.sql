-- =============================================
-- 买家说 — 增量迁移 v7：profiles.role/status + tags.status 全部改为 SMALLINT
-- 执行方式：Supabase Dashboard → SQL Editor → 整段粘贴
-- 前置依赖：必须先跑过 migration-v5-admin.sql / migration-v5.2-admin-init.sql /
--          migration-v5.3-tags.sql / migration-v6-post-status-int.sql
--
-- 设计原则（详见 技术开发规范.md §11 数据库规范）：
-- - 简单含义的状态/标志/枚举字段统一使用 int 存储
-- - 字段语义由代码常量（src/lib/constants.ts）维护，DB 不再写死字符串枚举
--
-- 字段对照：
--   profiles.role:    'user'    → 0,   'admin'    → 1
--   profiles.status:  'active'  → 0,   'banned'   → 1,   'deleted' → 2
--   tags.status:      'active'  → 0,   'archived' → 1,   'deleted' → 2
--
-- 迁移五步法（参考 §11.3）：
--   1. 加临时 _code 列（默认 0 = ACTIVE/USER）
--   2. 数据迁移
--   3. 解除依赖：DROP POLICY / DROP INDEX / DROP CONSTRAINT
--   4. DROP 旧 TEXT 列 → RENAME 新列为同名
--   5. 重建索引 / 策略 / 函数（CREATE OR REPLACE）
-- =============================================

-- ─────────────────────────────────────────────
-- 一、profiles.role + profiles.status 迁移
-- ─────────────────────────────────────────────

-- 1.1 加临时列
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role_code   SMALLINT NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status_code SMALLINT NOT NULL DEFAULT 0;

-- 1.2 数据迁移
UPDATE profiles SET role_code   = 0 WHERE role   = 'user';
UPDATE profiles SET role_code   = 1 WHERE role   = 'admin';
UPDATE profiles SET status_code = 0 WHERE status = 'active';
UPDATE profiles SET status_code = 1 WHERE status = 'banned';
UPDATE profiles SET status_code = 2 WHERE status = 'deleted';

-- 1.3 解除对旧 TEXT 列的依赖
--     需先删 RLS / 函数 / 索引 / CHECK 约束，否则 DROP COLUMN 会报 2BP01
--     注意：tags_admin_all 也依赖 is_admin()，必须在 DROP FUNCTION 前一并删除
DROP POLICY IF EXISTS profiles_admin_all ON profiles;
DROP POLICY IF EXISTS tags_admin_all ON tags;
DROP INDEX IF EXISTS idx_profiles_role;
DROP INDEX IF EXISTS idx_profiles_status;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_status_check;

-- is_admin / has_any_admin 内部还引用 role/status 字符串，删掉再后面整体重建
-- （此时所有依赖它们的策略已删除，可安全 DROP）
DROP FUNCTION IF EXISTS public.is_admin(UUID);
DROP FUNCTION IF EXISTS public.has_any_admin();

-- 1.4 删除旧列、重命名新列
ALTER TABLE profiles DROP COLUMN IF EXISTS role;
ALTER TABLE profiles DROP COLUMN IF EXISTS status;
ALTER TABLE profiles RENAME COLUMN role_code   TO role;
ALTER TABLE profiles RENAME COLUMN status_code TO status;

-- 1.5 重建索引（按整数过滤）
CREATE INDEX IF NOT EXISTS idx_profiles_role   ON profiles (role)   WHERE role   = 1; -- ADMIN
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles (status) WHERE status = 1; -- BANNED

-- ─────────────────────────────────────────────
-- 二、tags.status 迁移
-- ─────────────────────────────────────────────

-- 2.1 加临时列
ALTER TABLE tags ADD COLUMN IF NOT EXISTS status_code SMALLINT NOT NULL DEFAULT 0;

-- 2.2 数据迁移
UPDATE tags SET status_code = 0 WHERE status = 'active';
UPDATE tags SET status_code = 1 WHERE status = 'archived';
UPDATE tags SET status_code = 2 WHERE status = 'deleted';

-- 2.3 解除依赖
--     tags_admin_all 已在 §1.3 一并删除（因为也依赖 is_admin），此处保留为幂等回退
DROP POLICY IF EXISTS tags_admin_all ON tags;
DROP INDEX IF EXISTS idx_tags_name_active;
DROP INDEX IF EXISTS idx_tags_status;
ALTER TABLE tags DROP CONSTRAINT IF EXISTS tags_status_check;

-- 标签管理 4 个 RPC 函数都引用 status='deleted'/'archived' 字符串，先 DROP 再重建
DROP FUNCTION IF EXISTS public.admin_create_tag(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.admin_rename_tag(UUID, TEXT);
DROP FUNCTION IF EXISTS public.admin_merge_tag(UUID, UUID);
DROP FUNCTION IF EXISTS public.admin_delete_tag(UUID);

-- 2.4 删除旧列、重命名
ALTER TABLE tags DROP COLUMN IF EXISTS status;
ALTER TABLE tags RENAME COLUMN status_code TO status;

-- 2.5 重建索引
CREATE UNIQUE INDEX IF NOT EXISTS idx_tags_name_active ON tags (LOWER(name)) WHERE status = 0;
CREATE INDEX IF NOT EXISTS idx_tags_status ON tags (status);

-- ─────────────────────────────────────────────
-- 三、重建 SECURITY DEFINER 辅助函数（基于 SMALLINT）
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.is_admin(uid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = uid AND role = 1 AND status = 0  -- role=ADMIN, status=ACTIVE
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.has_any_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE role = 1 AND status = 0
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ─────────────────────────────────────────────
-- 四、重建/覆盖管理员相关 RPC
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.promote_to_admin(target_uid UUID)
RETURNS VOID AS $$
DECLARE
  caller UUID := auth.uid();
BEGIN
  IF caller IS NULL THEN RAISE EXCEPTION '请先登录'; END IF;

  -- 自举：系统无管理员时允许任意登录用户提自己为 admin
  IF caller = target_uid AND NOT (SELECT public.has_any_admin()) THEN
    UPDATE profiles SET role = 1, updated_at = NOW() WHERE id = target_uid;
    RETURN;
  END IF;

  -- 否则调用者必须是管理员
  IF NOT (SELECT public.is_admin(caller)) THEN
    RAISE EXCEPTION '无权操作：仅管理员可提权';
  END IF;

  UPDATE profiles SET role = 1, updated_at = NOW() WHERE id = target_uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.ban_user(target_uid UUID)
RETURNS VOID AS $$
DECLARE
  caller UUID := auth.uid();
BEGIN
  IF caller IS NULL THEN RAISE EXCEPTION '请先登录'; END IF;
  IF NOT (SELECT public.is_admin(caller)) THEN
    RAISE EXCEPTION '无权操作：仅管理员可封禁用户';
  END IF;
  IF caller = target_uid THEN RAISE EXCEPTION '不能封禁自己'; END IF;

  -- profiles.status: 1 = BANNED
  UPDATE profiles SET status = 1, updated_at = NOW() WHERE id = target_uid;
  -- 同时把目标 active 帖子置 deleted（posts.status: 0 = ACTIVE, 2 = DELETED）
  UPDATE posts SET status = 2, updated_at = NOW()
   WHERE user_id = target_uid AND status = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.unban_user(target_uid UUID)
RETURNS VOID AS $$
DECLARE
  caller UUID := auth.uid();
BEGIN
  IF caller IS NULL THEN RAISE EXCEPTION '请先登录'; END IF;
  IF NOT (SELECT public.is_admin(caller)) THEN
    RAISE EXCEPTION '无权操作：仅管理员可解封用户';
  END IF;
  IF caller = target_uid THEN RAISE EXCEPTION '不能解封自己'; END IF;

  -- profiles.status: 0 = ACTIVE
  UPDATE profiles SET status = 0, updated_at = NOW() WHERE id = target_uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────
-- 五、重建标签管理 RPC（基于 SMALLINT）
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.admin_create_tag(p_name TEXT, p_description TEXT DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
  caller UUID := auth.uid();
  new_id UUID;
  trimmed_name TEXT;
BEGIN
  IF caller IS NULL THEN RAISE EXCEPTION '请先登录'; END IF;
  IF NOT (SELECT public.is_admin(caller)) THEN
    RAISE EXCEPTION '无权操作：仅管理员可管理标签';
  END IF;

  trimmed_name := TRIM(COALESCE(p_name, ''));
  IF char_length(trimmed_name) < 1 OR char_length(trimmed_name) > 20 THEN
    RAISE EXCEPTION '标签名长度需在 1-20 个字符之间';
  END IF;

  INSERT INTO tags (name, description, status)
       VALUES (trimmed_name, COALESCE(p_description, ''), 0)
    RETURNING id INTO new_id;
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.admin_rename_tag(p_tag_id UUID, p_new_name TEXT)
RETURNS VOID AS $$
DECLARE
  caller UUID := auth.uid();
  old_name TEXT;
  new_name TEXT;
BEGIN
  IF caller IS NULL THEN RAISE EXCEPTION '请先登录'; END IF;
  IF NOT (SELECT public.is_admin(caller)) THEN
    RAISE EXCEPTION '无权操作：仅管理员可管理标签';
  END IF;

  new_name := TRIM(COALESCE(p_new_name, ''));
  IF char_length(new_name) < 1 OR char_length(new_name) > 20 THEN
    RAISE EXCEPTION '标签名长度需在 1-20 个字符之间';
  END IF;

  -- tags.status: 2 = DELETED
  SELECT name INTO old_name FROM tags WHERE id = p_tag_id AND status <> 2;
  IF old_name IS NULL THEN RAISE EXCEPTION '标签不存在或已删除'; END IF;
  IF old_name = new_name THEN RETURN; END IF;

  -- 先同步 posts.tags 数组中的引用
  UPDATE posts
     SET tags       = array_replace(tags, old_name, new_name),
         updated_at = NOW()
   WHERE old_name = ANY(tags);

  -- 再改字典名
  UPDATE tags SET name = new_name, updated_at = NOW() WHERE id = p_tag_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.admin_merge_tag(p_source_id UUID, p_target_id UUID)
RETURNS VOID AS $$
DECLARE
  caller UUID := auth.uid();
  src_name TEXT;
  tgt_name TEXT;
  rec RECORD;
BEGIN
  IF caller IS NULL THEN RAISE EXCEPTION '请先登录'; END IF;
  IF NOT (SELECT public.is_admin(caller)) THEN
    RAISE EXCEPTION '无权操作：仅管理员可管理标签';
  END IF;
  IF p_source_id = p_target_id THEN RAISE EXCEPTION '源标签和目标标签不能相同'; END IF;

  -- tags.status: 2 = DELETED
  SELECT name INTO src_name FROM tags WHERE id = p_source_id AND status <> 2;
  SELECT name INTO tgt_name FROM tags WHERE id = p_target_id AND status <> 2;
  IF src_name IS NULL OR tgt_name IS NULL THEN
    RAISE EXCEPTION '源/目标标签不存在或已删除';
  END IF;

  -- 遍历所有引用 source 的帖子
  FOR rec IN SELECT id, tags FROM posts WHERE src_name = ANY(tags) LOOP
    IF tgt_name = ANY(rec.tags) THEN
      UPDATE posts SET tags = array_remove(rec.tags, src_name), updated_at = NOW()
       WHERE id = rec.id;
    ELSE
      UPDATE posts SET tags = array_replace(rec.tags, src_name, tgt_name), updated_at = NOW()
       WHERE id = rec.id;
    END IF;
  END LOOP;

  -- source 置 ARCHIVED (1)
  UPDATE tags SET status = 1, updated_at = NOW() WHERE id = p_source_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.admin_delete_tag(p_tag_id UUID)
RETURNS VOID AS $$
DECLARE
  caller UUID := auth.uid();
  tag_name TEXT;
BEGIN
  IF caller IS NULL THEN RAISE EXCEPTION '请先登录'; END IF;
  IF NOT (SELECT public.is_admin(caller)) THEN
    RAISE EXCEPTION '无权操作：仅管理员可管理标签';
  END IF;

  -- tags.status: 2 = DELETED
  SELECT name INTO tag_name FROM tags WHERE id = p_tag_id AND status <> 2;
  IF tag_name IS NULL THEN RAISE EXCEPTION '标签不存在或已删除'; END IF;

  -- 从所有帖子的 tags 数组中移除
  UPDATE posts
     SET tags       = array_remove(tags, tag_name),
         updated_at = NOW()
   WHERE tag_name = ANY(tags);

  -- 软删
  UPDATE tags SET status = 2, updated_at = NOW() WHERE id = p_tag_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────
-- 六、重建 RLS 策略（基于 SMALLINT 的 is_admin）
-- ─────────────────────────────────────────────

CREATE POLICY "profiles_admin_all" ON profiles
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "tags_admin_all" ON tags
  FOR ALL USING (public.is_admin(auth.uid()));

-- ─────────────────────────────────────────────
-- 七、修复 v6 残留：v5.3 的 sync_tags_dict 触发器函数
--     原版可能仍引用 posts.status='active' 字符串；这里以 SMALLINT 重写一遍
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.sync_tags_dict()
RETURNS TRIGGER AS $$
BEGIN
  -- posts.status: 0 = ACTIVE
  IF NEW.status = 0 THEN
    INSERT INTO tags (name)
    SELECT DISTINCT t FROM unnest(NEW.tags) AS t
     WHERE NOT EXISTS (SELECT 1 FROM tags WHERE LOWER(name) = LOWER(t))
       AND char_length(t) BETWEEN 1 AND 20;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────
-- 八、覆盖 admin_init（v5.2）—— 把 role 写整数
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.admin_init(
  project_url    TEXT,
  anon_key       TEXT,
  target_email   TEXT DEFAULT 'admin@buyer-show.local',
  target_nick    TEXT DEFAULT 'admin',
  target_password TEXT DEFAULT 'admin123'
)
RETURNS TEXT AS $$
DECLARE
  resp        JSONB;
  new_user_id UUID;
  status_code INT;
BEGIN
  IF (SELECT public.has_any_admin()) THEN
    RAISE EXCEPTION '系统已存在管理员，请通过提权或 Dashboard 操作；如需复位请先 UPDATE profiles SET role=0 WHERE role=1';
  END IF;

  IF EXISTS (SELECT 1 FROM auth.users WHERE email = target_email) THEN
    RAISE EXCEPTION '邮箱 % 已存在，请换一个或在 Dashboard 删除后重试', target_email;
  END IF;

  SELECT status, content::JSONB
    INTO status_code, resp
    FROM net.http_post(
      url := project_url || '/auth/v1/signup',
      body := jsonb_build_object(
        'email',    target_email,
        'password', target_password,
        'data',     jsonb_build_object('nickname', target_nick)
      ),
      headers := jsonb_build_object(
        'apikey',        anon_key,
        'Authorization', 'Bearer ' || anon_key,
        'Content-Type',  'application/json'
      )
    );

  IF status_code <> 200 THEN
    RAISE EXCEPTION 'GoTrue signup 失败: status=%, body=%', status_code, resp;
  END IF;

  new_user_id := (resp->'user'->>'id')::UUID;

  -- 等 handle_new_user 触发器创建 profiles 行后，再 UPDATE 为管理员
  UPDATE profiles
     SET role       = 1,                    -- USER_ROLE.ADMIN
         nickname   = COALESCE(NULLIF(target_nick, ''), nickname),
         updated_at = NOW()
   WHERE id = new_user_id;

  RETURN format(
    '管理员账号已创建：邮箱=%s，初始密码=%s，user_id=%s',
    target_email, target_password, new_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
