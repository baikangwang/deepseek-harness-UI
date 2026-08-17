# @deepseek-ai/dsh-ide

deepseek-harness-UI —— 面向 DeepSeek Harness Web UI 的 VSCode 风格扩展，一个**双面 Cordis 包**：

- **Host 面**：`ide` Remote 命名空间（`TypertRemoteService`），提供文件浏览 / 源码管理 / 查找所需的 18 个原语，全部走 Host 服务（`fs` / `subprocess` / `workspaceRegistry` / `sandboxPolicy`），不手搓 shell。
- **Client 面**：统一左侧栏（资源管理器 / 搜索 / 源代码管理 / 会话管理）+ 独立编辑器列，原生 `ic_ds_*` 风格图标、14px 字体、会话派生/归档/工作区分组，挂载自己的 `ide` Remote 后经 `ctx.remote.ide.*` 调用。

## 目录结构

| 路径 | 内容 |
|---|---|
| `src/index.ts` | Host 面：`IdeService`（18 个 `@Remote` 方法，`export default`） |
| `src/types.ts` | 两端共享的 wire 类型 + `RemoteResult<T>` + `IdeRemoteFace` |
| `src/client/index.ts` | Client 面：活动栏 + 四个视图 + 编辑器列（`export const inject = ['slots', 'remote']`） |
| `tsconfig.host.json` / `tsconfig.client.json` | 双面拆分编译工程（DSH `api-remotes` 同款模式） |
| `tsdown.config.ts` | `clientBundle(..., { hostPhase: true })`：Host 面出 `lib/index.js` + Typert 产物，Client 面出 `lib/client.js` |

## 为什么拆成两个 tsconfig

DSH 的 Host 与 Client 是两套独立编译面（`tsconfig.host.json` / `tsconfig.client.json` 聚合），且 Client 源码要 `import '@deepseek-ai/dsh-ide/remote'`（Typert 在 Host 面代码生成后才存在）。所以本包采用 `packages/api/remotes` 的双面单包模式：`tsconfig.host.json` 只编 `src/index.ts` + `src/types.ts`（Node），`tsconfig.client.json` 只编 `src/client/index.ts` + `src/types.ts`（DOM/JSX），各自的 `tsBuildInfoFile` 隔开。

## 构建（需在 DSH 源码仓库内进行）

本包依赖 DSH 单仓的构建机器（`tsc -b` 聚合 + 根 tsdown 的 Typert 插件 + `packages/client/tsdown.client.ts` 预设），无法在独立仓库内 `pnpm build`。步骤如下：

```powershell
# 1. 把本包放进 DSH 克隆（host 分组，保持双面引用路径一致）
#    deepseek-harness-UI/packages/ide  →  <dsh>/packages/host/ide
Copy-Item -Recurse D:\working\projects\deepseek-harness-UI\packages\ide D:\path\to\deepseek-harness\packages\host\ide

# 2. 在 <dsh>/tsconfig.host.json 的 references 末尾加入：
#    { "path": "./packages/host/ide/tsconfig.host.json" }

# 3. 在 <dsh>/tsconfig.client.json 的 references 末尾加入：
#    { "path": "./packages/host/ide/tsconfig.client.json" }

# 4. 安装 + 构建
pnpm install
pnpm build
```

构建产物（`lib/` 下）：`index.js`（Host 服务）、`client.js`（浏览器 bundle）、`types/**/*`（声明）、`typert.host.*` 与 `typert.remote-client.*`（Typert 生成）。

> 说明：`packages/*/*` 工作区 glob 会自动包含 `packages/host/ide`，无需改 `pnpm-workspace.yaml`。若本包要并入 DSH 的 CI 门禁（`verify-package-invariants` 等），需再补一个 `src/invariant.ts` 并纳入 `tsdown.config.ts` 的 `libEntry`；本地 `pnpm build` 不受此约束。

## 安装与部署（成员侧）

```powershell
# A. 发布到（私有）npm，或直接 pnpm pack 后安装
pnpm pack                 # 生成 @deepseek-ai/dsh-ide-0.1.0.tgz
pnpm add @deepseek-ai/dsh-ide   # 目标 DSH 部署内

# B. 在 profile 的 cordis.patch.yml 追加一行（id 即插件名 deepseek-harness-ui）
#    C:\Users\<you>\.dsh\profiles\web\cordis.patch.yml：
#      - insert: { id: deepseek-harness-ui, name: '@deepseek-ai/dsh-ide' }
```

重启 DSH 后，左侧栏出现「资源管理器 / 搜索 / 源代码管理 / 会话管理」活动栏；编辑器列由 `ctx.layout.openEditor`（#6 四列布局补丁）提供。

## RPC 契约（`remote.ide`）

| 方法 | 入参 | 出参 |
|---|---|---|
| `roots` | — | `{ root, workspaces[] }` |
| `listDir` | `path` | `{ path, entries[] }` |
| `readText` | `path` | `{ path, content, truncated, size }` |
| `newFile` / `mkdir` / `delete` / `rename` / `explore` / `paste` | 见 `IdeRemoteFace` | `{ ok, ... }` |
| `gitStatus` | `cwd` | `{ branch, changes[], notRepo, error }` |
| `gitDiff` | `cwd, path?` | `{ stdout, ok, stderr, path }` |
| `gitStage` / `gitUnstage` / `gitStageAll` / `gitUnstageAll` / `gitDiscard` / `gitCommit` | 见 `IdeRemoteFace` | `{ ok, ... }` |
| `search` | `cwd, query, caseSensitive` | `{ matches[], files, truncated, error }` |

完整签名见 `src/types.ts` 的 `IdeRemoteFace`（与 `@Remote` 方法名严格一致，Typert 代码生成据此产出 `typert.remote-client.d.ts`）。
