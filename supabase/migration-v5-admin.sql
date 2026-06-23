-- =============================================
-- 买家说 — 增量迁移 v5：管理员模块（MVP）
-- 执行方式：Supabase Dashboard → SQL Editor → 粘贴执行
-- =============================================

-- ─── 1. profiles 加 role + status 字段 ───
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';

-- 字段值约束
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin'));
ALTER TABLE profiles ADD CONSTRAINT profiles_status_check CHECK (status IN ('active', 'banned', 'deleted'));

-- 索引：按 role / status 筛选
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles (status);

-- ─── 2. 管理员判定辅助函数（供 RPC 复用） ───
CREATE OR REPLACE FUNCTION public.is_admin(uid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = uid AND role = 'admin' AND status = 'active'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 判断是否「系统没有任何管理员」（用于首次自举）
CREATE OR REPLACE FUNCTION public.has_any_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE role = 'admin' AND status = 'active');
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ─── 3. 管理员 RPC：提权 / 封禁 / 恢复 ───

-- 3.1 提权：当前用户提自己为 admin 仅在「系统无管理员」时允许（自举）；否则必须已是 admin 才能提别人
CREATE OR REPLACE FUNCTION public.promote_to_admin(target_uid UUID)
RETURNS VOID AS $$
DECLARE
  caller UUID := auth.uid();
BEGIN
  IF caller IS NULL THEN
    RAISE EXCEPTION '请先登录';
  END IF;

  IF caller = target_uid THEN
    -- 自举：仅在系统无管理员时允许
    IF (SELECT public.has_any_admin()) THEN
      RAISE EXCEPTION '系统已有管理员，不能再次自举';
    END IF;
  ELSE
    -- 他人提权：调用方必须是 admin
    IF NOT (SELECT public.is_admin(caller)) THEN
      RAISE EXCEPTION '无权操作：仅管理员可提权他人';
    END IF;
  END IF;

  UPDATE profiles SET role = 'admin', updated_at = NOW() WHERE id = target_uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3.2 封禁：仅管理员可调用；不能封自己；被封禁用户的所有 active 帖子自动置 deleted
CREATE OR REPLACE FUNCTION public.ban_user(target_uid UUID)
RETURNS VOID AS $$
DECLARE
  caller UUID := auth.uid();
BEGIN
  IF caller IS NULL THEN RAISE EXCEPTION '请先登录'; END IF;
  IF NOT (SELECT public.is_admin(caller)) THEN RAISE EXCEPTION '无权操作：仅管理员可封禁用户'; END IF;
  IF caller = target_uid THEN RAISE EXCEPTION '不能封禁自己'; END IF;

  UPDATE profiles SET status = 'banned', updated_at = NOW() WHERE id = target_uid;
  UPDATE posts SET status = 'deleted', updated_at = NOW() WHERE user_id = target_uid AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3.3 恢复：仅管理员可调用；不能恢复自己
CREATE OR REPLACE FUNCTION public.unban_user(target_uid UUID)
RETURNS VOID AS $$
DECLARE
  caller UUID := auth.uid();
BEGIN
  IF caller IS NULL THEN RAISE EXCEPTION '请先登录'; END IF;
  IF NOT (SELECT public.is_admin(caller)) THEN RAISE EXCEPTION '无权操作：仅管理员可解封用户'; END IF;
  IF caller = target_uid THEN RAISE EXCEPTION '不能操作自己'; END IF;

  UPDATE profiles SET status = 'active', updated_at = NOW() WHERE id = target_uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 4. 管理员 RLS：profiles 管理员可读写所有人 ───
-- 已存在的 profiles_update_own 只允许本人改自己；这里再加一条 admin 策略允许管理员改任意人
DROP POLICY IF EXISTS profiles_admin_all ON profiles;
CREATE POLICY "profiles_admin_all" ON profiles
  FOR ALL
  USING (public.is_admin(auth.uid()));

-- ─── 5. 登录时若用户被封禁，阻止会话恢复（配合服务端拦截） ───
-- 说明：这里只做标记；客户端 services/auth.ts 在 restoreSession 时若 status='banned' 则主动 signOut
-- （不在此 SQL 中实现，避免与 Supabase Auth 默认行为冲突）
