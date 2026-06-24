-- =============================================
-- 买家说 — 增量迁移 v9：重建 posts / comments 索引（修复首页/个人页慢查询）
-- 执行方式：Supabase Dashboard → SQL Editor → 整段粘贴
-- 前置依赖：必须先跑过 migration-v6-post-status-int.sql
--
-- 问题根因：
--   v6 迁移 posts.status TEXT → SMALLINT 时 DROP 了 4 个旧索引
--   （idx_posts_created_at / idx_posts_user_id / idx_posts_tags /
--    idx_posts_status_created），但忘了按 SMALLINT 列重建。结果：
--     - 首页 `SELECT * FROM posts WHERE status=0 ORDER BY created_at DESC LIMIT 20`
--       走全表扫描，Supabase 免费实例磁盘 I/O 慢，自然卡
--     - 个人页 `WHERE user_id=? AND status=0` 同上
--     - 标签筛选 `WHERE tags @> ARRAY['xxx'] AND status=0` 走 GIN 全扫
--     - 详情页 generateStaticParams `SELECT id FROM posts WHERE status=0` 全扫
--     - 评论列表 `WHERE post_id=? ORDER BY created_at ASC` 走 seq scan
--
-- 修复：按实际查询模式补建 partial index（仅覆盖 status=0/1/2 中常用值），
--      既节省索引体积又让 Postgres 优先选 partial index 走 Index Only Scan。
--
-- 预期效果：首页列表从秒级降到 50-150ms（Supabase 免费实例实测）。
-- =============================================

-- ─────────────────────────────────────────────
-- 一、posts 索引
-- ─────────────────────────────────────────────

-- 1. 首页 feed / 搜索排序：WHERE status=0 ORDER BY created_at DESC
--    （最高频查询，必须命中）
CREATE INDEX IF NOT EXISTS idx_posts_status_created
  ON posts (created_at DESC)
  WHERE status = 0;

-- 2. 个人页帖子列表：WHERE user_id=? AND status=0 ORDER BY created_at DESC
--    （partial 索引只覆盖 status=0，体积最小）
CREATE INDEX IF NOT EXISTS idx_posts_user_id_active
  ON posts (user_id, created_at DESC)
  WHERE status = 0;

-- 3. 标签筛选：WHERE tags @> ARRAY['xxx'] AND status=0
--    （GIN 索引支持数组 contains 操作符）
CREATE INDEX IF NOT EXISTS idx_posts_tags_active
  ON posts USING GIN (tags)
  WHERE status = 0;

-- 4. 详情页 / 编辑页 generateStaticParams：SELECT id FROM posts WHERE status=0 LIMIT 100
--    （仅投影 id 走 Index Only Scan，无需回表）
CREATE INDEX IF NOT EXISTS idx_posts_id_active
  ON posts (id)
  WHERE status = 0;

-- 5. 管理员用户详情页：WHERE user_id=? AND status=0（已有 idx_posts_user_id_active 覆盖）
-- 6. 单帖详情 / 编辑权限校验：WHERE id=? 走主键索引，无需新增
-- 7. tags 管理 usage_count：WHERE tags @> ARRAY[name] AND status=0（已有 idx_posts_tags_active）

-- ─────────────────────────────────────────────
-- 二、comments 索引
-- ─────────────────────────────────────────────

-- 评论列表：WHERE post_id=? ORDER BY created_at ASC
CREATE INDEX IF NOT EXISTS idx_comments_post_id_created
  ON comments (post_id, created_at ASC);

-- 用户最近评论：WHERE user_id=? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_comments_user_id_created
  ON comments (user_id, created_at DESC);

-- ─────────────────────────────────────────────
-- 三、likes / favorites / follows（高频用户维度查询）
-- ─────────────────────────────────────────────

-- 点赞/收藏/关注 唯一性校验：WHERE (post_id/user_id/comment_id)=? AND user_id=?
--   likes 表：
CREATE INDEX IF NOT EXISTS idx_likes_post_user
  ON likes (post_id, user_id);
--   favorites（帖子收藏）：
CREATE INDEX IF NOT EXISTS idx_favorites_post_user
  ON favorites (post_id, user_id);
--   favorite_tags（标签收藏）：
CREATE INDEX IF NOT EXISTS idx_favorite_tags_user_tag
  ON favorite_tags (user_id, tag);
--   favorite_comments（评论收藏）：
CREATE INDEX IF NOT EXISTS idx_favorite_comments_user_comment
  ON favorite_comments (comment_id, user_id);

-- follows 双向计数：follower_id / following_id
CREATE INDEX IF NOT EXISTS idx_follows_follower
  ON follows (follower_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_follows_following
  ON follows (following_id, created_at DESC);

-- ─────────────────────────────────────────────
-- 四、search_history（搜索页「我的历史」）
-- ─────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_search_history_user_created
  ON search_history (user_id, created_at DESC);

-- ─────────────────────────────────────────────
-- 五、索引统计刷新
-- ─────────────────────────────────────────────

-- 让查询计划器立即看到新索引的统计信息
ANALYZE posts;
ANALYZE comments;
ANALYZE likes;
ANALYZE favorites;
ANALYZE favorite_tags;
ANALYZE favorite_comments;
ANALYZE follows;
ANALYZE search_history;
