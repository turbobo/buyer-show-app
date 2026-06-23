# 买家说 — 项目代码规范

> 本文件是项目级强制规范，所有代码生成和修改必须遵守。
> 完整规范详见：`UI设计规范文档.md`、`技术开发规范.md`、`技术方案文档.md`

---

## 项目概述

「买家说」是购物种草社区 H5 应用，Next.js 14 + React 18 + TypeScript + Tailwind CSS + Framer Motion + Zustand + Supabase，部署到 EdgeOne Pages。

## 技术栈约束

- 框架：Next.js 14 (App Router)，静态导出 `output: 'export'`
- 语言：TypeScript 5.4，**strict 模式**
- 样式：Tailwind CSS 3.4，**禁止独立 CSS 文件**，全部用 Tailwind 类
- 动画：Framer Motion 11
- 状态：Zustand 4（全局 store ≤ 3 个）
- 后端：Supabase（PostgreSQL + Auth + Storage）
- Node：20.18.0
- 包管理：npm

---

## 目录结构

```
src/
├── app/              # Next.js 页面（每功能最多 page.tsx + client.tsx + loading.tsx + error.tsx）
├── components/
│   ├── ui/           # 原子组件（Button, Input, Modal, Toast, EmptyState）
│   ├── layout/       # 布局组件（TabBar, TopNav）
│   └── [feature]/    # 业务组件（PostCard, CommentList, ImageUploader）
├── hooks/            # 自定义 Hooks（usePosts, useLike）
├── lib/              # 工具函数 + 第三方封装（supabase.ts, utils.ts, constants.ts）
├── services/         # API 请求层（post.ts, comment.ts, user.ts, auth.ts）
├── store/            # Zustand store（user.ts, ui.ts）
└── types/            # TypeScript 类型定义
```

**强制规则**：
- 禁止在 `components/` 下放页面级组件
- 禁止在 `app/` 下放可复用组件
- 单文件不超过 **300 行**
- 组件内禁止直接调用 `supabase.from()`，必须通过 `services/` 层

---

## 命名规范

| 类型 | 规则 | 示例 |
|------|------|------|
| 组件文件 | PascalCase | `PostCard.tsx` |
| Hook 文件 | camelCase + use | `usePosts.ts` |
| 工具文件 | camelCase | `formatTime.ts` |
| 组件 | PascalCase | `PostCard`, `ImageUploader` |
| 函数/变量 | camelCase | `fetchPosts`, `activeTag` |
| 常量 | UPPER_SNAKE_CASE | `MAX_IMAGES`, `PAGE_SIZE` |
| 类型/接口 | PascalCase | `Post`, `UserProfile` |
| 事件处理 | handle + 动作 | `handleSubmit`, `handleLike` |
| 布尔变量 | is/has/can/should | `isLoading`, `hasMore` |

**禁止**：单字母变量（循环 i 除外）、拼音命名、`data1`/`temp`/`info` 等无意义名称。

---

## TypeScript 规范

- `strict: true` + `noUncheckedIndexedAccess: true`
- 数据模型用 `interface`，联合类型用 `type`
- **禁止 `enum` 关键字**，用 `const` 对象 + type 替代
- **禁止 `any`**，用 `unknown` + 类型守卫
- **禁止 `@ts-ignore`**，用可选链 `?.` + 空值合并 `??`
- **禁止非空断言 `!`**，用条件判断
- Props 用 `interface Props`，超过 5 个 props 必须分组封装
- API 响应统一用 `interface ApiResponse<T> { code: number; data: T }`
- 分页用 `interface PaginatedResponse<T> { list: T[]; total: number; hasMore: boolean }`

---

## 组件设计

- **默认 Server Component**，仅在需要 `useState`/`useEffect`/事件处理/动画时加 `'use client'`
- 动态路由页面（`/post/[id]`）拆分为 `page.tsx`（Server，含 `generateStaticParams`）+ `client.tsx`（Client）
- 组件内部顺序：类型定义 → 动画 variants → Hooks → 事件处理 → 派生数据 → JSX
- JSX 超过 **80 行**必须拆子组件
- 同一逻辑出现 **2 次**抽 Hook，同一 UI 出现 **3 次**抽原子组件
- Props > **7 个**必须拆分子组件

---

## 状态管理

| 状态类型 | 存储 | 工具 |
|----------|------|------|
| UI 临时状态（输入框、展开/折叠） | 组件内 | `useState` |
| 表单状态 | 组件内 | `useState` / `useReducer` |
| 服务端数据 | Server Component / SWR | Next.js fetch |
| 全局用户态 | Zustand | `useUserStore` |
| 全局 UI 态（Toast/Modal/Sheet） | Zustand | `useUIStore` |
| URL 参数 | URL | `useSearchParams` |
| 持久化（搜索历史、偏好） | localStorage | 自定义 Hook |

- Store 内**禁止异步操作**，异步放 `services/`
- 精确订阅：`useUserStore((s) => s.user)`，禁止 `useUserStore()` 全量订阅

---

## 设计系统 Token

| Token | 值 | Tailwind | 用途 |
|-------|-----|----------|------|
| 品牌主色 | `#FF6B35` | `coral-500` | CTA、选中态 |
| 页面背景 | `#FAF7F5` | `warm-50` | 全局底色 |
| 卡片背景 | `#FFFFFF` | `white` | 卡片、弹窗 |
| 正文色 | `#1F2937` | `gray-800` | 标题 |
| 辅助色 | `#6B7280` | `gray-500` | 描述 |
| 成功 | `#10B981` | `emerald-500` | 操作成功 |
| 警告 | `#F59E0B` | `amber-500` | 评分星级 |
| 错误 | `#EF4444` | `red-500` | 校验错误 |

