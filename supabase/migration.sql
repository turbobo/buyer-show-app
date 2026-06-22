-- =============================================
-- 买家说 — Supabase 数据库完整迁移脚本
-- 执行方式：Supabase Dashboard → SQL Editor → 粘贴执行
-- =============================================

-- ─── 1. 用户资料表 ───
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL DEFAULT '',
  avatar_url TEXT DEFAULT '',
  bio TEXT DEFAULT '' CHECK (char_length(bio) <= 200),
  post_count INT NOT NULL DEFAULT 0,
  follower_count INT NOT NULL DEFAULT 0,
  following_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 注册时自动创建 profile（触发器）
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nickname', '用户' || LEFT(NEW.id::TEXT, 6)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── 2. 帖子表 ───
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) >= 2 AND char_length(title) <= 50),
  content TEXT NOT NULL CHECK (char_length(content) >= 10 AND char_length(content) <= 2000),
  images TEXT[] NOT NULL DEFAULT '{}' CHECK (array_length(images, 1) IS NULL OR array_length(images, 1) <= 9),
  tags TEXT[] NOT NULL DEFAULT '{}' CHECK (array_length(tags, 1) IS NULL OR array_length(tags, 1) <= 3),
  product_name TEXT DEFAULT '' CHECK (char_length(product_name) <= 100),
  price TEXT DEFAULT '' CHECK (char_length(price) <= 20),
  rating SMALLINT NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  like_count INT NOT NULL DEFAULT 0,
  comment_count INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'deleted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 3. 评论表 ───
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 4. 点赞表 ───
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- ─── 5. 关注表 ───
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- ─── 6. 搜索历史表 ───
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL CHECK (char_length(keyword) >= 1 AND char_length(keyword) <= 50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =============================================
-- 索引（查询性能优化）
-- =============================================

-- 帖子：按时间倒序 + 标签筛选 + 用户维度
CREATE INDEX idx_posts_created_at ON posts (created_at DESC) WHERE status = 'active';
CREATE INDEX idx_posts_user_id ON posts (user_id) WHERE status = 'active';
CREATE INDEX idx_posts_tags ON posts USING GIN (tags) WHERE status = 'active';
CREATE INDEX idx_posts_status_created ON posts (status, created_at DESC);

-- 评论：按帖子 + 时间
CREATE INDEX idx_comments_post_id ON comments (post_id, created_at DESC);
CREATE INDEX idx_comments_user_id ON comments (user_id);

-- 点赞：按帖子 + 用户
CREATE INDEX idx_likes_post_id ON likes (post_id);
CREATE INDEX idx_likes_user_id ON likes (user_id);

-- 关注：双向查询
CREATE INDEX idx_follows_follower ON follows (follower_id);
CREATE INDEX idx_follows_following ON follows (following_id);

-- 搜索历史：按用户 + 时间
CREATE INDEX idx_search_history_user ON search_history (user_id, created_at DESC);


-- =============================================
-- 触发器（自动更新计数器）
-- =============================================

-- 发帖 → profiles.post_count +1
CREATE OR REPLACE FUNCTION increment_post_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles SET post_count = post_count + 1, updated_at = NOW() WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_post_created
  AFTER INSERT ON posts
  FOR EACH ROW EXECUTE FUNCTION increment_post_count();

-- 删帖 → profiles.post_count -1
CREATE OR REPLACE FUNCTION decrement_post_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles SET post_count = GREATEST(post_count - 1, 0), updated_at = NOW() WHERE id = OLD.user_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_post_deleted
  AFTER DELETE ON posts
  FOR EACH ROW EXECUTE FUNCTION decrement_post_count();

-- 评论 → posts.comment_count +1
CREATE OR REPLACE FUNCTION increment_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET comment_count = comment_count + 1, updated_at = NOW() WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_comment_created
  AFTER INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION increment_comment_count();

-- 删评论 → posts.comment_count -1
CREATE OR REPLACE FUNCTION decrement_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET comment_count = GREATEST(comment_count - 1, 0), updated_at = NOW() WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_comment_deleted
  AFTER DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION decrement_comment_count();

-- 点赞 → posts.like_count +1
CREATE OR REPLACE FUNCTION increment_like_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET like_count = like_count + 1, updated_at = NOW() WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_like_created
  AFTER INSERT ON likes
  FOR EACH ROW EXECUTE FUNCTION increment_like_count();

-- 取消点赞 → posts.like_count -1
CREATE OR REPLACE FUNCTION decrement_like_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET like_count = GREATEST(like_count - 1, 0), updated_at = NOW() WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_like_deleted
  AFTER DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION decrement_like_count();

-- 关注 → 双向计数
CREATE OR REPLACE function increment_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles SET following_count = following_count + 1, updated_at = NOW() WHERE id = NEW.follower_id;
  UPDATE profiles SET follower_count = follower_count + 1, updated_at = NOW() WHERE id = NEW.following_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_follow_created
  AFTER INSERT ON follows
  FOR EACH ROW EXECUTE FUNCTION increment_follow_counts();

CREATE OR REPLACE FUNCTION decrement_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles SET following_count = GREATEST(following_count - 1, 0), updated_at = NOW() WHERE id = OLD.follower_id;
  UPDATE profiles SET follower_count = GREATEST(follower_count - 1, 0), updated_at = NOW() WHERE id = OLD.following_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_follow_deleted
  AFTER DELETE ON follows
  FOR EACH ROW EXECUTE FUNCTION decrement_follow_counts();


-- =============================================
-- Row Level Security（RLS 策略）
-- =============================================

-- 启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- profiles：所有人可读，本人可改
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- posts：活跃帖所有人可读，本人可增删改
CREATE POLICY "posts_select_active" ON posts FOR SELECT USING (status = 'active' OR auth.uid() = user_id);
CREATE POLICY "posts_insert_own" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_update_own" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "posts_delete_own" ON posts FOR DELETE USING (auth.uid() = user_id);

-- comments：所有人可读，登录用户可发，本人可删
CREATE POLICY "comments_select_all" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_insert_auth" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_delete_own" ON comments FOR DELETE USING (auth.uid() = user_id);

-- likes：所有人可读，登录用户可操作自己的
CREATE POLICY "likes_select_all" ON likes FOR SELECT USING (true);
CREATE POLICY "likes_insert_own" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_delete_own" ON likes FOR DELETE USING (auth.uid() = user_id);

-- follows：所有人可读，本人可操作
CREATE POLICY "follows_select_all" ON follows FOR SELECT USING (true);
CREATE POLICY "follows_insert_own" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_delete_own" ON follows FOR DELETE USING (auth.uid() = follower_id);

-- search_history：仅本人可读写
CREATE POLICY "search_history_select_own" ON search_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "search_history_insert_own" ON search_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "search_history_delete_own" ON search_history FOR DELETE USING (auth.uid() = user_id);


-- =============================================
-- Storage 存储桶（图片上传）
-- =============================================

-- 创建 posts 存储桶（公开读取）
INSERT INTO storage.buckets (id, name, public)
VALUES ('posts', 'posts', true)
ON CONFLICT (id) DO NOTHING;

-- 创建 avatars 存储桶（公开读取）
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS 策略
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- posts 桶：所有人可读，登录用户可上传自己的目录
CREATE POLICY "posts_storage_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'posts');

CREATE POLICY "posts_storage_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'posts'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "posts_storage_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'posts'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

-- avatars 桶：所有人可读，登录用户可上传
CREATE POLICY "avatars_storage_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_storage_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "avatars_storage_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
  );
