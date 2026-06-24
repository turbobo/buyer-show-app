# 一键 commit（含验证 + 文档同步检查）

一键完成 commit 前验证 + 文档同步检查 + Conventional Commits 提交。

## 步骤

### 1. 验证（必须全通过才继续）
```bash
npx tsc --noEmit
npm run lint
```
任一失败 → 输出错误并停止，等待用户修复。

### 2. 检查变更范围
```bash
git --no-pager status --short
git --no-pager diff --stat
```

### 3. 文档同步检查
按 `MyApp/AGENTS.md` 文档同步规则判断是否需要更新：
- 改动涉及架构/DB/RPC → `技术方案文档.md`
- 改动涉及用户可感知功能 → `产品设计文档.md`
- 改动涉及设计 Token/组件样式 → `UI设计规范文档.md`

如文档未同步：
- 列出需要更新的文档 + 具体章节
- **询问用户**：「是否自动同步文档后一起 commit？还是仅 commit 代码？」
- 如用户同意自动同步：按模板生成章节 patch 并写入文档

### 4. 确定 commit 类型和 scope
根据改动文件推断：
- 新增功能：`feat`
- 修复 Bug：`fix`
- 重构：`refactor`
- 性能优化：`perf`
- 文档：`docs`
- 工具链/配置：`chore`

scope 从改动文件提取：
- 改 `src/services/post.ts` → `post`
- 改 `src/app/profile/*` → `profile`
- 改 `supabase/migration-vN-*.sql` → `db`
- 改 `src/components/admin/*` → `admin`
- 跨多个领域 → 用最大的领域或 `misc`

### 5. 生成 commit message
格式：`<type>(<scope>): <中文 subject>`

约束：
- subject ≤ 50 字
- 中文描述（参考最近 5 次 commit 风格）
- **每次 commit 只做一件事**

### 6. 询问用户确认
输出预览：
```
## 即将提交

**commit message**: feat(profile): 个人页 PC 端对齐优化

**变更文件** (12 个):
  src/app/profile/page.tsx
  src/components/profile/ProfileMenu.tsx
  ...
  产品设计文档.md  [自动同步]
  技术方案文档.md  [自动同步]

**验证结果**:
  ✅ tsc --noEmit exit 0
  ✅ npm run lint 无新增 warning
  ✅ 文档同步检查通过

确认提交？[Y/n]
```

### 7. 执行 commit
```bash
git add -A
git commit -m "feat(profile): 个人页 PC 端对齐优化"
```

### 8. 询问是否 push
commit 成功后询问：「是否 push 到 origin？[y/N]」
- 默认不 push（避免误操作）
- 用户同意才执行 `git push`

## 禁止事项

- 禁止自动 push（必须询问）
- 禁止 `--no-verify` 跳过 hook
- 禁止 `--force` push
- 禁止 `git add .`（必须显式列出文件，避免误提 `.env.local` 等敏感文件）
