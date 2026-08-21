# dsh-ide-ui × DSH rc.8：升级设计方案与开发计划

> 状态：**已实施（P0–P6 代码完成，2026-08）** ｜ 基线：`dsh-v0.1.0-rc.8`（本地 `deepseek-harness` 已 checkout 该标签）｜ 插件：`dsh-ide-ui@0.1.0-rc.20`
> 依据：官方 [Release v0.1.0-rc.8](https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.1.0-rc.8)、rc.7→rc.8 全量 diff、仓库 `.agents/notes/implemented/architecture/` 中 rc.8 时代笔记（均为本地源码级验证）。
> 实施记录：P0–P5 全部落地并本地通过（typecheck / build / host 加载冒烟 / 产物特性断言）；P6 完成版本 rc.20、README 与 verify 脚本更新；**真机冒烟（rc.8 部署内加载插件）与 npm 发布（需 NPM_TOKEN）为部署侧动作，由用户环境执行**。

---

## 1. 背景与目标

DSH 发布 rc.8（14 项更新，核心多模态）。dsh-ide-ui 目前基于 rc.7 SDK 构建。本方案回答两个问题：

1. **兼容性**：rc.8 是否破坏 dsh-ide-ui？结论：无结构性破坏（详见 §3），但有**一个行为级冲突**（会话全文搜索默认关闭）需要修复。
2. **增强**：rc.8 引入的能力中哪些可借来增强插件（设置页、远程事件订阅、`~` 路径缩写、`@file` 引用）。

**目标**：升级到 rc.8 基线 → 修复行为冲突 → 落地 4 项增强 → 发布 rc.20。

## 2. 现状基线

| 项 | 值 |
|---|---|
| 插件版本 | `dsh-ide-ui@0.1.0-rc.19`（`packages/ide`） |
| SDK devDeps | 全部 `0.1.0-rc.7`（10 个包，见 §5-M0） |
| peerDeps | `@deepseek-ai/dsh-invariants` / `dsh-typert-protocol`：`>=0.1.0-rc.7 <0.2.0-0`（已容纳 rc.8，无需改） |
| Host 半侧 | `IdeService extends TypertRemoteService`，`ide` Remote：`roots/listDir/readText/newFile/mkdir/delete/rename/explore/paste/gitStatus/gitStatusMap/gitDiff/gitStage/gitUnstage/gitStageAll/gitUnstageAll/gitDiscard/gitCommit/search` |
| Host 注入 | `fs` / `subprocess` / `workspaceRegistry` / `sandboxPolicy` |
| Client 半侧 | `ctx.remote.$mount(ideRemote)`；注入 `slots` / `remote` / `sessions` / `workspaces`；注册 `sidebar.workspaces`（priority -1 遮蔽原生）、`conversation.view`（id `editor`、label `编辑器`）、`editor` 列（仅本地 #6 ui-layout patch，运行时探测） |
| 构建 | tsdown：Host 双产物（含 `@Remote` 装饰器 tsc 降级插件）+ 自注册 `lib/client.js`（CJS，external react/react-dom） |

## 3. rc.8 兼容性结论（源码级验证）

