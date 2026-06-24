-- =============================================
-- 买家说 — 增量迁移 v8：修复 unban_user 不恢复帖子 bug
-- 执行方式：Supabase Dashboard → SQL Editor → 整段粘贴
-- 前置依赖：必须先跑过 migration-v7-profile-tag-status-int.sql
--
-- Bug 描述：
--   ban_user 会把用户 active 帖子 (status=0) 软删为 status=2 (DELETED)，
--   但 unban_user 仅恢复 profiles.status=ACTIVE，未把帖子从 DELETED 改回 ACTIVE，
--   导致解封后用户所有历史帖子仍不可见。
--
-- 修复方案：
--   1. posts 表新增 original_status SMALLINT（仅在 ban 时暂存原状态，unban 后清空）
--   2. ban_user 改写：把 status 暂存到 original_status，再置 status=2
--   3. unban_user 改写：按 original_status 精确还原（保留管理员主动隐藏的语义）
--   4. 历史数据补丁：已被 ban 用户的 status=2 帖子，把 original_status 设为 0
--      （因为旧 ban_user 只处理 status=0，所以 status=2 一定源自 active）
-- =============================================

-- 1. 给 posts 加暂存列（默认 NULL，仅被 ban 时填值）
ALTER TABLE posts ADD COLUMN IF NOT EXISTS original_status SMALLINT;

-- 2. 历史数据补丁：已被 ban 的用户（profiles.status=1=BANNED）的 status=2 帖子
--    旧 ban_user 只把 status=0 置 2，所以 status=2 一定原本是 active
UPDATE posts
   SET original_status = 0
 WHERE status = 2
   AND original_status IS NULL
   AND user_id IN (SELECT id FROM profiles WHERE status = 1);

-- 3. 重写 ban_user：暂存原状态 + 软删
DROP FUNCTION IF EXISTS public.ban_user(UUID);

CREATE FUNCTION public.ban_user(target_uid UUID)
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

  -- posts.status: 0=ACTIVE / 1=HIDDEN / 2=DELETED
  --   把非删除帖子的原 status 暂存到 original_status，再统一置 2
  UPDATE posts
     SET original_status = status,
         status          = 2,
         updated_at      = NOW()
   WHERE user_id = target_uid
     AND status <> 2;           -- 已 DELETED 的不动，避免覆盖 original_status
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 重写 unban_user：按 original_status 精确还原 + 清空暂存
DROP FUNCTION IF EXISTS public.unban_user(UUID);

CREATE FUNCTION public.unban_user(target_uid UUID)
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

  -- 1) 有 original_status 的：精确还原（ban 时是 ACTIVE 则还原 ACTIVE，
  --    是 HIDDEN 则还原 HIDDEN），并清空 original_status
  UPDATE posts
     SET status          = original_status,
         original_status = NULL,
         updated_at      = NOW()
   WHERE user_id = target_uid
     AND status = 2
     AND original_status IS NOT NULL;

  -- 2) 历史数据补丁：旧 ban_user 留下的 status=2 且 original_status 为 NULL，
  --    一律还原为 ACTIVE（旧 ban_user 只处理 status=0）
  UPDATE posts
     SET status     = 0,
         updated_at = NOW()
   WHERE user_id = target_uid
     AND status = 2
     AND original_status IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
