# 文档同步检查（对应 Qoder MyApp/AGENTS.md 强制规则）

检查当前代码变更是否需要同步更新三份中文文档，并自动生成同步 patch。

## 输入

- 可选参数 `$ARGUMENTS`：指定 commit 范围（默认用 `git diff HEAD~1` 检查最近一次 commit）

## 步骤

1. **获取变更文件列表**：
   ```bash
   git --no-pager diff --name-only $ARGUMENTS
   ```

2. **按改动类别判断目标文档**（参考 MyApp/AGENTS.md 文档同步规则）：

   | 改动文件 | 判断条件 | 目标文档 |
   |---|---|---|
   | `supabase/migration-vN-*.sql` | 任何 migration 脚本 | `技术方案文档.md` §7.N 加章节 |
   | `src/services/*.ts` | 新增/修改 API 契约 | `技术方案文档.md` §7.N |
   | `src/hooks/*.ts` | 关键代码设计（状态管理/路由约定） | `技术方案文档.md` §7.N |
   | `src/lib/constants.ts` | DB 状态枚举定义 | `技术方案文档.md` §11.4 |
   | `src/app/*/page.tsx` / `client.tsx` | 新增/修改用户可感知页面 | `产品设计文档.md` 已完成清单 |
   | `src/components/*` | 新增/修改组件交互 | `产品设计文档.md` |
   | `tailwind.config.ts` / `UI设计规范文档.md` 引用处 | 设计 Token 变更 | `UI设计规范文档.md` |
   | `AGENTS.md` / `CLAUDE.md` | 架构规范变更 | `技术开发规范.md` |

3. **对每个目标文档检查当前是否已更新**：
   ```bash
   git --no-pager diff --name-only $ARGUMENTS | grep "XXX.md"
   ```
   - 如已更新：标记为 ✅
   - 如未更新：标记为 ❌ 并生成同步 patch

4. **生成同步 patch**（对每个 ❌ 文档）：
   - `技术方案文档.md`：在 §7.N（N 为最新 migration 版本）追加章节，标题格式「### 7.N 主题（vN 修复/新增）」
   - `产品设计文档.md`：更新「进度条」+ 在「已完成」清单加条目（格式 `- [x] N.M 描述`）
   - `UI设计规范文档.md`：更新对应组件样式 / Token 章节

5. **输出报告**：
   ```
   ## 文档同步检查报告

   ### 检查结果
   - [✅/❌] 技术方案文档.md（涉及 X 处变更）
   - [✅/❌] 产品设计文档.md（涉及 X 处变更）
   - [✅/❌] UI设计规范文档.md（涉及 X 处变更）

   ### 待补章节
   （给出可直接复制粘贴的 markdown 章节，含标题/内容/代码签名）
   ```

## 注意事项

- 文档变更与代码变更必须**同一次 commit 内**完成
- 待办项完成时从「待办」段移到「已完成」段（或勾选 `[x]`），不要静默删除
- 不要在文档中粘贴整段代码 diff —— 总结设计决策、关键字段/接口签名即可
