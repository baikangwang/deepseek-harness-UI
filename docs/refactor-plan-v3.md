# deepseek-harness-UI：重构方案 v3（零官方修改，去上游依赖）

> 依据 `refactor-decision.md` + 官方契约 + 前两轮实现。**v3 修订**：不向上游提 PR（四列布局只是布局变更，非特性/能力，用户决策）。插件契约改为**零官方修改**——干净官方 DSH 上编译、运行、分发；独立编辑器列降级为插件自有的**运行时探测增强**，由本地 overlay 提供，与可分发插件解耦。

## 1. 现状（不变）

已合规：双包单聚合、invariant、README Model Experience、`package.json` 不变量、Client 契约（`ctx.slots.inject` + inject face + store 工厂 + 独立组件 + CSS Modules + 导出纪律）、Host 18 个 `@Remote` + `@deepseek-ai/dsh-ide` 命名过纯度门禁。

已实现（上轮）：P1（`editor` 注册运行时探测 cast，干净官方可编译）、P3（`packages/bundle` 组合包）。

## 2. 核心决策（v3 修订）

### 2.1 编辑器能力来源（原决策 1，重定）

| 路径 | v2 判定 | v3 判定 |
|---|---|---|
| 1A 贡献上游 PR | 推荐 | **弃**（用户：布局变更不 PR） |
| 1B 本地补丁（patchedDependencies） | 过渡 | **保留**（仅用户个人环境，作为「本地 overlay」，见 2.3） |
| 1C 功能降级（conversation.view 标签页） | 不选 | **基线（插件契约）** |

**插件契约（可分发、官方零修改）**：编辑器是 `conversation.view` 的一个标签页（id `editor`，order 20，label `编辑器`），内部 tab 条 + 文件/diff 预览。干净官方 DSH 上编译、运行、分发。

**增强（运行时探测，同一份插件代码）**：`ctx.get('layout')?.openEditor` 存在 → 注册 `editor` 独立列（cast 注册，官方 SlotMap 无此键也编译）。补丁环境出现独立列，官方环境自动回退标签页——**插件代码不区分，纯运行时**。

### 2.2 为什么这是正确的分工

- 列几何（sidebar | editor | conversation | details）是**壳（ui-layout）的布局职责**，不是插件能力；插件不该要求官方壳为它改布局，也不该 fork 官方包。
- 插件拥有的是**内容**（文件树 / 搜索 / git / 会话 / 编辑器）；内容在哪个列/标签页呈现，是运行时探测的结果。
- 本地 overlay 只在你自己的构建环境生效；成员拿到的是纯官方兼容包。

### 2.3 本地 overlay（仅个人环境，不随包分发）

独立编辑器列的来源 = 一个**单包补丁**，维护在 UI 仓库 `overlays/`，经 pnpm `patchedDependencies` 套用：

```
overlays/dsh-client-ui-layout.patch   # 四列 AppFrame + editor 槽 + ctx.layout.openEditor
```

- 范围收窄到 **仅 `@deepseek-ai/dsh-client-ui-layout`**（四列几何 + `editor` 槽 + `openEditor`）。ui-conversation `setView`、cordis-client-runner catalog 等 v2 时代的多包改动**不再需要**（setView 已是死代码；catalog 是文档面，不影响运行时）。
- 每次官方 rc 升级重套（`pnpm patch` 流程）；冲突只可能出现在 ui-layout，冲突面最小。
- 打包/分发**排除** overlay——tarball 只含插件代码。
- 若你接受标签页基线、不再维护独立列，直接删除 overlay 即可，插件不受影响。

### 2.4 其余决策对齐（不变）

- 命名 2A：`@deepseek-ai/dsh-ide` + `@deepseek-ai/dsh-client-ui-ide`（纯度门禁唯一放行）。
- 仓库 3B：多包（ide / client-ui-ide / bundle），独立版本。
- P3 bundle：`dsh.bundle` + `dsh plugin add`（已实现）。
- P4：发布前 `workspace:*` → `0.1.0-rc.7` 精确锁版。
- P5：README 文档化 `sidebar.workspaces` shadow（Sessions 视图承接官方工作区管理）。

## 3. 落地顺序

1. ✅ P1：`editor` 注册 cast + 移除 ui-layout SlotMap 导入（干净官方可编译）。
2. **overlay 收窄**：把 #6 多包改动收敛为 `overlays/dsh-client-ui-layout.patch` 单补丁（只留四列几何 + `editor` 槽 + `openEditor`）；`patchedDependencies` 套用；验证「官方基线标签页 / 补丁增强独立列」两态。
3. ✅ P3：bundle 组合包。
4. P4：发布锁版（rc tag）。
5. 回归：干净官方 `pnpm build` + 部署（标签页）→ 套 overlay 部署（独立列）。

## 4. 验收标准

- [ ] 干净官方（`git reset --hard origin/master`，无补丁）：`pnpm build` 通过；部署后编辑器为 `conversation.view` 标签页，文件/目录/git/搜索/会话 RPC 通。
- [ ] 套 `overlays/dsh-client-ui-layout.patch`：`editor` 独立列出现（同一份插件代码，无改动）。
- [ ] `dsh plugin add <bundle>` 一键挂载；tarball 不含 overlay。
- [ ] 发布包 peerDeps 锁 rc tag。

## 5. 残余项（低，已文档化）

注册边界 `as any`、`createElement` 非 JSX、CSS `:global` 包裹、`sidebar.workspaces` shadow——均已在 README Known Limitations 标注，不影响合规与分发。