- 圆角：sm=8px, md=12px, lg=16px, xl=24px, full=9999px
- 阴影：sm=卡片, md=悬浮, lg=弹窗
- 间距基数 4px，所有间距为 4 的倍数

---

## 响应式规则

| 断点 | 范围 | Tailwind | 布局 |
|------|------|----------|------|
| 手机 | < 768px | 默认 | 底部 TabBar，双列瀑布流 |
| 平板 | ≥ 768px | `md:` | 顶部导航栏，3 列 |
| 桌面 | ≥ 1024px | `lg:` | 4 列 |
| 大屏 | ≥ 1280px | `xl:` | 5 列 |

- 移动端 `max-w-[430px]` 居中，PC 端 `md:max-w-3xl lg:max-w-5xl xl:max-w-6xl`
- 移动端底部 TabBar（`md:hidden`），PC 端顶部导航栏（`hidden md:flex`）

---

## 动效规范

- 微交互 150~300ms，页面转场 300~500ms
- 交互缓动用 `ease-out`，弹跳用 `spring`
- 同一屏幕不超过 2 种同时进行的动画
- `prefers-reduced-motion: reduce` 时关闭非必要动画
- 列表入场：`fadeInUp` stagger 60ms
- 点赞心跳：`scale [1, 1.4, 0.9, 1.2, 1]` 600ms
- 骨架屏：shimmer 1.5s infinite
- 卡片按压：`whileTap={{ scale: 0.96 }}`

---

## 全局交互状态（必须使用统一组件）

- **Toast**：全局单例，顶部滑入，success=绿/error=红/info=灰，自动消失
- **确认弹窗 Modal**：危险操作二次确认，遮罩 `black/50`，双按钮
- **空状态 EmptyState**：统一组件 `<EmptyState icon title description action />`
- **骨架屏 Skeleton**：shimmer 动画，还原目标布局结构
- **下拉刷新**：触发阈值 60px，珊瑚红旋转圈，超时 10s

---

## 图片策略

- 上传压缩：长边 ≤ 2048px，质量 85%，目标 < 500KB，转 WebP
- 存储路径：`posts/{userId}/{timestamp}-{random}.webp`
- 瀑布流封面：`loading="lazy"` + `object-cover`
- 详情页首图：`loading="eager"`
- 全屏预览：`black/95` 背景，snap 滑动，圆点指示器
- 加载失败：统一占位图 + "图片加载失败"

---

## API 层规范

- 请求函数统一放 `services/`，按领域拆分（post.ts, comment.ts, user.ts, auth.ts）
- 命名：动词 + 名词（`fetchPosts`, `createPost`, `toggleLike`）
- 错误：自定义 `ApiError` 类，含 `code` + `message` + `userMessage`
- **组件内禁止直接调 `supabase.from()`**
- **`services/` 内禁止操作 UI**（如弹 Toast）
- 调用方统一 try/catch，catch 中弹 Toast 显示 `error.userMessage`

---

## 安全规范

- 禁止 `dangerouslySetInnerHTML`，用户富文本用 DOMPurify
- 用户输入必须前端校验 + 后端校验双重保障
- 环境变量：`NEXT_PUBLIC_` 前缀可暴露，无前缀仅服务端
- 禁止硬编码 API Key、密码、Token
- 文件上传校验 MIME type + 大小（≤ 10MB）
- 使用 Supabase SDK 参数化查询，禁止拼接 SQL

---

## 性能规则

- 首屏 JS < 150KB (gzip)，单路由 < 50KB
- 图片必须 `loading="lazy"`（首屏首图除外）
- 禁止引入整个 lodash / moment.js，用按需引入
- 搜索防抖 300ms，滚动节流 100ms
- 列表超 50 条用虚拟滚动
- `useMemo` / `useCallback` 仅用于复杂计算，不要滥用
- 禁止在渲染函数内创建对象/函数

---

## 无障碍

- 图标按钮必须有 `aria-label`
- 图片必须有 `alt` 文字
- 表单 `<label>` 关联 `<input>`
- 触控目标最小 44×44px
- 颜色对比度 ≥ 4.5:1

---

## Git 规范

- 分支：`main`(生产) / `dev`(集成) / `feature/*` / `fix/*` / `hotfix/*`
- Commit：Conventional Commits — `feat(scope): 描述` / `fix(scope): 描述`
- subject 不超过 50 字，使用中文，每次 commit 只做一件事
- 禁止 `update`、`fix bug`、`修改` 等无意义 message
- PR 不超过 500 行 diff，必须附截图（UI 变更时）

---

## Code Review 检查项

每次修改代码时自查：

1. 命名是否符合规范
2. 单文件是否超过 300 行
3. 是否有 `any` / `@ts-ignore` / `console.log`
4. 图片是否有 `loading="lazy"`
5. 列表 `key` 是否唯一（禁止 index 作 key，除非列表不变）
6. 用户输入是否已校验
7. 图标按钮是否有 `aria-label`
8. 手机端和 PC 端是否都正常显示
9. 错误是否已处理（不吞错误）
10. 是否有重复代码（DRY）

---

## 文档同步规则

继承自上层 `MyApp/AGENTS.md` 的「文档同步规则（强制）」，对本项目同样生效。本项目使用的两份文档为根目录的 `技术方案文档.md` 与 `产品设计文档.md`。
