# 自动代码审核（对应 Qoder ~/.qoder/rules/pre-commit-review.md）

在 commit 之前对当前变更执行全面审核。**必须在 `git add` 之前运行**。

## 步骤

1. 运行 `git --no-pager diff` + `git --no-pager diff --cached` 查看所有待提交变更
2. 运行 `git --no-pager log --oneline -5` 查看近期 commit 风格
3. 按以下检查项逐项审核，**对每个变更文件输出具体行号**：

### 强制规则（违反必须修复）
- **命名规范**：组件大驼峰 / 函数变量小驼峰 / 常量全大写
- **单文件 ≤ 300 行 / JSX ≤ 80 行**（超过必须拆子组件或抽 Hook）
- **TypeScript 严格**：无 `any` / `@ts-ignore` / `!` 非空断言 / `enum` 关键字
- **单字母变量禁用**（循环 `i` 除外），包括 `.map((x) => ...)` 回调参数
- **数据库 SMALLINT**：`src/services/*` / `src/app/*` / `src/hooks/*` 中 `posts.status` / `profiles.role` / `profiles.status` / `tags.status` 的查询/写入必须用 `POST_STATUS` / `USER_ROLE` / `USER_STATUS` / `TAG_STATUS` 常量，禁止字符串字面量
- **Service 层约束**：组件内禁止直接调 `supabase.from()`，必须走 `services/` 层
- **Store 精确订阅**：`useUserStore((s) => s.xxx)`，禁止全量订阅
- **图片 `loading="lazy"`**：除首屏首图外所有 `<img>` 必须有 `loading` 属性
- **图标按钮 `aria-label`**：所有 icon-only button 必须有
- **错误不吞**：禁止 `.catch(() => {})` 静默吞错，必须 Toast 上报
- **响应式 max-width 链**：PC 端容器必须用 `max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto`

### 智能审核（深度分析）
- **逻辑缺陷**：空指针 / 数组越界 / 并发竞争 / 资源未关闭
- **性能隐患**：N+1 查询 / 循环内重复查 DB / 大对象频繁创建 / 渲染函数内创建对象
- **安全漏洞**：XSS / 硬编码密钥 / 敏感信息打印
- **代码坏味道**：过长方法（> 100 行）/ 过深嵌套（> 3 层）/ 重复代码块
- **边界场景**：集合为空 / 超时 / 重试 / 网络断开

### 文档同步检查
- 是否需要同步 `技术方案文档.md`（架构/DB/RPC 变更）
- 是否需要同步 `产品设计文档.md`（用户可感知功能变更）
- 是否需要同步 `UI设计规范文档.md`（设计 Token / 组件样式变更）

4. **输出结论**：
   - 全通过：`✅ 规则检查通过 + ✅ AI 审核通过 + ✅ 文档同步检查通过`，可继续 commit
   - 有问题：按严重程度分 3 类输出（🔴 必须修 / 🟡 建议修 / 🟢 提示），并给出具体修复代码片段
