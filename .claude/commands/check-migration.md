# 校验 SQL 迁移脚本（buyer-show 项目专属）

校验新增或修改的 `supabase/migration-vN-xxx.sql` 是否符合项目规范。

## 输入

- 必需参数 `$ARGUMENTS`：迁移脚本文件名（如 `migration-v11-xxx.sql`）

## 检查项

### 1. 命名规范
- 文件名必须匹配 `migration-vN-xxx.sql`（N 为整数，xxx 为 kebab-case 描述）
- N 必须 = 当前最新版本 + 1（扫描 `supabase/migration-v*.sql` 找最大 N）
- 描述部分应概括本次改动（如 `fix-unban-restore-posts` / `rebuild-posts-indexes`）

### 2. 文件头注释
文件开头必须包含以下注释块：
```sql
-- =============================================
-- 买家说 — 增量迁移 vN：标题
-- 执行方式：Supabase Dashboard → SQL Editor → 整段粘贴
-- 前置依赖：必须先跑过 migration-vX-xxx.sql / ...
-- 
-- 修复/新增内容概述：
--   - 第 1 项
--   - 第 2 项
-- =============================================
```

### 3. DROP 顺序安全（PG 2BP01 规避）
- 每个 `DROP COLUMN` 前必须找到所有依赖（`DROP POLICY` / `DROP INDEX` / `DROP CONSTRAINT` / `DROP FUNCTION`）
- 每个 `DROP FUNCTION` 前必须 DROP 所有引用它的 RLS 策略（**含跨表**，如 `tags_admin_all` 引用 `is_admin`）
- 推荐做法：先集中 DROP 所有依赖，再 DROP 目标列/函数

### 4. 索引创建
- `CREATE INDEX` 必须用 `IF NOT EXISTS`
- 优先用 `CREATE INDEX CONCURRENTLY`（避免锁表）
- **注意同名冲突**：如果 v1 已建同名单列索引，新迁移必须先 `DROP INDEX IF EXISTS` 再 `CREATE INDEX`（`IF NOT EXISTS` 只检查名不检查定义）
- 业务查询 95%+ 命中特定状态（如 `status=0`）时，优先用 partial index：`WHERE status = 0`

### 5. SMALLINT 状态字段
- 新增 status/role/flag 字段必须用 `SMALLINT` + 默认值
- 禁止 `TEXT + CHECK IN ('a','b','c')` 模式
- 如新增字段必须同步：
  - `src/lib/constants.ts` 加常量（`as const` 对象 + Value type + LABEL Record）
  - `src/types/index.ts` 加类型注解（`/** 说明（0=X / 1=Y） */`）
  - 前端 service/page 全量换常量

### 6. SECURITY DEFINER 函数
- 必须 `is_admin(auth.uid())` 校验 caller
- 禁止自我操作（`caller = target_uid` 必须 raise）
- 必须有 `has_any_admin()` 自举路径（首次部署用）
- 函数体里的字符串字面量必须随字段类型同步改为整数

### 7. 历史数据补丁
- 如果本次迁移会改字段语义（如 TEXT → SMALLINT），必须为已存在的行提供数据补丁
- 用 `UPDATE ... WHERE xxx IS NULL` 形式，避免覆盖后续数据

### 8. 末尾 ANALYZE
- 涉及大量数据改动 / 新建索引的迁移，末尾加 `ANALYZE table_name;`

### 9. 文档同步
检查是否已同步：
- `技术方案文档.md` §7.N 加章节
- `产品设计文档.md` 进度条 / 已完成清单
- `supabase/` 目录注释（项目根 README 或 `技术方案文档.md` 顶部 `supabase/` 行）版本范围是否更新

## 输出

```
## Migration 校验报告：migration-vN-xxx.sql

### 命名规范      [✅/❌]
### 文件头注释    [✅/❌]
### DROP 顺序     [✅/❌] （列出每处 DROP 及其前置依赖）
### 索引创建      [✅/❌]
### SMALLINT 字段 [✅/❌]
### RPC 函数      [✅/❌]
### 数据补丁      [✅/❌]
### ANALYZE       [✅/❌]
### 文档同步      [✅/❌]

### 发现的问题
（按 🔴 严重 / 🟡 警告 / 🟢 提示 分类）

### 修复建议
（给出可直接复制的 patch）
```
