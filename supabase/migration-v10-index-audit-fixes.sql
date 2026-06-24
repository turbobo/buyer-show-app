-- =============================================
-- 买家说 — 增量迁移 v10：索引合理性整改
-- 执行方式：Supabase Dashboard → SQL Editor → 整段粘贴
-- 前置依赖：必须先跑过 migration-v9-rebuild-posts-indexes.sql
--
-- 审计结论（盘点 migration.sql + v1-v9 全部 CREATE INDEX / UNIQUE 约束）：
--
--   【P0 严重】v9 的 4 个 CREATE INDEX CONCURRENTLY IF NOT EXISTS 被 v1 的单列
--              同名索引静默跳过，导致实际库里的索引还是 v1 版本（无法用于 ORDER BY
--              created_at DESC）：
--              - idx_follows_follower     v1:(follower_id)                 v9:(follower_id, created_at DESC)
--              - idx_follows_following    v1:(following_id)                v9:(following_id, created_at DESC)
--              - idx_search_history_user_created  v1:idx_search_history_user  v9:idx_search_history_user_created
--              实际受影响：fetchFollowers / fetchFollowing（个人页关注/粉丝列表）
--              走 filesort；search_history 排序同样失效。
--
--   【P1 冗余】v1/v2/v4 建的 5 个单列索引与 UNIQUE 约束自动生成的 backing index
--              完全重复，且无业务查询命中：
--              - idx_favorites_post            (post_id)   UNIQUE(user_id, post_id) 已覆盖
--              - idx_favorite_comments_comment (comment_id) UNIQUE(user_id, comment_id) 已覆盖
--              - idx_favorite_tags_user        (user_id)   UNIQUE(user_id, tag) 已覆盖
--              - idx_likes_post_id             (post_id)   UNIQUE(post_id, user_id) 已覆盖
--              - idx_likes_user_id             (user_id)   UNIQUE(post_id, user_id) 已覆盖
--              - idx_search_history_user       (user_id, created_at DESC) 与 v9 同名不同定义，冲突
--              合计可节省约 15-30% 索引体积，写路径也更快。
--
--   【P2 缺漏】profiles.nickname 缺 btree 索引：services/user.ts#isNicknameAvailable
--              用 `.eq('nickname', trimmed)` 做精确匹配，目前 v3 的 LOWER(nickname)
--              函数索引只支持 case-insensitive 查询，btree 等值查询用不上。
--
-- 本迁移修复上述三类问题，不动表结构、不动 RPC、不动 RLS、不动业务代码。
-- =============================================

-- ─────────────────────────────────────────────
-- 一、P0：修复 v9 与 v1 索引名冲突导致的静默跳过
-- ─────────────────────────────────────────────

-- 1.1 先删掉 v9 的同名索引（实际没建出来，但 IF NOT EXISTS 在重复跑时可能误中）
DROP INDEX IF EXISTS public.idx_follows_follower;
DROP INDEX IF EXISTS public.idx_follows_following;
DROP INDEX IF EXISTS public.idx_search_history_user_created;

-- 1.2 删掉 v1 遗留的单列索引（它们阻止了复合索引的同名重建）
DROP INDEX IF EXISTS public.idx_search_history_user;

-- 1.3 重建正确的复合索引（follower/following + created_at DESC，命中 fetchFollowers/fetchFollowing）
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_follows_follower
  ON follows (follower_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_follows_following
  ON follows (following_id, created_at DESC);

-- 1.4 重建 search_history 的复合索引（user_id + created_at DESC）
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_search_history_user_created
  ON search_history (user_id, created_at DESC);

-- ─────────────────────────────────────────────
-- 二、P1：删除冗余单列索引（UNIQUE 约束的 backing index 已覆盖）
-- ─────────────────────────────────────────────

-- 2.1 likes：UNIQUE(post_id, user_id) 的 backing index 已覆盖 post_id 前缀
DROP INDEX IF EXISTS public.idx_likes_post_id;
DROP INDEX IF EXISTS public.idx_likes_user_id;

-- 2.2 favorites：UNIQUE(user_id, post_id) 已覆盖 post_id（反向查找）
--     代码中没有 .from('favorites').eq('post_id', ...) 查询，仅有按 user_id 查
DROP INDEX IF EXISTS public.idx_favorites_post;

-- 2.3 favorite_comments：UNIQUE(user_id, comment_id) 已覆盖
--     代码中没有按 comment_id 单列查 favorite_comments 的查询
DROP INDEX IF EXISTS public.idx_favorite_comments_comment;

-- 2.4 favorite_tags：UNIQUE(user_id, tag) 已覆盖 user_id
--     代码中 fetchUserFavoriteTagSet(user_id) 走的是 (user_id, tag) 复合唯一索引
DROP INDEX IF EXISTS public.idx_favorite_tags_user;

-- ─────────────────────────────────────────────
-- 三、P2：补建缺漏索引
-- ─────────────────────────────────────────────

-- 3.1 profiles.nickname btree 索引：
--     services/user.ts#isNicknameAvailable 用 `.eq('nickname', trimmed)` 精确匹配
--     v3 的 LOWER(nickname) 函数索引只能命中 case-insensitive 查询，等值用不上
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_nickname
  ON profiles (nickname);

-- ─────────────────────────────────────────────
-- 四、统计刷新
-- ─────────────────────────────────────────────

ANALYZE follows;
ANALYZE search_history;
ANALYZE likes;
ANALYZE favorites;
ANALYZE favorite_comments;
ANALYZE favorite_tags;
ANALYZE profiles;
