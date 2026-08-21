# dsh-ide-ui

ide-ui 的单包双面实现（非官方社区插件）：**Host 半**提供 `ide` Remote 命名空间，
**浏览器半**提供 VSCode 风格侧栏 + Markdown 编辑器。通过官方
`sidebar.workspaces`（`priority: -1` 遮蔽原生会话浏览器）与 `conversation.view`
（「编辑器」标签页）两个槽位组合，零官方源码修改。

> 版本要求：**DSH ≥ 0.1.0-rc.8**（本版本起基线 rc.8；peer 区间 `>=0.1.0-rc.7 <0.2.0-0`
> 兼容 rc.7/rc.8 的声明，但增强特性依赖 rc.8：远程事件 `$on`、插件自有设置面、
> `host.describe().home`、`@file` 引用语法）。

## Host 半（`lib/index.js`）

一个 `TypertRemoteService`（注册为 `ide`），把文件 / git / 搜索原语暴露给浏览器
客户端。所有能力来自 Host 服务，绝不手搓 shell：

- `ctx.fs` — 目录列举 / 读文本 / 新建文件
- `ctx.subprocess` — `git` / `rg`（显式 argv，无 shell 拼接）
- `ctx.workspaceRegistry` / `ctx.sandboxPolicy` — 工作区根与列表

方法失败时抛错（Remote 层把 throw 包成 error 分支），软错误返回 `{ ok: false, stderr }`。

### 设置命名空间（rc.8 插件自有设置面）

Host 探测到 `settings` 服务时注册 `ide` 命名空间（schemastery schema，`applies: live`）；
浏览器半在官方设置页「插件配置」标签的 keyed 槽位 `settings.plugin.item` 下注册
「IDE UI 设置」卡片（官方 PluginCard 风格：**头部可点击收拢/展开、默认收起**；卡片内
为分组框，组标题可折叠，默认展开）。无设置服务的部署自动降级为默认值。字段：

| 分组 | 字段 | 默认 |
|---|---|---|
| 编辑器 | `editor.fontSize` / `editor.showLineNumbers` | `13` / `true` |
| 资源管理器 | `explorer.abbreviateHome`（`~` 缩写） | `true` |
| 源代码管理 | `git.autoRefreshMs`（0 关闭） | `30000` |
| 搜索 | `search.maxFiles` / `search.maxMatches` | `400` / `200` |
| 搜索 | `search.excludes`（**只读展示**，不可编辑；组默认收起） | `node_modules/.git/dist/…` |

`search` 的排除目录与上限由该设置驱动（Host 侧读取，服务端单点生效）；排除目录暂不
开放编辑（"先不放开设置"），卡片以只读列表展示当前值，保存时原样保留。

### Remote 方法

| 方法 | 入参 | 出参 |
|---|---|---|
| `roots` | — | `{ root, workspaces[] }` |
| `listDir` | `path` | `{ path, entries[] }` |
| `readText` | `path` | `{ path, content, truncated, size }` |
| `newFile` / `mkdir` / `delete` / `rename` | 见 `IdeRemoteFace` | `{ ok, … }` |
| `explore` / `paste` | 见 `IdeRemoteFace` | `{ ok, … }` |
| `gitStatus` | `cwd` | `{ branch, changes[], notRepo, error }` |
| `gitDiff` | `cwd, path?` | `{ stdout, ok, stderr, path }` |
| `gitStage` / `gitUnstage` / `gitStageAll` / `gitUnstageAll` / `gitDiscard` / `gitCommit` | 见 `IdeRemoteFace` | `{ ok, … }` |
| `search` | `cwd, query, caseSensitive` | `{ matches[], files, truncated, error }` |

完整签名见 `src/types.ts` 的 `IdeRemoteFace`（与 `@Remote` 方法名严格一致；
Typert 产物据此生成 `typert.remote-client.d.ts`）。

## 浏览器半（`lib/client.js`）

经 `dsh.client.platform: web` 被发现，`apply()` 内：

1. `ctx.remote.$mount(ideRemote)` 挂载 `ide` namespace，随后用
   `ctx.get('remote.ide')` 读取（**自供 namespace 不能进 `inject`**，否则 fiber 在
   apply 前 park）。
