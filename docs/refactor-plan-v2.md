# deepseek-harness-UI：重构方案 v2（对照官方契约重审）

> 依据：`docs/refactor-decision.md`（决策简报）+ 官方契约（`docs/cookbook/adding-a-package.md`、`docs/user/develop/basic/publish.md`、`packages/client/AGENTS.md`、`docs/cookbook/extension-cookbook.md`）+ 当前实现（`packages/ide` Host + `packages/client-ui-ide` Client）。

## 1. 现状评估

### 1.1 已合规（上两轮完成）

| 契约 | 状态 |
|---|---|
| 双包、各占一个编译聚合（`adding-a-package.md` §2「new packages must not copy api/remotes split」） | ✅ `packages/ide`（host 聚合）+ `packages/client-ui-ide`（client 聚合） |
| `invariant` companion + `files` 含 `lib/invariant.js` | ✅ 两包均有 `src/invariant.ts` |
| README Model Experience + Known Limitations | ✅ |
| `package.json` 不变量（cordis 在 peer+dev、peer 镜像 dev、`files` 列表） | ✅ |
| Client：注册只在 `apply`、`ctx.slots.inject` + inject face、`createXXXStore` 工厂、独立组件文件、CSS Modules、导出纪律 | ✅ |
| Host：`TypertRemoteService` + 18 个 `@Remote`，`@deepseek-ai/dsh-ide` 命名过 `GENERATED_REMOTE` 纯度门禁 | ✅ |

### 1.2 剩余不合规 / 关键问题

| # | 问题 | 严重度 |
|---|---|---|
| **P1** | **无法在干净官方 DSH 上编译**：Client 注册 `editor` 槽，但 `editor` 只存在于本地 #6 补丁的 `SlotMap`；官方 `SlotMap` 无此键 → `ctx.slots.register({name:'editor'})` 编译报错 | 阻断 |
| **P2** | **编辑器列能力依赖官方包内补丁**（`ctx.layout.openEditor` + `editor` 槽），未合入上游前插件无法在干净官方版本完整运行（`refactor-decision.md` §1.1） | 高 |
| **P3** | **分发形态未按 `publish.md`**：官方第三方模型是 `dsh.bundle` 组合包 + `dsh plugin add`；当前只有裸包，需补 bundle 包装 | 中 |
| **P4** | **版本锁定**：官方 rc 阶段无兼容承诺，须精确锁 `dsh-*` 到 tag（`0.1.0-rc.7`），当前 `workspace:^` 只适合仓库内构建 | 中 |
| **P5** | `sidebar.workspaces` 以 `priority:-1` **shadow 官方 ui-workspace**（合法但激进，属刻意设计，需文档化） | 低 |
| **P6** | 注册边界 `as any`、`createElement` 非 JSX、CSS `:global` 包裹（已标注为遗留项） | 低 |

## 2. 新重构方案

### 目标
**一个在干净官方 DSH 上能编译、能运行的合规插件**；编辑器列是运行时特性探测的增强（官方合入四列后自动升级为独立列），`conversation.view` 标签页为始终可用的基线。分发走官方 `dsh.bundle` + `dsh plugin add`。

### 2.1 P1 修复：干净官方编译（必须，先行）

`editor` 槽注册从「强类型 SlotMap 键」改为「运行时特性探测 + 边界 cast」：

```ts
// index.ts apply
const layout = ctx.get('layout') as { openEditor?: () => void } | undefined
const hasEditorColumn = layout !== undefined && typeof layout.openEditor === 'function'

ctx.slots.inject('sidebar.workspaces', () => ctx.slots.register(
  { name: 'sidebar.workspaces', inject: () => injected },
  IdeSidebar as any, // 边界 cast：组合 props 含 owner + framework shares
))
if (hasEditorColumn) {
  // editor 槽是 #6 补丁能力：官方 SlotMap 无此键，cast 保证干净官方可编译；
  // 上游合入四列后（refactor-decision.md 决策 1A）可移除 cast 走强类型。
  ctx.slots.inject('editor' as never, () => (ctx.slots.register as never)(
    { name: 'editor', inject: () => injected }, EditorView,
  ))
} else {
  ctx.slots.inject('conversation.view', () => ctx.slots.register(
    { name: 'conversation.view', id: 'editor', order: 20, label: '编辑器', inject: () => injected },
    EditorView as any,
  ))
}
```

同时：`slots.ts` 移除 `@deepseek-ai/dsh-client-ui-layout/client` 的 SlotMap 增广导入（`editor` 不再强类型引用；`ctx.layout` 经 `ctx.get` + cast 读取）。

