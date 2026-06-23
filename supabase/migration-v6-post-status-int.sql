-- =============================================
-- 买家说 — 增量迁移 v6：posts.status 从 TEXT 改为 SMALLINT
-- 执行方式：Supabase Dashboard → SQL Editor → 粘贴执行
--
-- 设计原则（详见 技术开发规范.md §11.5 数据库规范）：
-- - 简单含义的状态/标志字段统一使用 int 存储（0/1/2/...）
-- - 字段语义由代码常量（src/lib/constants.ts POST_STATUS）维护，
--   DB 不再用 CHECK + 字符串枚举绑定具体业务语义
--
-- 字段对照：
--   'active'  → 0
--   'hidden'  → 1
--   'deleted' → 2
-- =============================================

-- 1. 加临时列 status_code（默认 0 = active）
ALTER TABLE posts ADD COLUMN IF NOT EXISTS status_code SMALLINT NOT NULL DEFAULT 0;

-- 2. 数据迁移
UPDATE posts SET status_code = 0 WHERE status = 'active';
UPDATE posts SET status_code = 1 WHERE status = 'hidden';
UPDATE posts SET status_code = 2 WHERE status = 'deleted';

-- 3. 解除对旧 status (TEXT) 列的全部依赖
--    Postgres 不允许在 DROP COLUMN 时还有 policy / index / constraint 引用该列
--    （报错 2BP01: cannot drop column status because other objects depend on it）
DROP POLICY IF EXISTS posts_select_active ON posts;
DROP INDEX IF EXISTS idx_posts_created_at;
DROP INDEX IF EXISTS idx_posts_user_id;
DROP INDEX IF EXISTS idx_posts_tags;
DROP INDEX IF EXISTS idx_posts_status_created;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_status_check;

-- 4. 删除旧 TEXT 列
ALTER TABLE posts DROP COLUMN IF EXISTS status;

-- 5. 重命名新列为 status
ALTER TABLE posts RENAME COLUMN status_code TO status;

-- 6. 重建局部索引（WHERE 条件由文本切换为 int）
CREATE INDEX idx_posts_created_at ON posts (created_at DESC) WHERE status = 0;
CREATE INDEX idx_posts_user_id    ON posts (user_id)           WHERE status = 0;
CREATE INDEX idx_posts_tags       ON posts USING GIN (tags)    WHERE status = 0;
CREATE INDEX idx_posts_status_created ON posts (status, created_at DESC);

-- 7. 重建 RLS SELECT 策略
CREATE POLICY "posts_select_active" ON posts
  FOR SELECT USING (status = 0 OR auth.uid() = user_id);

-- 8. 修复 migration-v5-admin.sql 中 ban_user 函数的残留字符串引用
--    （ban_user 在封禁用户时会把其 active 帖子置 deleted）
CREATE OR REPLACE FUNCTION public.ban_user(target_uid UUID)
RETURNS VOID AS $$
DECLARE
  caller UUID := auth.uid();
BEGIN
  IF caller IS NULL THEN RAISE EXCEPTION '请先登录'; END IF;
  IF NOT (SELECT public.is_admin(caller)) THEN RAISE EXCEPTION '无权操作：仅管理员可封禁用户'; END IF;
  IF caller = target_uid THEN RAISE EXCEPTION '不能封禁自己'; END IF;

  UPDATE profiles SET status = 'banned', updated_at = NOW() WHERE id = target_uid;
  -- 注意：profiles.status 仍为 TEXT（暂未改造）；posts.status 已为 SMALLINT，2 = deleted
  UPDATE posts SET status = 2, updated_at = NOW() WHERE user_id = target_uid AND status = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
