# @deepseek-ai/dsh-ide

VSCode 风格统一左栏扩展的源码。当前以**动态 Cordis 插件**形态运行（`vside-1`），本目录沉淀可复用源码与契约。

## 文件

| 文件 | 内容 |
|---|---|
| `host.js` | Host 能力层：`ide.roots / listDir / readText / git.status / git.diff / search` |
| `client.js` | Client 展示层：活动栏 + 资源管理器 / 搜索 / 源码管理 / 会话管理 |
| `package.json` | 未来 `@deepseek-ai/dsh-ide` 包清单（蓝图，非当前可安装形态） |

## 以动态插件方式加载

`host.js` / `client.js` 各自导出一个 `{ apply(ctx) }` 插件对象。用 `cordis_define` 加载时，把文件内容作为 Host / Client 函数体传入即可（`apply` 内部使用的 `harness` / `host` / `styles` / `React` 由动态运行时注入）。

## RPC 契约（Client → Host）

| 方法 | 入参 | 出参 |
|---|---|---|
| `ide.roots` | — | `{ root, workspaces[] }` |
| `ide.listDir` | `{ path }` | `{ path, entries[] }` |
| `ide.readText` | `{ path, maxBytes? }` | `{ path, content, truncated, size } \| { error }` |
| `ide.git.status` | `{ cwd }` | `{ branch, changes[], notRepo, error }` |
| `ide.git.diff` | `{ cwd, path }` | `{ stdout, stderr, ok, path }` |
| `ide.search` | `{ cwd, query, caseSensitive? }` | `{ matches[], files, truncated, error }` |

## 正式化路径（P3）

1. 把 `host.js` 的 handler 抽成 `ctx.ide` Service（`ctx.provide('ide', {...})`），Client 用 `ctx.remote` 调用替代 `host.call`。
2. `client.js` 复用 UI primitives（`ReadBlock` / `DiffBlock` / `SearchBlock`）与 shiki 高亮，替换自绘 SVG / 正则高亮。
3. `package.json` 补齐 `dsh.client.inject`（locale / runtime / sidebar / primitives / slots）与 `peerDependencies`，作为正式包发布。
