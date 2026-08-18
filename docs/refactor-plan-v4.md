# deepseek-harness-UI：重构方案 v4（诚实契约边界 + 替代方案）

> 依据 `refactor-decision.md` + 官方契约（`adding-a-package.md` / `publish.md` / `packages/client/AGENTS.md`）+ **官方 git HEAD 实测**（非补丁工作树）。v4 目标：**正规、可分发的插件包**；与官方契约冲突的事实诚实报告，不给无底线妥协。

## 1. 诚实结论：独立编辑器列与「可分发插件」互斥

这是**官方契约的硬边界**，不是可妥协的细节：

- 插件的**唯一组合 API** 是 `ctx.slots.register(...)` 进入**已声明**的槽（`packages/client/AGENTS.md`：「One API… The shell alone renders 'root'」）。顶层列几何是 ui-layout 壳的专属职责。
- **官方 ui-layout（git HEAD 实测）** 只声明 `sidebar` / `conversation` / `details` / `shell.overlay` 四个顶层槽，**没有 `editor` 槽**；官方拖拽手柄只有 sidebar / details 两个（三列壳：sidebar | conversation | details）。
- `editor` 列（四列）只存在于本地 #6 补丁（11 文件 294 行，未提交）。
- 因此：**插件无法在干净官方版上创建独立列。独立列 = 壳扩展（修改官方 ui-layout），不是插件能力。** 任何声称"可分发插件自带独立列"的方案都是自欺。

## 2. 调研：官方可占用的编辑器承载面

| 槽 | kind/scope | 官方语义 | 编辑器可行性 |
|---|---|---|---|
| `conversation.view` | list / session | 会话列标签环（chat 内建 + trajectory 等），官方 `setView` 切换 | ✅ **推荐**：注册 `{id:'editor', order:20, label:'编辑器'}`，整列渲染编辑器（内部 doc tab 条 + 文件/diff 预览） |
| `shell.overlay` | list / root | 壳声明、**官方零占用者**（git grep 无使用） | ⚠️ 可作「最大化编辑器」全屏层；渲染语义官方未使用，需实测 |
| `conversation.details.tool` | single / session | 工具详情栏（ui-tool 占用） | ❌ 单槽 shadow 官方工具详情，语义不符，弃 |

## 3. 替代方案（供决策）

### 方案 X —— `conversation.view` 标签页（可分发，推荐）
- 编辑器是会话列的正式标签页，与 对话 / 轨迹 并列；整列宽度渲染 doc tab + 文件/diff。
- 官方零修改、零补丁、可编译、可分发。**代价**：编辑器与对话不能并排（独立列诉求不可得）。
- 可选补充：`shell.overlay` 全屏「最大化编辑器」入口（需先实测渲染语义）。

### 方案 Y —— 独立列 = 壳扩展（不可分发）
- 保留 ui-layout 补丁（`patchedDependencies` 单补丁）→ 独立列**只存在于你自己的构建**。
- 分发包仍按方案 X 交付；列被明确定位为「壳扩展」，**不是插件的交付物**。
- 诚实标注：`ctx.layout.openEditor` 在官方版不存在，插件对它的依赖只是可选探测；官方版自动走标签页。

### 方案 Z —— 上游能力（你已否决，仅列明）
- 向上游加 `editor` 槽 → 之后插件可分发且带列。你已明确不 PR，故不推进。

## 4. 正规化清单（去妥协，无论选 X / Y）

| 项 | 现状（妥协） | 正规化 |
|---|---|---|
| JSX | `createElement` | 组件改 JSX（tsconfig 已支持 react-jsx） |
| 样式 | `styles.module.css` 全 `:global` | scoped CSS Modules，类名走 `styles.*`，语义 token |
| 注册类型 | 边界 `as any` | `conversation.view` / `sidebar.workspaces` 用官方 SlotMap 强类型；`editor`（方案 Y）在官方编译下必须 cast——这是硬边界，不是妥协 |
| 导出 | 仅 apply/inject | 不变（已合规） |

## 5. 决策点（需拍板）

1. **编辑器承载面**：X（标签页，可分发）/ Y（标签页 + 本地独立列壳扩展）/ Z（放弃，不选）。
2. 定了之后：按 4 的正规化清单把插件做到位（JSX / scoped CSS / 强类型注册），发布锁 rc tag。

## 6. 验收

- [ ] 干净官方 `git reset --hard origin/master`：`pnpm build` 通过；`dsh plugin add` 挂载；编辑器（X 标签页）文件/目录/git/搜索/会话 RPC 通。
- [ ] 分发包：tarball 只含插件代码，无补丁、无本地依赖。
- [ ] 代码正规化：JSX、scoped CSS Modules、无 `as any`（除 editor 硬边界 cast）。
