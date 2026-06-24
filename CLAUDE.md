# 买家说 — Claude Code 项目规范

> **所有代码生成和修改必须遵守本文件及以下三份规范文档**：
> - `UI设计规范文档.md` — 色彩、字体、间距、组件样式、动效、响应式
> - `技术开发规范.md` — 目录结构、TS 规范、API 层、错误处理、安全、性能
> - `产品设计文档.md` — 功能列表、数据库表结构、待办事项
>
> 编写代码前，先读取相关规范文档确认具体规则。

---

## 技术栈（锁定版本）

- Next.js 14 (App Router)，静态导出 `output: 'export'`
- TypeScript 5.4，**strict 模式**
- Tailwind CSS 3.4，**禁止独立 CSS 文件**
- Framer Motion 11（动画）
- Zustand 4（全局 store ≤ 3 个）
- Supabase（PostgreSQL + Auth + Storage）
- Node 20.18.0 / npm

## 目录结构

```
src/
├── app/           # 页面（page.tsx + client.tsx + loading.tsx + error.tsx）
├── components/
│   ├── ui/        # 原子组件（Toast, Modal, EmptyState, SmartImage）
│   ├── layout/    # 布局组件（TabBar, TopNav）
│   └── [feature]/ # 业务组件
├── hooks/         # 自定义 Hooks（use 前缀）
├── lib/           # 工具函数 + 第三方封装（supabase.ts, constants.ts）
├── services/      # API 请求层（按领域拆分）
├── store/         # Zustand store（user.ts, ui.ts）
└── types/         # TypeScript 类型定义
```

## 强制规则（每次编码必查）

### 架构
- 禁止在 `components/` 放页面级组件，禁止在 `app/` 放可复用组件
- 组件内禁止直接调用 `supabase.from()`，必须通过 `services/` 层
- `services/` 内禁止操作 UI（如弹 Toast），UI 由调用方处理
- Store 内禁止异步操作，异步放 `services/`
- 精确订阅 store：`useUserStore((s) => s.user)`，禁止全量订阅

### TypeScript
- 禁止 `any`（用 `unknown` + 类型守卫）
- 禁止 `@ts-ignore`（用 `?.` + `??`）
- 禁止非空断言 `!`（用条件判断）
- 禁止 `enum` 关键字（用 `as const` 对象 + type）
- 数据模型用 `interface`，联合类型用 `type`

### 错误处理
- services 层只抛 `ApiError`（`src/lib/api-error.ts`），错误码来自 `src/lib/error-codes.ts`
- 调用方 try/catch → `ApiError.is(err)` 判断 → Toast 显示 `err.userMessage`
- 禁止抛字符串或裸 `Error`，禁止吞错误，禁止把 Supabase 原始 error 展示给用户