### 2.2 P2 决策落地：编辑器列能力来源（`refactor-decision.md` 决策 1）

- **基线**（本方案默认交付）：`conversation.view` 标签页——官方能力，零补丁可运行。
- **增强**（运行时探测）：`ctx.layout.openEditor` 存在 → 注册 `editor` 独立列。
- **能力来源**：走 **1A 贡献上游**（四列布局 PR，独立于插件变更集）；合入前的过渡用 **1B pnpm `patchedDependencies` 单补丁**（由 deepseek-harness-UI 维护，官方更新重套）。**不选 1C**（功能降级不必要，因为 2.1 已让基线可用）。

### 2.3 P3 分发：bundle 包装（`publish.md` 模型）

新增薄组合包 `packages/bundle/`（如 `@deepseek-ai/dsh-harness-ui-bundle`），仅含：

```jsonc
// package.json
{ "name": "@deepseek-ai/dsh-harness-ui-bundle", "version": "0.1.0",
  "files": ["cordis.patch.yml"], "dsh": { "bundle": { "patch": "./cordis.patch.yml" } } }
```

```yaml
# cordis.patch.yml —— 插入 Host + Client 两行（id 固定 deepseek-harness-ui*）
- insert:
    - id: deepseek-harness-ui
      name: '@deepseek-ai/dsh-ide'
    - id: deepseek-harness-ui-client
      name: '@deepseek-ai/dsh-client-ui-ide'
```

成员安装：`dsh plugin --profile <name> add @deepseek-ai/dsh-harness-ui-bundle`（或 tarball / `github:` 加 `prepare`）。两个业务包仅作依赖（`dsh.bundle` 的 patch 按包名解析，profile 的 pnpm 管理树外依赖）。

### 2.4 P4 版本锁定

- `devDependencies`：`dsh-*` 精确 `0.1.0-rc.7`（仓库内构建用 `workspace:*`，发布前换成 tag）。
- `peerDependencies`：声明支持的官方范围（如 `>=0.1.0-rc.7 <0.2.0-0`），并在 README 注明。
- 可选：接入官方 tag 发布事件，CI 自动重验证。

### 2.5 P5 文档化

README 增「与官方侧栏的关系」：`sidebar.workspaces` 单槽以 `priority:-1` shadow 官方 ui-workspace（侧栏整体替换为 IDE 四视图；会话/工作区管理由本插件 Sessions 视图承接）。若未来要共存，需 ui-sidebar 声明子槽（上游 PR 项，非本插件可独立解决）。

### 2.6 仓库形态与命名（决策 2/3 对齐）

- **命名 2A**：保持 `@deepseek-ai/dsh-ide` + `@deepseek-ai/dsh-client-ui-ide`（纯度门禁唯一放行路径）。
- **仓库 3B**：deepseek-harness-UI 已是多包（`packages/ide` + `packages/client-ui-ide` + `packages/bundle`），每包独立版本；与官方仓库形态一致。

## 3. 落地顺序

1. **P1**：client 改 `editor` 注册为 cast + 移除 ui-layout SlotMap 导入 → 确认在干净官方（无补丁）`tsc -b tsconfig.client.json` 通过。 ✅ 已实现（`index.ts` + `slots.ts`）
2. **P2**：四列布局整理为独立 PR（1A）提交上游；合入前用 `patchedDependencies` 单补丁过渡（仅本地构建/运行时增强）。
3. **P3**：写 `packages/bundle` 组合包 + `cordis.patch.yml`，`dsh plugin add` 验证。 ✅ 已实现（`packages/bundle`）
4. **P4**：发布前把 `workspace:*` 换成 rc tag，精确锁版本。
5. 回归：干净官方基线（`conversation.view` 编辑器标签页）→ 补丁增强（独立编辑器列）两态都绿。

## 4. 验收标准

- [ ] 干净官方 DSH（`git reset --hard origin/master`，无本地补丁）：`pnpm build` 通过，插件以 `conversation.view` 标签页完整可用（文件/目录/git/搜索/会话 RPC 通）。
- [ ] 套 #6 补丁（或官方合入后）：`editor` 独立列出现，`ctx.layout.openEditor` 生效。
- [ ] `dsh plugin --profile demo add <bundle>` 一步挂载，profile `cordis.patch.yml` 无需手改。
- [ ] 发布包 peerDeps 锁定 rc tag，`pnpm pack` tarball `files` 齐全。