2. `ctx.slots.inject('sidebar.workspaces', …)` — `priority: -1` 遮蔽原生会话
   浏览器（同优先级重复会抛 `already has a registration at priority 0`）。
3. `ctx.slots.inject('conversation.view', …)` — 「编辑器」标签页。
4. `ctx.slots.inject('settings.plugin.item', …)` — `ide` 设置卡片（见上；仅在
   `settingsScope` 可用时注册）。

视图与功能：

- 活动栏 + 内容区（资源管理器 / 搜索 / 源代码管理 / 会话管理），rail 折叠态。
- 编辑器：多文档 tab；`.md` 默认预览模式，支持 GFM 表格/任务列表 + KaTeX，
  预览/源码切换；预览宽度 1100px、侧边距 28px；字号/行号跟随设置即时生效。
- 会话树展开状态持久化（`localStorage` `dshide.session.expanded.v1`）。
- 会话搜索按官方降级语义：**本地标题/工作区匹配常驻**，远端内容索引不可用
  （rc.8 默认部署关闭全文索引）时显示提示条而不是「无结果」。
- `~` 路径缩写：资源管理器 / 搜索 / 编辑器 tab 的路径显示按 `host.describe().home`
  缩写 POSIX home（Windows 盘符/UNC 不缩写），由设置开关控制。
- 复制为 `@` 引用：资源管理器与搜索结果行的 hover 动作，按官方 `@file` 语法
  （`@path` / `@"path with space"`）复制，粘贴进输入框即被识别为显式文件引用。
- 事件驱动刷新：`credentials/updated`（rc.8 远程事件）触发源代码管理自动刷新；
  `settings/document-updated` 同步设置镜像；另按 `git.autoRefreshMs` 定时刷新。
- 版本展示：设置卡片头部显示插件版本与 DSH 基线（构建期注入，与 `package.json`
  版本同源，如 `版本 0.1.0-rc.20 · 基线 DSH 0.1.0-rc.8`）。
- 菜单图标官方 `ic_ds_*`（18px）；文件图标见下。

### 文件图标

CodeBuddy genie（seti 家族）图标集，与 VSCode 同渲染方式：

- `genie.woff` 以 base64 内嵌，运行时注入 `@font-face "dshide-fileicons"`。
- 字形是私有区码点：主题 JSON 的 `fontCharacter: "\E023"` 是 CSS 转义，渲染前
  解码为真实 Unicode 字符（U+E023）——E 是十六进制码点的一部分。
- 三层映射（文件名 → 扩展名 → 语言 ID 展开的扩展名），如
  `readme.md → _info`、`ts → _typescript`、`json → _json`、`py → _python`、
  `docx → _word`；未覆盖类型落到 `_default`（与 VSCode 一致）。

生成脚本 `scripts/gen-fileicons-map.mjs` 从 CodeBuddy 安装目录的
`genie_icon_theme.json` 重新生成映射并校验全部值命中 `ICONS`。
完整设计见 `docs/architecture.md` §8。

## Model Experience

None — `ide` Remote 是 Web-UI 后端，不贡献任何 system-prompt / tool-schema /
模型可见面。

#### KV Cache effect

Independent — 本包不产生模型请求 token，不影响可复用的 KV-cache 前缀。

## Known Limitations and Deferred Work

- **Windows-only 路径处理** — `explore` / `paste` / `mkdir` / `delete` / `rename`
  走 `explorer.exe` / 剪贴板；非 Windows 主机返回软错误 `{ ok: false }`。
- **`search` 回退朴素** — 非 `rg` 路径是深度优先扫描（上限与排除目录可经
  `ide` 设置调整），非 tokenizer 索引。
- **文件图标**：只覆盖 genie 主题定义的类型；未覆盖类型用默认文档图标。
- **编辑器只读**：当前为预览/源码双模式渲染，尚无持久化编辑保存。
- **设置卡片为轻量自实现表单** — 官方 `CardForm`（ui-settings-plugins 私有）因
  bundle purity gate 不可复用；卡片仅覆盖本插件的字段，无 schema 自动渲染。
- **`@file` 引用只做「复制」** — 「插入到输入框」需要 composer 输入面契约，另行排期。
