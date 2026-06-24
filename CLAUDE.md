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
- 禁止在查询中写状态字符串字面量，必须用常量（如 `POST_STATUS.ACTIVE`）

### 安全
- 禁止 `dangerouslySetInnerHTML`
- 禁止硬编码 API Key / 密码 / Token
- 用户输入必须前端校验 + 后端校验
- 生产代码禁止 `console.log`（允许 `console.error('[scope]', err)`）

### 性能
- 图片 `loading="lazy"`（首屏首图除外用 `eager`）
- 搜索防抖 300ms，滚动节流 100ms
- 禁止引入整个 lodash / moment.js
- 列表 `key` 禁止用 index（除非列表不变）

### 无障碍
- 图标按钮必须 `aria-label`
- 图片必须 `alt`
- 触控目标最小 44×44px

### 动效
- 微交互 150~300ms，页面转场 300~500ms
- `prefers-reduced-motion: reduce` 时关闭非必要动画
- 动画 variants 集中定义在 `src/lib/animations.ts`

## Git Commit

Conventional Commits 格式，中文描述，subject ≤ 50 字：
```
feat(scope): 描述
fix(scope): 描述
refactor(scope): 描述
```

## 文档同步规则

修改代码后，如涉及以下变更必须同步更新对应文档：
- 新增/删除页面或组件 → 更新 `产品设计文档.md`
- 修改设计 Token 或组件样式 → 更新 `UI设计规范文档.md`
- 修改架构规范或工程约定 → 更新 `技术开发规范.md`
