-- =============================================
-- 买家说 — 增量迁移 v11.1：评论回复索引
-- 执行方式：Supabase Dashboard → SQL Editor → 整段粘贴
--          （与 v11 合并粘贴亦可；如想合并可直接把本节 COPY 到 v11 末尾）
-- 前置依赖：必须先跑过 migration-v11-comment-replies.sql
--
-- 索引作用：
--   加速「按父评论查询回复」：
--     SELECT * FROM comments
--      WHERE parent_id = ? ORDER BY created_at ASC
--   partial index（仅覆盖 parent_id IS NOT NULL 行），体积最小
--
-- 为什么不用 CONCURRENTLY：
--   Supabase SQL Editor 对所有输入（含单条语句）都会包在事务块内，
--   CREATE INDEX CONCURRENTLY 在事务内必报 25001。
--   comments 表数据量小，普通 CREATE INDEX 几秒搞定，锁表对业务无影响。
--   如未来表大到百万级再考虑用 psql CLI 跑 CONCURRENTLY。
-- =============================================

-- 幂等：先 DROP 旧名，再重建
DROP INDEX IF EXISTS public.idx_comments_parent_id;

-- 复合索引：parent_id + created_at，命中「按父评论排序回复」查询，避免 filesort
CREATE INDEX IF NOT EXISTS idx_comments_parent_id
  ON comments (parent_id, created_at ASC)
  WHERE parent_id IS NOT NULL;

-- 刷新统计
ANALYZE comments;
