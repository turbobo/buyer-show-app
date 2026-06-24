-- =============================================
-- 买家说 — 增量迁移 v11：评论回复（一级嵌套）
-- 执行方式：Supabase Dashboard → SQL Editor → 整段粘贴
--          （本文件仅含 schema + 触发器，可运行在事务内）
-- 前置依赖：必须先跑过 migration.sql（comments 表基础结构）
--
-- 新增能力：
--   - comments.parent_id：父评论 ID（NULL 表示顶级评论）
--   - comments.reply_count：回复计数（触发器自动维护）
--   - 一级嵌套约束：回复不能再被回复（parent 必须是顶级评论）
--   - 禁止自引用（parent_id ≠ id）
--   - INSERT 回复时 RLS 校验：当前用户未封禁 + 父评论作者未封禁
--
-- 配套文件（可在本文件之后单独执行，也可把内容合并到本文件末尾一起粘贴）：
--   - migration-v11.1-comment-replies-index.sql
--     （已改为普通 CREATE INDEX，与 v11 合并粘贴无事务冲突）
--
-- 设计决策：
--   - ON DELETE SET NULL：删父评论时回复保留、parent_id 置 NULL
--     （参考小红书/抖音「原评论已删除」占位语义；如要改为 CASCADE
--      把下面的 SET NULL 换成 CASCADE 即可）
--   - 一级嵌套：trg_check_one_level_reply 触发器校验 parent.parent_id IS NULL
--   - 触发器覆盖 INSERT / UPDATE / DELETE，含 parent_id 移动场景
-- =============================================

-- 1. 新增列（幂等）
ALTER TABLE comments ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES comments(id) ON DELETE SET NULL;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS reply_count INT NOT NULL DEFAULT 0;

-- 2. 约束：禁止自引用（幂等，先 DROP 再 ADD）
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_no_self_ref;
ALTER TABLE comments ADD CONSTRAINT comments_no_self_ref
  CHECK (parent_id IS DISTINCT FROM id);

-- 3. 一级嵌套校验函数 + 触发器
CREATE OR REPLACE FUNCTION check_one_level_reply() RETURNS trigger AS $$
BEGIN
  IF NEW.parent_id IS NOT NULL THEN
    IF (SELECT parent_id FROM comments WHERE id = NEW.parent_id) IS NOT NULL THEN
      RAISE EXCEPTION '仅支持一级嵌套：不能回复一个回复';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_one_level_reply ON comments;
CREATE TRIGGER trg_check_one_level_reply
  BEFORE INSERT OR UPDATE OF parent_id ON comments
  FOR EACH ROW EXECUTE FUNCTION check_one_level_reply();

-- 4. reply_count 自动维护触发器（SECURITY DEFINER 与项目其他 RPC 一致）
CREATE OR REPLACE FUNCTION update_comment_reply_count() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.parent_id IS NOT NULL THEN
    UPDATE comments SET reply_count = reply_count + 1 WHERE id = NEW.parent_id;
  ELSIF TG_OP = 'DELETE' AND OLD.parent_id IS NOT NULL THEN
    UPDATE comments SET reply_count = reply_count - 1 WHERE id = OLD.parent_id;
  ELSIF TG_OP = 'UPDATE' AND (OLD.parent_id IS DISTINCT FROM NEW.parent_id) THEN
    IF OLD.parent_id IS NOT NULL THEN
      UPDATE comments SET reply_count = reply_count - 1 WHERE id = OLD.parent_id;
    END IF;
    IF NEW.parent_id IS NOT NULL THEN
      UPDATE comments SET reply_count = reply_count + 1 WHERE id = NEW.parent_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_comment_reply_count ON comments;
CREATE TRIGGER trg_comment_reply_count
  AFTER INSERT OR UPDATE OF parent_id OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_comment_reply_count();

-- 5. 历史数据兜底（确保 reply_count 与实际回复数一致）
UPDATE comments c
   SET reply_count = sub.cnt
  FROM (SELECT parent_id, COUNT(*) AS cnt
          FROM comments
         WHERE parent_id IS NOT NULL
         GROUP BY parent_id) sub
 WHERE c.id = sub.parent_id
   AND c.reply_count <> sub.cnt;

-- 6. 评论 / 回复权限 RLS（替代原 comments_insert_auth）
--
-- 设计语义：
--   - INSERT 评论（parent_id IS NULL）：当前用户未封禁即可
--   - INSERT 回复（parent_id IS NOT NULL）：当前用户未封禁 + 父评论作者未封禁
--   - SELECT / DELETE 沿用父表既有策略（comments_select_all / comments_delete_own）
--
-- 实现要点：
--   - DROP 原 comments_insert_auth（仅校验 auth.uid() = user_id，未拦 BANNED）
--   - is_comment_parent_author_banned 必须 SECURITY DEFINER，
--     因为普通 RLS 无法绕过 profiles 表的 RLS 读取 status
--   - parent_id IS NULL 时 OR 短路，不触发 SECURITY DEFINER 查询，性能无损

CREATE OR REPLACE FUNCTION is_comment_parent_author_banned(p_parent_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
      FROM comments c
      JOIN profiles p ON p.id = c.user_id
     WHERE c.id = p_parent_id
       AND p.status = 1              -- USER_STATUS.BANNED
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- 替代原 comments_insert_auth（其只校验 user_id 归属，未拦 BANNED）
DROP POLICY IF EXISTS comments_insert_auth ON comments;
DROP POLICY IF EXISTS comments_insert ON comments;
CREATE POLICY comments_insert ON comments
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND NOT EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND status = 1
    )
    AND (
      parent_id IS NULL
      OR NOT is_comment_parent_author_banned(parent_id)
    )
  );

-- 7. 统计刷新（让查询计划器立即看到新列统计）
ANALYZE comments;
ANALYZE profiles;