| 面 | 结论 |
|---|---|
| Host 服务（fs/subprocess/workspaceRegistry/sandboxPolicy） | ✅ rc.7→rc.8 源码零改动（仅版本 bump）；`SubprocessSpawnSpec`/`handle.done`/`collected` 逐字段一致 |
| `dsh-typert-protocol`（TypertRemoteService / @Remote / $mount） | ✅ src 零改动 |
| 客户端服务 `sessions`/`workspaces` | ✅ 键名与方法（open/search/fork/archive、startSession/pickDirectory/create/rename/delete/archiveSession）全部在位 |
| 槽位 `sidebar.workspaces` / `conversation.view` | ✅ 形状未变（新增的均为新槽位）；priority -1 覆盖机制仍有效 |
| `dsh.client` 清单 schema | ✅ `platform/inject/external/immediately` 与现声明兼容；自注册 `__ModuleLoader__.load({id,factory})` 签名未变；react/react-dom 落在 `PLATFORM_MODULES` 基线 |
| 导入的子路径导出（`/client` `/types` `/invariant`） | ✅ rc.8 全部存在 |
| **会话全文搜索默认关闭** | ⚠️ **行为冲突**：rc.8 默认 `openAt: 'never'`，`sessions.search()` 以 `SESSION_QUERY_SEARCH_DISABLED` 失败；官方 ui-workspace 已降级（本地元数据匹配 + `search.unavailable` 提示），我们当前会把"被禁用"渲染成"无结果" |
| 次要（无影响） | `conversation.view` 注入面 `openFile` 变 async（未使用）；`commands.execute` 加 `images`（未使用）；fork one-shot（Host 组合层） |
| 包改名 `dsh-experimental-*` | ✅ 未引用 experimental 包 |

**结论**：升级 = 重编译 + 回归 + 修 1 个行为冲突，无架构迁移。

## 4. 设计总览

```
M0 依赖与构建升级          —— 必做，先行
M1 会话搜索降级            —— 必做（修复冲突）
M2 插件设置页              —— 增强 A（P1）
M3 远程事件驱动刷新        —— 增强 B（P1）
M4 路径 ~ 缩写            —— 增强 C（P2）
M5 @file 引用插入         —— 增强 D（P2）
M6 回归与发布
```

设计原则：

- **只借官方的能力，不借官方私有实现**：设置卡片的 staged-form 是 `ui-settings-plugins` 私有代码，bundle purity gate 禁止以值导入 → 自实现轻量 form（约 150 行）。
- **保持 rc.7 行为不回退**：降级代码只在失败分支生效，对 rc.7 默认（内容搜索开启）无副作用。
- **零官方源码改动**：全部在插件内完成（延续插件现有立场）。

## 5. 模块详细设计

### M0 依赖与构建升级（0.5 人日）

1. `packages/ide/package.json` devDeps 全部 `0.1.0-rc.7 → 0.1.0-rc.8`：
   `dsh-api-remotes`、`dsh-client-ui-conversation`、`dsh-client-ui-sidebar`、`dsh-client-ui-slots`、`dsh-fs`、`dsh-invariants`、`dsh-sandbox-policy`、`dsh-subprocess`、`dsh-typert-protocol`、`dsh-workspace`。
2. `pnpm install`（pnpm 11）→ `pnpm typecheck` → `pnpm build`。
3. 验证 `lib/typert.*` 产物无 diff（Remote 面未变，理论上无 diff；有 diff 则重新生成并提交）。
4. 冒烟：在 rc.8 dsh 上加载插件，走查 Explorer / 编辑器 / SCM / 搜索 基本路径。

### M1 会话搜索降级（1 人日）—— 修复行为冲突

**现状问题**：`src/client/views.tsx` 搜索面板
`sessions.search(q, ctrl.signal).then(setResults).catch(() => setResults({ items: [] }))`
在 rc.8 默认部署（内容索引关闭）下：每次搜索都走失败分支 → 渲染"未找到匹配结果"，用户无法区分"真没有"与"部署禁用"，且无本地匹配兜底。

**设计**（对齐官方 `ui-workspace/WorkspaceBrowser` 的降级语义，简化实现）：

1. **错误码透传**：`client/index.ts` 的 `sessions.search` 包装目前 `!result.ok` 时 `throw new Error(result.error.message)`（丢 code）。改为抛出带 `code` 属性的错误（`error.code` 即 wire 错误码，禁用时为 `SESSION_QUERY_SEARCH_DISABLED`）。
2. **本地元数据匹配常驻**：面板始终把 `sessState.byId`（标题）+ `workspaceList`（工作区标题）做大小写不敏感包含匹配，按 `updatedAt` 倒序（官方 `deriveSearchResults` 的简化版），不再依赖远端结果才有内容。
3. **远端结果合并**：成功时远端命中（`items`）优先展示，本地匹配作为补充/去重。
4. **降级提示**：失败（无论是否 `SESSION_QUERY_SEARCH_DISABLED`）时显示提示条——"会话全文搜索不可用（该部署未启用内容索引），仅按标题/工作区匹配"，本地结果继续展示。文案进 `views.tsx` 现有中文字符串表。
5. **兼容性**：rc.7 部署内容搜索默认开启，失败分支不触发，行为不变。

