# @deepseek-ai/dsh-ide

deepseek-harness-UI 的 **Host 面**：`ide` Remote 命名空间。一个 `TypertRemoteService`（注册为 `ide`）把文件 / git / 查找原语暴露给浏览器客户端（`@deepseek-ai/dsh-client-ui-ide` 经 `ctx.remote.ide.*` 调用）。所有能力都来自 Host 服务，绝不手搓 shell：

- `ctx.fs` — 目录列举 / 读文本 / 新建文件 / 递归查找
- `ctx.subprocess` — `git` 与 `rg`（显式 argv，无 shell 拼接）
- `ctx.workspaceRegistry` / `ctx.sandboxPolicy` — 工作区根与列表

方法失败时抛错（Remote 层把 throw 包成 `RemoteResult` 的 error 分支），软错误返回 `{ ok: false, stderr }`。

## Service

| 方法 | 入参 | 出参 |
|---|---|---|
| `roots` | — | `{ root, workspaces[] }` |
| `listDir` | `path` | `{ path, entries[] }` |
| `readText` | `path` | `{ path, content, truncated, size }` |
| `newFile` | `path` | `{ ok, path }` |
| `mkdir` / `delete` / `rename` | 见 `IdeRemoteFace` | `{ ok, stderr, ... }` |
| `explore` / `paste` | 见 `IdeRemoteFace` | `{ ok, ... }` |
| `gitStatus` | `cwd` | `{ branch, changes[], notRepo, error }` |
| `gitDiff` | `cwd, path?` | `{ stdout, ok, stderr, path }` |
| `gitStage` / `gitUnstage` / `gitStageAll` / `gitUnstageAll` / `gitDiscard` / `gitCommit` | 见 `IdeRemoteFace` | `{ ok, ... }` |
| `search` | `cwd, query, caseSensitive` | `{ matches[], files, truncated, error }` |

完整签名见 `src/types.ts` 的 `IdeRemoteFace`（与 `@Remote` 方法名严格一致；Typert 代码生成据此产出 `typert.remote-client.d.ts`）。

## Model Experience

None, as the `ide` Remote namespace is a Web-UI backend — it contributes no system-prompt, tool-schema, or other model-visible surface.

#### KV Cache effect

Independent: this package adds no model-request tokens, so it cannot invalidate a reusable KV-cache prefix.

## Known Limitations and Deferred Work

- **Windows-only path handling** — `explore` / `paste` / `mkdir` / `delete` / `rename` shell out to `pwsh` / `explorer.exe`; non-Windows hosts get a soft `{ ok: false }`.
- **`search` fallback is naive** — the non-`rg` path is a depth-first scan with a 400-file / 200-match cap and a hand-rolled skip list, not a tokenizer-based index.
