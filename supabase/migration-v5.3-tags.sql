-- =============================================
-- 买家说 — 增量迁移 v5.3：标签管理模块（MVP）
-- 执行方式：Supabase Dashboard → SQL Editor → 粘贴执行
--
-- 设计要点：
-- - posts.tags 仍保持 TEXT[]（性能最优，搜索/筛选不需要 JOIN）
-- - tags 表仅作为"标签字典"存在：管理员在 /admin/tags 维护它
-- - 重命名 / 合并 / 删除时通过 RPC 同步更新 posts.tags 数组元素
-- - status 字段支持软删除（deleted），避免引用断裂
-- =============================================

-- ─── 1. tags 表 ───
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT tags_status_check CHECK (status IN ('active', 'archived', 'deleted'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_tags_name_active
  ON tags (name) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_tags_status ON tags (status);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- 所有人可读（前台标签筛选/搜索需要），管理员可写
DROP POLICY IF EXISTS tags_select_all ON tags;
DROP POLICY IF EXISTS tags_admin_all ON tags;
CREATE POLICY "tags_select_all"  ON tags FOR SELECT USING (true);
CREATE POLICY "tags_admin_all"   ON tags FOR ALL    USING (public.is_admin(auth.uid()));

-- ─── 2. 初始填充：把 posts.tags 里出现过的标签同步进 tags 表 ───
INSERT INTO tags (name)
SELECT DISTINCT unnest(tags) FROM posts
WHERE status = 'active' AND tags IS NOT NULL
ON CONFLICT DO NOTHING;

-- ─── 3. RPC：创建标签（仅管理员） ───
CREATE OR REPLACE FUNCTION public.admin_create_tag(
  p_name TEXT,
  p_description TEXT DEFAULT ''
)
RETURNS UUID AS $$
DECLARE
  caller UUID := auth.uid();
  new_id UUID;
BEGIN
  IF caller IS NULL THEN RAISE EXCEPTION '请先登录'; END IF;
  IF NOT (SELECT public.is_admin(caller)) THEN RAISE EXCEPTION '无权操作：仅管理员可创建标签'; END IF;
  IF char_length(trim(p_name)) < 1 OR char_length(p_name) > 20 THEN
    RAISE EXCEPTION '标签名需 1-20 字';
  END IF;

  INSERT INTO tags (name, description)
  VALUES (trim(p_name), COALESCE(p_description, ''))
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 4. RPC：重命名标签（同步更新 posts.tags 中所有引用） ───
CREATE OR REPLACE FUNCTION public.admin_rename_tag(
  p_tag_id UUID,
  p_new_name TEXT
)
RETURNS VOID AS $$
DECLARE
  caller UUID := auth.uid();
  old_name TEXT;
BEGIN
  IF caller IS NULL THEN RAISE EXCEPTION '请先登录'; END IF;
  IF NOT (SELECT public.is_admin(caller)) THEN RAISE EXCEPTION '无权操作：仅管理员可重命名标签'; END IF;
  IF char_length(trim(p_new_name)) < 1 OR char_length(p_new_name) > 20 THEN
    RAISE EXCEPTION '标签名需 1-20 字';
  END IF;

  SELECT name INTO old_name FROM tags WHERE id = p_tag_id AND status <> 'deleted';
  IF old_name IS NULL THEN RAISE EXCEPTION '标签不存在'; END IF;
  IF old_name = trim(p_new_name) THEN RETURN; END IF;

  -- 更新 posts.tags：数组元素替换
  UPDATE posts
  SET tags = array_replace(tags, old_name, trim(p_new_name)),
      updated_at = NOW()
  WHERE tags @> ARRAY[old_name];

  -- 再更新 tags 表本身（如果新名已存在但属于别的 id，由 UNIQUE 约束抛错）
  UPDATE tags SET name = trim(p_new_name), updated_at = NOW() WHERE id = p_tag_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 5. RPC：合并标签（把 source 的所有引用转移到 target，source 归档） ───
CREATE OR REPLACE FUNCTION public.admin_merge_tag(
  p_source_id UUID,
  p_target_id UUID
)
RETURNS VOID AS $$
DECLARE
  caller UUID := auth.uid();
  source_name TEXT;
  target_name TEXT;
BEGIN
  IF caller IS NULL THEN RAISE EXCEPTION '请先登录'; END IF;
  IF NOT (SELECT public.is_admin(caller)) THEN RAISE EXCEPTION '无权操作：仅管理员可合并标签'; END IF;
  IF p_source_id = p_target_id THEN RAISE EXCEPTION '不能把标签合并到自己'; END IF;

  SELECT name INTO source_name FROM tags WHERE id = p_source_id AND status <> 'deleted';
  SELECT name INTO target_name FROM tags WHERE id = p_target_id AND status <> 'deleted';
  IF source_name IS NULL OR target_name IS NULL THEN RAISE EXCEPTION '标签不存在'; END IF;

  -- 对每个引用 source 的帖子：
  --   - 如果已包含 target：只去掉 source（避免重复）
  --   - 否则：把 source 替换为 target
  UPDATE posts
  SET tags = array_replace(tags, source_name, target_name),
      updated_at = NOW()
  WHERE tags @> ARRAY[source_name]
    AND NOT (tags @> ARRAY[target_name]);

  UPDATE posts
  SET tags = array_remove(tags, source_name),
      updated_at = NOW()
  WHERE tags @> ARRAY[source_name];

  -- source 归档（保留历史行，但 UNIQUE 索引只对 active 生效）
  UPDATE tags SET status = 'archived', updated_at = NOW() WHERE id = p_source_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 6. RPC：删除标签（软删 + 从 posts.tags 数组中移除） ───
CREATE OR REPLACE FUNCTION public.admin_delete_tag(p_tag_id UUID)
RETURNS VOID AS $$
DECLARE
  caller UUID := auth.uid();
  tag_name TEXT;
BEGIN
  IF caller IS NULL THEN RAISE EXCEPTION '请先登录'; END IF;
  IF NOT (SELECT public.is_admin(caller)) THEN RAISE EXCEPTION '无权操作：仅管理员可删除标签'; END IF;

  SELECT name INTO tag_name FROM tags WHERE id = p_tag_id AND status <> 'deleted';
  IF tag_name IS NULL THEN RAISE EXCEPTION '标签不存在'; END IF;

  -- 从所有帖子的 tags 数组里剔除
  UPDATE posts
  SET tags = array_remove(tags, tag_name),
      updated_at = NOW()
  WHERE tags @> ARRAY[tag_name];

  -- tags 表软删
  UPDATE tags SET status = 'deleted', updated_at = NOW() WHERE id = p_tag_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 7. 发帖/更新时自动补 tags 字典（可选；不想字典膨胀可删掉这个触发器） ───
CREATE OR REPLACE FUNCTION public.sync_tags_dict()
RETURNS TRIGGER AS $$
DECLARE
  all_new_tags TEXT[];
BEGIN
  all_new_tags := COALESCE(NEW.tags, ARRAY[]::TEXT[]);
  IF array_length(all_new_tags, 1) > 0 THEN
    INSERT INTO tags (name)
    SELECT unnest(all_new_tags)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_post_tags_changed ON posts;
CREATE TRIGGER on_post_tags_changed
  AFTER INSERT OR UPDATE OF tags ON posts
  FOR EACH ROW EXECUTE FUNCTION public.sync_tags_dict();