**改动文件**：`src/client/views.tsx`（面板逻辑）、`src/client/index.ts`（错误透传）。

### M2 插件设置页（2 人日）—— 增强 A

rc.8 移除第三方 settings 命名空间白名单（"注册即暴露"），第三方插件 Host 注册命名空间 + 浏览器注册卡片即出现在官方设置页。参照官方 `ui-theme`（Host 注册）+ `ui-settings-plugins/BashCard`（浏览器卡片）模式。

**命名空间**：`ide`（符合 `^[a-z][a-z0-9-]*$`）。

**Schema**（`@deepseek-ai/schemastery`，模式见 `ui-theme/theme-settings.ts`：`z.object({ f: z.union([...]).default(v) })`）：

```ts
import z from '@deepseek-ai/schemastery'

export const IDE_NAMESPACE = 'ide'
export const IDE_DEFAULT_EXCLUDES = ['node_modules', '.git', 'dist', 'build', 'out', 'target', 'coverage', '.next', '.dsh', '.agent-presets', '__pycache__', '.venv', 'venv', '.idea', '.vscode']

export const IdeSettingsSchema: z<IdeSettings> = z.object({
  search: z.object({
    excludes: z.array(z.string()).default(IDE_DEFAULT_EXCLUDES), // 内容搜索排除目录（可覆盖现有硬编码 SKIP）
    maxFiles: z.number().default(400),
    maxMatches: z.number().default(200),
  }),
  editor: z.object({
    fontSize: z.number().default(13),        // 编辑器正文字号
    showLineNumbers: z.boolean().default(true),
  }),
  explorer: z.object({
    abbreviateHome: z.boolean().default(true), // ~ 路径缩写开关（配合 M4）
  }),
  git: z.object({
    autoRefreshMs: z.number().default(30000),  // SCM 状态自动刷新间隔
  }),
})
```

> 注：`z.array/z.number` 等以 `@deepseek-ai/schemastery` 实际导出为准，实现时先对照官方用法。

**Host 半侧**（新文件 `src/settings.ts`，`index.ts` 引入）：

```ts
ctx.inject(['settings'], (sctx) => {
  sctx.settings.register(settingsNamespace('ide'), IdeSettingsSchema, { applies: 'live' })
})
```

**Client 半侧**（新目录 `src/client/settings/`）：

- `form.ts`：轻量 staged form —— 字段级草稿、`scope.update(patch)` 提交、`expectedRevision` 陈旧写拒绝（官方 `CardForm` 的自实现替代，因 purity gate 禁止 import 官方值）。
- `controller.ts`：`IdeSettingsController` —— 构造时 `ctx.settingsScope.bind({ namespace: 'ide' })`（来自 `@deepseek-ai/dsh-client-ui-settings`，新增注入），暴露：
  - `snapshot()` / `subscribe()`：给编辑器字号、搜索排除项等业务视图读取（设置变更即时生效）；
  - `inject()`：卡片注册的注入面（form actions + 快照 store）。
- `IdeSettingsCard.tsx`：注册进 keyed 槽位 `settings.plugin.item`，`key: 'ide'`：

```ts
ctx.slots.inject('settings.plugin.item', function* () {
  yield ctx.slots.register({
    name: 'settings.plugin.item',
    key: 'ide',
    locale: 'ide.settings',
    inject: () => controller.inject(),
  }, IdeSettingsCard)
})
```

