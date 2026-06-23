-- =============================================
-- 买家说 — v3 迁移：账户管理增强
-- 执行方式：Supabase Dashboard → SQL Editor → 粘贴执行
--
-- 内容：
-- 1. profiles.nickname 加唯一性约束（含历史去重）
-- 2. 备注：账号注销目前在客户端做软删除（隐藏帖子 + 占位昵称 + 登出会话）。
--    真正销毁 auth.users 需要 service_role，建议放 Edge Function。
-- =============================================

-- ─── 1. profiles.nickname 唯一约束 ───
-- 历史数据可能存在重名，先把重复昵称重命名为 "<昵称>_<id 前 6 位>"，避免约束创建失败。
WITH dups AS (
  SELECT
    id,
    nickname,
    ROW_NUMBER() OVER (PARTITION BY nickname ORDER BY created_at) AS rn
  FROM profiles
  WHERE nickname <> ''
)
UPDATE profiles p
SET nickname = p.nickname || '_' || LEFT(p.id::TEXT, 6),
    updated_at = NOW()
FROM dups
WHERE p.id = dups.id
  AND dups.rn > 1;

-- 大小写不敏感的唯一索引（'Alice' 和 'alice' 视为同一个）
CREATE UNIQUE INDEX IF NOT EXISTS profiles_nickname_unique
  ON profiles ((LOWER(nickname)))
  WHERE nickname <> '';

-- ─── 2. 注销说明（无 SQL，仅留记录） ───
-- 客户端 deleteAccount() 流程：
--   posts.status = 'deleted'
--   profiles.nickname = '已注销用户_<6位>', avatar_url = '', bio = ''
--   auth.signOut()
-- 后续可在 Edge Function 中调 admin API 真正删除 auth.users 行（CASCADE 会清光所有从属数据）。
