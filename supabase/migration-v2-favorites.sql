-- =============================================
-- 买家说 — 增量迁移 v2：收藏功能
-- 执行方式：Supabase Dashboard → SQL Editor → 粘贴执行
-- =============================================

-- ─── 收藏表 ───
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- 索引：按用户查收藏（按时间倒序），按帖子反查收藏者
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_post ON favorites (post_id);

-- 启用 RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- 收藏：所有人可读（用于展示某帖被多少人收藏），登录用户操作自己的
CREATE POLICY "favorites_select_all" ON favorites FOR SELECT USING (true);
CREATE POLICY "favorites_insert_own" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "favorites_delete_own" ON favorites FOR DELETE USING (auth.uid() = user_id);


-- ─── posts 表新增 favorite_count 列（自动计数） ───
ALTER TABLE posts ADD COLUMN IF NOT EXISTS favorite_count INT NOT NULL DEFAULT 0;

-- 收藏 → posts.favorite_count +1
CREATE OR REPLACE FUNCTION increment_favorite_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET favorite_count = favorite_count + 1, updated_at = NOW() WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_favorite_created ON favorites;
CREATE TRIGGER on_favorite_created
  AFTER INSERT ON favorites
  FOR EACH ROW EXECUTE FUNCTION increment_favorite_count();

-- 取消收藏 → posts.favorite_count -1
CREATE OR REPLACE FUNCTION decrement_favorite_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET favorite_count = GREATEST(favorite_count - 1, 0), updated_at = NOW() WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_favorite_deleted ON favorites;
CREATE TRIGGER on_favorite_deleted
  AFTER DELETE ON favorites
  FOR EACH ROW EXECUTE FUNCTION decrement_favorite_count();
