-- =============================================
-- 买家说 — 增量迁移 v12：索引清理 + RLS partial index + 触发器诊断
-- 执行方式：Supabase Dashboard → SQL Editor → 整段粘贴
-- 前置依赖：必须先跑过 migration-v11-comment-replies.sql
--
-- 背景：
--   用户报告 `select * from posts` 报 `statement timeout`（2min），
--   诊断发现 posts 表只有 7 行，单查执行 0.142ms 极快，
--   但 planning buffers = 201（元数据偏臃肿）+ 8 个索引（含 1 对重复）。
--   推测超时发生在带 JOIN / 触发器的复合查询。
--
-- 本迁移做 4 件事：
--   1. 清理 idx_posts_tags（与 idx_posts_tags_active 完全重复，v6/v9 双建）
--   2. 补 posts 表 RLS partial index：
--      - idx_posts_user_id_any_status（命中 `auth.uid() = user_id` 分支，含非 active 帖子）
--      - idx_profiles_admin（复合 partial，命中 `has_any_admin()` / `is_admin()`）
--   3. 给 tags 表补 LOWER(name) 索引（sync_tags_dict 触发器用）
--   4. 给 posts 加 COMMENT 索引优化触发器查询
-- =============================================

-- ─── 1. 清理冗余索引 ───

-- idx_posts_tags 与 idx_posts_tags_active 完全重复（都是 GIN (tags) WHERE status = 0）
-- v6 建了 idx_posts_tags，v9 又建了 idx_posts_tags_active，去重留一
DROP INDEX IF EXISTS public.idx_posts_tags;

-- ─── 2. 补 RLS partial index ───

-- posts_select_active 的 `auth.uid() = user_id` 分支：用户查看自己非 active 帖子时走这条
-- 现有 idx_posts_user_id / idx_posts_user_id_active 都带 WHERE status = 0，不命中此分支
CREATE INDEX IF NOT EXISTS idx_posts_user_id_any_status
  ON posts (user_id, created_at DESC);

-- profiles_admin：命中 `has_any_admin()` / `is_admin()` 函数体
-- v7 的两个 partial index（role=1 / status=1）PG 不会自动合并
-- 当查询 `WHERE role = 1 AND status = 0` 时退化成 Seq Scan profiles
CREATE INDEX IF NOT EXISTS idx_profiles_admin
  ON profiles (id)
  WHERE role = 1 AND status = 0;

-- ─── 3. 给 tags 表补索引（sync_tags_dict 触发器用） ───

-- sync_tags_dict 触发器在 INSERT/UPDATE posts 时会：
--   INSERT INTO tags (name) SELECT ... WHERE NOT EXISTS (
--     SELECT 1 FROM tags WHERE LOWER(name) = LOWER(t)
--   );
-- 这个子查询需要 LOWER(name) 索引，否则 tags 表 Seq Scan
CREATE INDEX IF NOT EXISTS idx_tags_lower_name
  ON tags (LOWER(name));

-- ─── 4. 给 profiles 表补常用 partial index ───

-- 被封禁用户查询（unban_user / 管理后台筛选）
-- v7 的 idx_profiles_status 是 WHERE status = 1，已覆盖；本处不重复建
-- 普通 active 用户查询（关注列表 / 用户详情页）
CREATE INDEX IF NOT EXISTS idx_profiles_active
  ON profiles (id, nickname)
  WHERE status = 0;

-- ─── 5. ANALYZE 让查询计划器立即看到新统计 ───

ANALYZE posts;
ANALYZE profiles;
ANALYZE tags;

-- ─── 6. 验证（在 SQL Editor 单独跑） ───
-- 6.1 EXPLAIN 首页 feed（带 user 信息）
--   EXPLAIN (ANALYZE, BUFFERS)
--   SELECT p.*, u.nickname, u.avatar_url
--     FROM posts p
--     JOIN profiles u ON u.id = p.user_id
--    WHERE p.status = 0
--    ORDER BY p.created_at DESC
--    LIMIT 20;
--   期望：Index Scan using idx_posts_status_created + Index Scan using profiles_pkey
--
-- 6.2 EXPLAIN 个人页帖子（含自己非 active 帖子）
--   EXPLAIN (ANALYZE, BUFFERS)
--   SELECT * FROM posts
--    WHERE status = 0 OR user_id = '<uid>'
--    ORDER BY created_at DESC;
--   期望：BitmapOr (idx_posts_status_created + idx_posts_user_id_any_status)
--
-- 6.3 EXPLAIN has_any_admin()
--   EXPLAIN (ANALYZE, BUFFERS)
--   SELECT EXISTS (SELECT 1 FROM profiles WHERE role = 1 AND status = 0);
--   期望：Index Only Scan using idx_profiles_admin
--
-- 6.4 检查 sync_tags_dict 触发器单次执行耗时
--   \timing on
--   INSERT INTO posts (user_id, title, content, images, tags, product_name, price, rating, status)
--   VALUES ('<uid>', 'test', 'test test test test test', ARRAY[]::text[],
--           ARRAY['新标签xyz'], 'test', '¥1', 5, 0);
--   期望：< 50ms；如 > 1s 说明 sync_tags_dict 触发器需要进一步优化
