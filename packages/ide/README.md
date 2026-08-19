# dsh-ide-ui

ide-ui 的单包双面实现（非官方社区插件）：**Host 半**提供 `ide` Remote 命名空间，
**浏览器半**提供 VSCode 风格侧栏 + Markdown 编辑器。通过官方
`sidebar.workspaces`（`priority: -1` 遮蔽原生会话浏览器）与 `conversation.view`
（「编辑器」标签页）两个槽位组合，零官方源码修改。

## Host 半（`lib/index.js`）

一个 `TypertRemoteService`（注册为 `ide`），把文件 / git / 搜索原语暴露给浏览器
客户端。所有能力来自 Host 服务，绝不手搓 shell：

- `ctx.fs` — 目录列举 / 读文本 / 新建文件
- `ctx.subprocess` — `git` / `rg`（显式 argv，无 shell 拼接）
- `ctx.workspaceRegistry` / `ctx.sandboxPolicy` — 工作区根与列表

方法失败时抛错（Remote 层把 throw 包成 error 分支），软错误返回 `{ ok: false, stderr }`。

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

视图与功能：

- 活动栏 + 内容区（资源管理器 / 搜索 / 源代码管理 / 会话管理），rail 折叠态。
- 编辑器：多文档 tab；`.md` 默认预览模式，支持 GFM 表格/任务列表 + KaTeX，
  预览/源码切换；预览宽度 1100px、侧边距 28px。
- 会话树展开状态持久化（`localStorage` `dshide.session.expanded.v1`）。
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
- **`search` 回退朴素** — 非 `rg` 路径是深度优先扫描（400 文件 / 200 命中上限 +
  手写跳过表），非 tokenizer 索引。
- **文件图标**：只覆盖 genie 主题定义的类型；未覆盖类型用默认文档图标。
- **编辑器只读**：当前为预览/源码双模式渲染，尚无持久化编辑保存。