### 样式（参考 UI设计规范文档.md）
- 全部使用 Tailwind 类，禁止独立 CSS 文件
- 品牌主色 `coral-500`(#FF6B35)，页面背景 `warm-50`(#FAF7F5)
- 间距基数 4px，圆角 sm=8/md=12/lg=16/xl=24/full
- 移动端优先，断点：默认(<768) / md:(≥768) / lg:(≥1024) / xl:(≥1280)

### 组件设计
- 默认 Server Component，仅需交互时加 `'use client'`
- 组件内部顺序：类型定义 → 动画 variants → Hooks → 事件处理 → 派生数据 → JSX
- 单文件不超过 **300 行**，JSX 超过 **80 行**拆子组件
- 事件处理函数用 `handle` 前缀，布尔变量用 `is/has/can/should` 前缀

### 数据库状态枚举
- 状态字段用 `SMALLINT`，语义由 `src/lib/constants.ts` 的 `as const` 对象维护
- 已落地常量：`POST_STATUS` / `USER_ROLE` / `USER_STATUS` / `TAG_STATUS`
- 禁止在查询中写状态字符串字面量，必须用常量（如 `POST_STATUS.ACTIVE`）

### Supabase 迁移脚本
- 命名：`supabase/migration-vN-xxx.sql`（N 递增，当前到 v10）
- 每加一版必须同步：`技术方案文档.md` §7.N 加章节 + `产品设计文档.md` 进度条
- 迁移五步法：加临时列 → 数据迁移 → DROP POLICY/INDEX/CONSTRAINT → DROP 旧列 + RENAME → 重建
- **DROP 列/函数前必须先用 `\d+` 列出所有依赖，集中 DROP 完再 DROP 目标**（否则 PG 报 2BP01）
- `DROP FUNCTION` 前必须先 DROP 所有引用它的 RLS 策略（含跨表，如 `tags_admin_all` 引用 `is_admin`）
- `CREATE INDEX CONCURRENTLY IF NOT EXISTS` 只检查索引名不检查定义，多版本同名单列 vs 复合索引会被静默跳过 → 先 DROP 再重建

### 响应式 max-width 链（PC 端容器必须复用，否则宽屏失衡）
```
max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto
```
已应用：`TopNav` / `ProfileHeader` / `ProfilePage`；新增 PC 端容器必须保持一致。

### Tailwind grid + divide 分割线
列分割时**外层禁止用全局 `p-*`**（会让分割线被截断），改为每个 cell 用 `py-*` 垂直内边距 + 外层 `overflow-hidden`，分割线才能从头贯穿到尾。

### 单文件行数
- 单文件 ≤ **300 行**（超过必须拆分）
- JSX ≤ **80 行**（超过必须抽子组件）

### 单字母变量
禁止（循环 `i` 除外），包括 `.map((x) => ...)` 中的回调参数。

## Git Commit

Conventional Commits 格式，中文描述，subject ≤ 50 字：
```
feat(scope): 描述
fix(scope): 描述
refactor(scope): 描述
perf(scope): 描述
docs(scope): 描述
chore(scope): 描述
```
**每次 commit 只做一件事**，按功能拆分多次 commit 时文档更新归入对应那次 feat/fix commit，不要单独凑「docs: 更新文档」。

## 文档同步规则（强制）

继承自 `MyApp/AGENTS.md`，对本项目同样生效：

| 改动类别 | 目标文档 |
|---|---|
| 架构调整、技术选型、模块分层、DB schema、索引、RLS、RPC、关键代码设计 | `技术方案文档.md` |
| 新增/修改/删除用户可感知功能（页面、交互、按钮、流程）、待办项状态变更 | `产品设计文档.md` |
| UI 设计 Token、组件样式、动效 | `UI设计规范文档.md` |

- 文档变更与代码变更**同一次 commit 内**完成
- 待办项完成时从「待办」段移到「已完成」段（或勾选 `[x]`），不要静默删除
- 不要在文档中粘贴整段代码 diff —— 总结设计决策、关键字段/接口签名即可

## 工作流速查

### 新增功能
1. 读 `产品设计文档.md` 确认功能定位
2. 读 `UI设计规范文档.md` 确认视觉规范
3. 如需改 DB：写 `supabase/migration-vN-xxx.sql`
4. 实现：`services/` → `hooks/` → `components/` → `app/*/page.tsx`
5. 同步文档（技术方案 §7.N + 产品设计进度条）
6. 验证：`npx tsc --noEmit` + `npm run lint` 必须 exit 0
7. Commit：`feat(scope): 描述`

### 修复 Bug
1. 定位根因（先 grep 确认相关代码位置）
2. 修复：优先在 `services/` 层修复（组件层不改 DB 逻辑）
3. 同步文档（技术方案 §7.N + 产品设计已完成清单）
4. 验证：tsc + lint
5. Commit：`fix(scope): 描述`

### DB 索引优化
1. 盘点 `supabase/*.sql` 全部 `CREATE INDEX`
2. 比对 `src/services/*.ts` 实际查询模式
3. 写新 migration（用 `CREATE INDEX CONCURRENTLY IF NOT EXISTS`）
4. **注意同名冲突**：先 DROP 旧名再重建
5. 同步 `技术方案文档.md` §7.N

## 已知陷阱

| 陷阱 | 规避 |
|---|---|
| `IF NOT EXISTS` 索引同名冲突 | 先 `DROP INDEX IF EXISTS` 再 `CREATE INDEX` |
| `DROP COLUMN` 报 2BP01 | 先用 `\d+` 列出依赖，集中 DROP |
| `UNIQUE(a,b)` 自带 backing index | 不再建 `(a)` 单列索引 |
| `grid + divide-x + p-*` 分割线被截断 | cell 用 `py-*` + 外层 `overflow-hidden` |
| `useSearchParams` hydration | 包在 `<Suspense>` 内 |
| `Math.random()` hydration mismatch | 用固定数组 index 替代 |
| `CREATE INDEX CONCURRENTLY` 在 Supabase SQL Editor 整段粘贴报 25001 | SQL Editor 对所有输入都包事务，CONCURRENTLY 必死。改用普通 `CREATE INDEX`（小表锁表可忽略）；大表用 `psql -c` 跑 |

## 安全

- 禁止 `dangerouslySetInnerHTML`（JSON-LD 等少数场景除外，需用 `JSON.stringify` 安全序列化）
- 禁止硬编码 API Key / 密码 / Token
- 用户输入必须前端校验 + 后端校验
- 生产代码禁止 `console.log`（允许 `console.error('[scope]', err)`）

## 性能

- 图片 `loading="lazy"`（首屏首图除外用 `eager`）
- 搜索防抖 300ms，滚动节流 100ms
- 禁止引入整个 lodash / moment.js
- 列表 `key` 禁止用 index（除非列表不变）

## 无障碍

- 图标按钮必须 `aria-label`
- 图片必须 `alt`
- 触控目标最小 44×44px

## 动效

- 微交互 150~300ms，页面转场 300~500ms
- `prefers-reduced-motion: reduce` 时关闭非必要动画
- 动画 variants 集中定义在 `src/lib/animations.ts`