- `locales.ts`：`ctx.locale.register('ide.settings', { zh, en })`。
- 卡片 UI 文案：字段分组（搜索 / 编辑器 / 资源管理器 / Git），保存/丢弃/重置按钮（官方 `PluginCard` chrome 同样禁止 import → 自绘简单卡片壳）。

**设置消费打通**：

- `ide.search` Remote 增加可选 `excludes: string[]` 参数 → 搜索面板从设置读 `search.excludes` 传入（替换 Host 硬编码 `SKIP`；`maxFiles/maxMatches` 同理参数化，默认值不变）。
- 编辑器字号/行号 → `EditorView` 读 `controller.snapshot()`，`watch` 即时生效。
- `explorer.abbreviateHome` → 控制 M4 缩写开关。

**依赖新增**：`@deepseek-ai/dsh-client-ui-settings@0.1.0-rc.8`（client 注入 `settingsScope`）、`@deepseek-ai/dsh-settings@0.1.0-rc.8`（Host 值 import `settingsNamespace` + 类型；host bundle 侧 externalize 并加入 peerDependencies，与 typert-protocol 同策略）。

### M3 远程事件驱动刷新（0.5 人日）—— 增强 B

rc.8 新增 `ctx.remote.$on(event, listener)`（allowlist：`settings/document-updated`、`credentials/updated`、`agent-preset/selected`、`commands/change`、`llm/adapters-updated`；listener 类型来自 owner 包 `./types`，client 侧 import `@deepseek-ai/dsh-api-remotes/client` 即得 key 面）。

**订阅映射**：

| 事件 | 动作 |
|---|---|
| `credentials/updated` | 触发 SCM 面板 git 状态刷新（去抖 300ms）——凭据变更后 push/pull 结果可能变化 |
| `settings/document-updated` | 仅当 `ns === 'ide'` 时触发设置缓存重读（主路径是 `scope.watch`；此订阅覆盖 settings.yaml 被外部修改 / 其他页面写入的同步） |
| `agent-preset/selected` / `commands/change` / `llm/adapters-updated` | 本期不订阅（无对应 UI），预留 |

**实现**：`client/index.ts` apply 中：

```ts
ctx.effect(() => ctx.remote.$on('credentials/updated', () => { scmRefreshDebounced() }), 'ide: credential invalidations')
ctx.effect(() => ctx.remote.$on('settings/document-updated', (ns) => { if (ns === 'ide') settingsReload() }), 'ide: settings sync')
```

disposer 归属 fiber（`ctx.effect` 返回 `$on` 的 disposer 即可）。与现有手动刷新按钮/定时刷新（M2 的 `git.autoRefreshMs`）共用同一刷新入口，事件驱动优先。

### M4 路径 `~` 缩写（0.5 人日）—— 增强 C

rc.8：`host.describe()` 新增 `home`；runtime 导出 `abbreviateHomePath(path, home)`（POSIX home → `~`；Windows 盘符/UNC 不缩写；root/缺失 home 不动）。官方 `ui-workspace` 已在树 hover 使用。

**实现**：

- `client/index.ts` 注入新增 `connection`，把 `connection.hostDescription`（`HostDescriptionSource` snapshot）暴露进 `injected.hostDescription`（照 `ui-workspace` 的 `hooks.hostDescription` 模式）。
- `lib.ts` 增 `displayPath(abs, home, abbreviate)` helper → `abbreviateHomePath`（值 import 自 `@deepseek-ai/dsh-client-runtime/client`，runtime 属预加载基线，安全）。
- 应用点：资源管理器行 `title`/hover、搜索结果 `m.path` 显示、编辑器 tab 标题、SCM 面板路径；由设置 `explorer.abbreviateHome` 开关控制（M2）。

### M5 `@file` 引用插入（1 人日）—— 增强 D

rc.8 新增 `@file` 引用语法（`activeAtToken`/`formatFileMention`，`@deepseek-ai/dsh-file-reference/grammar` 子路径已发布 `lib/types/grammar.js`，浏览器安全、可值 import）与 `fileReferences` Remote（按会话 cwd 发现候选）。

