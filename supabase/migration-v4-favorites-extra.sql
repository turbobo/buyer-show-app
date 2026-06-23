-- =============================================
-- 买家说 — 增量迁移 v4：评论收藏 + 标签收藏
-- 执行方式：Supabase Dashboard → SQL Editor → 粘贴执行
-- =============================================

-- ─── 1. favorite_comments 表 ───
CREATE TABLE IF NOT EXISTS favorite_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, comment_id)
);

CREATE INDEX IF NOT EXISTS idx_favorite_comments_user ON favorite_comments (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_favorite_comments_comment ON favorite_comments (comment_id);

ALTER TABLE favorite_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "favorite_comments_select_all" ON favorite_comments FOR SELECT USING (true);
CREATE POLICY "favorite_comments_insert_own" ON favorite_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "favorite_comments_delete_own" ON favorite_comments FOR DELETE USING (auth.uid() = user_id);

-- comments 表 favorite_count 列（如 v1 已有则跳过）
ALTER TABLE comments ADD COLUMN IF NOT EXISTS favorite_count INT NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION increment_comment_favorite_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE comments SET favorite_count = favorite_count + 1 WHERE id = NEW.comment_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_favorite_comment_created ON favorite_comments;
CREATE TRIGGER on_favorite_comment_created
  AFTER INSERT ON favorite_comments
  FOR EACH ROW EXECUTE FUNCTION increment_comment_favorite_count();

CREATE OR REPLACE FUNCTION decrement_comment_favorite_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE comments SET favorite_count = GREATEST(favorite_count - 1, 0) WHERE id = OLD.comment_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_favorite_comment_deleted ON favorite_comments;
CREATE TRIGGER on_favorite_comment_deleted
  AFTER DELETE ON favorite_comments
  FOR EACH ROW EXECUTE FUNCTION decrement_comment_favorite_count();

-- ─── 2. favorite_tags 表 ───
CREATE TABLE IF NOT EXISTS favorite_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, tag),
  CHECK (char_length(tag) >= 1 AND char_length(tag) <= 20)
);

CREATE INDEX IF NOT EXISTS idx_favorite_tags_user ON favorite_tags (user_id, created_at DESC);

ALTER TABLE favorite_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "favorite_tags_select_all" ON favorite_tags FOR SELECT USING (true);
CREATE POLICY "favorite_tags_insert_own" ON favorite_tags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "favorite_tags_delete_own" ON favorite_tags FOR DELETE USING (auth.uid() = user_id);
