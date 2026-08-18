# deepseek-harness-UI：`@deepseek-ai/dsh-ide` host 面构建报告

> 依据 `docs/deepseek-harness-ui-build-plan.md`（deepseek-harness 克隆内）执行，本次交付范围为 **host 面构建**：源码入仓、编译聚合注册、依赖安装、host 面编译/打包、产物验收。

## 一、已完成项（执行结果）

| 计划步骤 | 结果 | 说明 |
|---|---|---|
| 1. 源码入仓 | ✅ | `D:\working\projects\deepseek-harness-UI\packages\ide` → `D:\working\projects\deepseek-harness\packages\host\ide`（host 分组，相对引用路径成立；`packages/*/*` 工作区 glob 自动纳入，无需改 pnpm-workspace） |
| 2. 注册编译聚合 | ✅ | `tsconfig.host.json` 追加 `./packages/host/ide/tsconfig.host.json`；`tsconfig.client.json` 追加 `./packages/host/ide/tsconfig.client.json` |
| 3. 依赖安装 | ✅ | `pnpm install`，239 个 workspace 项目；`zod` 入锁。首次因 `@anthropic-ai/claude-agent-sdk` win32 tarball 下载超时失败，以 `--fetch-timeout 600000 --fetch-retries 8` 重试成功（网络问题，与包无关） |
| 4. host 面编译 | ✅ | `tsc -b tsconfig.host.json`（全量 host 聚合）exit 0；`tsdown --env.DSH_BUILD_FACE host` exit 0（Typert 生成 + 全 workspace node 半打包） |
| 5. invariant 补件 | ➖ | 跳过（计划标注"仅并入 CI 门禁时需要"，本地构建不需要） |
| 6. 产物打包 | ✅ | `pnpm pack` → `packages/host/ide/deepseek-ai-dsh-ide-0.1.0.tgz` |

环境备注：

- `corepack enable` 无法安装 shim（`D:\apps\nodejs` 对当前用户不可写，真实 OS 权限问题），改用 `corepack pnpm`（pnpm 11.7.0，已 `corepack prepare` 缓存）等价执行，无行为差异。
- `pnpm install` 的生命周期脚本与 tsdown 配置加载在文件沙箱下会触发 spawn EPERM（管道 stdio 边界），相关命令以 full access 重跑后正常；均为沙箱边界而非命令或项目失败。
- `packages/host/ide` 源码在复制后仅做类型修复（见第三节），无业务逻辑改动。

## 二、产物

### `packages/host/ide/lib/`

| 文件 | 说明 | 大小 |
|---|---|---|
| `index.js` | Host 面服务 bundle，`export { IdeService, IdeService as default }`，注册 `'ide'` 服务键 | 20.8 KB |
| `typert.host.js` / `typert.host.d.ts` | Host Typert 插件（`@Remote` 装饰器降级 + 描述符） | 21.6 KB |
| `typert.remote-client.js` / `.d.ts` / `.d.ts.map` | 生成的 Remote client 模块（`@deepseek-ai/dsh-ide/remote` 导出目标） | 21.6 KB |
| `types/index.{js,d.ts,map}` / `types/types.{js,d.ts,map}` | tsc 产出的编译类型层 | — |
| `tsconfig.host.tsbuildinfo` | 增量构建缓存 | — |

验证：

- `typert.host.js` 覆盖全部 **18 个 Remote 方法**：`roots, listDir, readText, newFile, mkdir, delete, rename, explore, paste, gitStatus, gitDiff, gitStage, gitUnstage, gitStageAll, gitUnstageAll, gitDiscard, gitCommit, search`（无缺失）。
- `typert.remote-client.js` 含 `ide` 命名空间绑定。
- `lib/index.js` 尾部为 `export { IdeService, IdeService as default };`，`super(ctx, "ide")` 就位。

### tarball（`deepseek-ai-dsh-ide-0.1.0.tgz`）