**本期范围（最小闭环）**：资源管理器 / 搜索结果行的**"复制为 @引用"**动作：

- `formatFileMention({ path, kind }, false)` 生成 `@path` / `@"path with space"`；返回 `undefined`（不可安全表示）时禁用动作。
- `navigator.clipboard.writeText(...)`，成功 toast。
- 与官方 composer 的 `@` 补全天然兼容（粘贴即被识别为显式文件引用）。

**后续（可选，不入本期）**：通过 composer 输入面（`conversation.input.*` 槽位或官方引用解析）实现"插入到输入框"，需要 ui-conversation 的输入 facade 契约，独立排期。

**依赖新增**：`@deepseek-ai/dsh-file-reference@0.1.0-rc.8`（仅 import `/grammar` 与 `/types`，禁止 import 包根——Host 面；grammar 打进 client bundle）。

**风险与回退**：若 purity gate 拒绝该值 import（预期不会，grammar 是独立 browser-safe 产物），回退为内联等价实现（~20 行）。

### M6 回归与发布（1 人日）

- **版本**：`0.1.0-rc.19 → 0.1.0-rc.20`。
- **回归矩阵**（见 §8 P6 验收）。
- README 更新：rc.8 兼容性、设置项说明、新动作（复制 @引用）、`~` 缩写。

## 6. 文件变更清单

**修改**：

| 文件 | 变更 |
|---|---|
| `packages/ide/package.json` | devDeps bump → rc.8；新增依赖（`dsh-client-ui-settings`、`dsh-settings`、`dsh-file-reference`）；version → rc.20 |
| `src/index.ts` | `search` 增加 `excludes/maxFiles/maxMatches` 可选参数（替换硬编码 SKIP）；引入 `settings.ts` |
| `src/client/index.ts` | 注入增加 `connection`/`settingsScope`/`locale`；`sessions.search` 错误透传 code；`$on` 订阅；设置控制器接线；hostDescription 暴露 |
| `src/client/views.tsx` | 搜索面板降级（本地匹配 + 合并 + 提示条）；路径 `~` 缩写应用；"复制 @引用"动作 |
| `src/client/EditorView.tsx` | 字号 / 行号从设置读取（watch 生效） |
| `src/client/lib.ts` | `displayPath` helper（abbreviateHomePath 封装） |
| `tsdown.config.ts` | Host bundle external 增加 `@deepseek-ai/dsh-settings`（如走 peer 策略） |
| `README.md` | rc.8 兼容性、设置项、新特性说明 |

**新增**：

| 文件 | 内容 |
|---|---|
| `src/settings.ts` | `IdeSettingsSchema` + Host 侧 `settings.register('ide')` |
| `src/client/settings/form.ts` | 轻量 staged form（草稿 / update / revision fencing） |
| `src/client/settings/controller.ts` | `IdeSettingsController`（scope bind、快照、卡片注入面） |
| `src/client/settings/IdeSettingsCard.tsx` | 设置卡片（`settings.plugin.item` key `ide`） |
| `src/client/settings/locales.ts` | 卡片中英文案 |
| `docs/rc8-upgrade-design.md` | 本文档 |

## 7. 风险登记表

| # | 风险 | 概率/影响 | 缓解 |
|---|---|---|---|
| R1 | `dsh.client.external` 语义（require 同步、跨插件值导入变构建错误） | 低/中 | 当前 bundle 自包含；新增任何外部 specifier 时必须在 `dsh.client.external` 显式声明并回归 |
| R2 | 官方 CardForm 不可复用（purity gate） | 确定/中 | 自实现轻量 form（已计入工作量） |
| R3 | `file-reference/grammar` 值 import 被 purity gate 拒绝 | 低/低 | 回退内联 ~20 行实现 |
| R4 | `settings.plugin.item` 卡片顺序 = 注册顺序（不可控，官方已知限制） | 确定/低 | 接受；单卡场景无影响 |
| R5 | schemastery API 与预期不一致 | 低/低 | 实现前对照官方 `theme-settings.ts` / `api-proxy-config.spec.ts` 用法 |
| R6 | 搜索降级对 rc.7 部署的回归 | 低/低 | 降级只在失败分支生效；P1 验收含 rc.7 行为等价检查（可选） |
| R7 | `$on` 事件允许列表在未来 rc 变化（`credentials/updated` 等被移除） | 低/低 | 编译期 key 面即 allowlist；升级时 typecheck 会暴露 |

