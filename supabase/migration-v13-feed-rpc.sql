-- =============================================
-- 买家说 — 增量迁移 v13：首页 feed RPC 函数（绕过 RLS 提速）
-- 执行方式：Supabase Dashboard → SQL Editor → 整段粘贴
-- 前置依赖：必须先跑过 migration-v12-index-cleanup-rls-perf.sql
--
-- 背景：
--   首页帖子列表查询走 PostgREST 时，RLS 策略
--   posts_select_active `(status = 0 OR auth.uid() = user_id)` 的 OR
--   阻止优化器走部分索引 idx_posts_status_created；
--   同时 JOIN profiles 时 profiles_admin_all 策略也被评估。
--   首页 feed 只需公开 active 帖子，用 SECURITY DEFINER 绕过 RLS 直达索引。
--
-- 本迁移做 1 件事：
--   创建 fetch_feed_posts RPC 函数
-- =============================================

CREATE OR REPLACE FUNCTION public.fetch_feed_posts(
  p_limit INT DEFAULT 21,
  p_offset INT DEFAULT 0,
  p_tag TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  title TEXT,
  content TEXT,
  images TEXT[],
  tags TEXT[],
  product_name TEXT,
  price TEXT,
  rating SMALLINT,
  like_count INT,
  comment_count INT,
  favorite_count INT,
  status SMALLINT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  user_nickname TEXT,
  user_avatar_url TEXT
) AS $$
  SELECT p.id, p.user_id, p.title, p.content, p.images, p.tags,
         p.product_name, p.price, p.rating,
         p.like_count, p.comment_count, p.favorite_count,
         p.status, p.created_at, p.updated_at,
         u.nickname, u.avatar_url
  FROM posts p
  JOIN profiles u ON u.id = p.user_id
  WHERE p.status = 0
    AND (p_tag IS NULL OR p.tags @> ARRAY[p_tag])
  ORDER BY p.created_at DESC
  OFFSET p_offset LIMIT p_limit;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ─── 验证（在 SQL Editor 单独跑） ───
-- SELECT * FROM fetch_feed_posts(21, 0, NULL);
-- 期望：< 100ms，走 idx_posts_status_created + profiles_pkey
--
-- EXPLAIN (ANALYZE, BUFFERS)
-- SELECT p.id, p.user_id, p.title, p.content, p.images, p.tags,
--        p.product_name, p.price, p.rating,
--        p.like_count, p.comment_count, p.favorite_count,
--        p.status, p.created_at, p.updated_at,
--        u.nickname, u.avatar_url
-- FROM posts p
-- JOIN profiles u ON u.id = p.user_id
-- WHERE p.status = 0
-- ORDER BY p.created_at DESC
-- LIMIT 21;