`pnpm pack` 内容（13 项）：`lib/index.js`、`lib/typert.host.{js,d.ts}`、`lib/typert.remote-client.{js,d.ts}`、`lib/types/{index,types}.{js,d.ts}`、`LICENSE`、`package.json`、`README.md`。

## 三、编译修复

源码自 `deepseek-harness-UI` 迁入后，针对本仓真实服务 API 与严格编译选项（`strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`）共修正 4 处（均位于 `packages/host/ide/src/index.ts`）：

| 位置 | 修复 | 原因 |
|---|---|---|
| `roots()` | `w.workspaceId` → `w.id` | DSH `Workspace` 接口使用 branded `id` 字段，无 `workspaceId` |
| `listDir()` | 过滤 `type === 'other'` 的条目（带类型谓词 `e is FsDirEntry & { type: 'directory' \| 'file' }`） | DSH `FsDirEntry.type` 含 `'other'` 联合成员，wire 类型 `DirEntry.type` 只允许 `'directory' \| 'file'` |
| `search()` 回退扫描 | `walk` 参数 `unknown` → `FsTarget`；条目改为 `FsDirEntry[]` 标注；`e.displayPath` → `e.target.displayPath`；`lines[li]` 加 `undefined` 守卫 | DSH `listDir(target: FsTarget)` 签名；`FsDirEntry` 无 `displayPath`（路径在 `target.displayPath`）；`noUncheckedIndexedAccess` 下数组下标可能为 `undefined` |
| `parseStatus()` | `staged`/`unstaged` 改为 `xy[0] === ' ' ? '' : (xy[0] ?? '')` | `noUncheckedIndexedAccess` 下字符串下标访问为 `string \| undefined`，`GitChange` 字段要求 `string` |

行为语义均保持不变（`'other'` 特殊文件本就不属于 explorer 的目录/文件二分类）。

## 四、遗留（后续交付项）

| 项 | 说明 | 需要条件 |
|---|---|---|
| **client 面构建** | `tsc -b tsconfig.client.json && tsdown --env.DSH_BUILD_FACE client` 产出 `lib/client.js`。当前 tarball 的 `files` 列表缺 `lib/client.js`（`pnpm pack` 只打包已存在文件） | 这是完整 `pnpm build` 的 `build:lib:client` 半；客户端编译面还要过 `src/client/index.ts` 对 `@deepseek-ai/dsh-ide/remote` 的解析（依赖 host 面生成的 `lib/typert.remote-client.*`） |
| `build:web` | 前端聚合构建，非库构建必需 | 部署前执行 |
| **部署验收** | 目标 profile 的 `cordis.patch.yml` 追加 `- insert: { id: deepseek-harness-ui, name: '@deepseek-ai/dsh-ide' }`，重启 DSH 验证左侧栏四视图 + 编辑器列 | 需先完成 client 面构建 |
| invariant（可选） | 若纳入 DSH CI 的 `verify-package-invariants` / `verify-built-package-invariants`，按计划第 5 节补 `src/invariant.ts` 等 | 仅 CI 门禁需要 |
| LICENSE 提醒 | tarball 内 `LICENSE` 取自 deepseek-harness 仓库根（`packages/host/ide` 目录内无 LICENSE 文件）；源 `package.json` 声明 `MIT`。发布前确认许可归属 | 发布时 |

## 五、验收对照（计划第 6 节）

- [x] host 面 `pnpm build` 无错误：`tsc -b tsconfig.host.json` + `tsdown --env.DSH_BUILD_FACE host` 均 exit 0
- [x] `packages/host/ide/lib/` 产出 `index.js`、`types/**/*.d.ts`、`typert.host.js`、`typert.remote-client.js`
- [x] `pnpm pack` tarball 生成，`files` 列表齐全（除 client 面产物）
- [ ] 部署后左侧栏四视图可交互、编辑器列可用、RPC 均通 —— 待 client 面构建 + 部署