## 8. 开发计划

**总工作量 ≈ 6.5–7 人日**。依赖关系：M0 前置；P1 与 P4 独立可并行；P2 → P3 建议串行（同改 `client/index.ts`）。

| 阶段 | 任务 | 验收标准 | 工作量 |
|---|---|---|---|
| **P0 基线升级** | M0 全量 | `pnpm typecheck` / `pnpm build` 通过；`lib/typert.*` 无意外 diff；rc.8 冒烟清单通过（Explorer 浏览/新建/删除、编辑器打开 md、git status/stage、搜索） | 0.5d |
| **P1 搜索降级** | M1 | 默认部署下：搜索输入 → 本地标题/工作区匹配 + "全文搜索不可用"提示；开启 `openAt: first-search` 的部署 → 全文结果正常且与本地匹配合并；rc.7 行为等价 | 1d |
| **P2 设置页** | M2 | 官方设置页出现"ide"卡片；改 `editor.fontSize` 即时生效；`search.excludes` 影响搜索；写回持久化、刷新不丢 | 2d |
| **P3 事件刷新** | M3 | 改凭据（模拟 `credentials/updated`）→ SCM 自动刷新；settings.yaml 外部修改 → 设置重读 | 0.5d |
| **P4 路径缩写** | M4 | POSIX home 路径显示 `~/...`；Windows 盘符/UNC 不缩写；`abbreviateHome` 关闭后恢复全路径 | 0.5d |
| **P5 @file 引用** | M5 | 文件/目录行"复制为 @引用"生成合法 `@path`/`@"path"`；不可安全表示路径禁用；粘贴进官方输入框被识别为引用 | 1d |
| **P6 回归发布** | M6 | 回归矩阵全绿（Explorer 增删改/重命名/粘贴、git 全流程含 discard/commit、内容搜索开与关两部署、编辑器 tab/字号、设置持久化、事件刷新）；版本 rc.20；README 更新 | 1d |

**里程碑**：

- **M1（第 2 天末）**：rc.8 兼容可用的 rc.20（P0+P1 完成）。
- **M2（第 4 天末）**：搜索降级 + 设置页（P2 完成）。
- **M3（第 6 天末）**：事件刷新 + 路径缩写 + @file（P3–P5 完成）。
- **发布（第 7 天末）**：P6 回归 + rc.20 发布。

## 9. 需求理解与决策记录

**对需求的理解**（复述）：

1. 以 rc.8 为基准，先**排查 dsh-ide-ui 的冲突/不兼容**——结论：无结构性破坏，有 1 个行为冲突（会话全文搜索默认关闭）需要修复；
2. **对比官方实现，把与插件能力相关的特性借过来增强**——选定 4 项：插件设置页、远程事件订阅、`~` 路径缩写、`@file` 引用；
3. 产出**设计方案 + 开发计划**（本文档）。

**已确认决策（2026-08，评审拍板）**：

| # | 决策项 | 结论 |
|---|---|---|
| D1 | 本期范围 | **全做 P0–P5**（升级 + 修冲突 + 4 项增强），约 7 人日 |
| D2 | 版本号 | **0.1.0-rc.20**（保持 rc 线） |
| D3 | rc.7 兼容 | **不要求**，基线定 rc.8（降级代码对 rc.7 无副作用，不做 rc.7 回归项） |
| D4 | M5 范围 | **只做"复制为 @引用"**；"插入到输入框"另排期（需研究 ui-conversation 输入面契约，+1.5d 预留） |
