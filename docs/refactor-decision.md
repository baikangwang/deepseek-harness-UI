# deepseek-harness-UI：重构方案决策简报

> 本文档为 deepseek-harness-UI 的开发 agent 提供**重构方案的决策输入**：三项目（deepseek-harness / deepseek-harness-UI / deepseek-harness-desktop）的定位、官方插件契约的事实、上游更新的同步流程，以及需要 agent 拍板的决策点。相关构建过程见同目录 `host-build-report.md`。

## 1. 背景与现状分类

三项目的角色（对照官方插件契约）：

| 项目 | 角色 | 对照契约 |
|---|---|---|
| `deepseek-harness`（本地克隆） | 上游补丁依赖者 + 开发环境 | 本地 HEAD = `origin/master` = rc.7（`99f6f02fec`）。工作树含**未提交的官方包修改**（见下），以及新包 `packages/host/ide` |
| `deepseek-harness-UI` | 插件作者 | `packages/ide` = `@deepseek-ai/dsh-ide` 双面插件，符合插件契约 |
| `deepseek-harness-desktop` | 部署者（纯消费方） | 未调研，推荐仅锁版本 + 挂载 + 桌面壳 |

### 1.1 关键矛盾

`ide` 插件依赖 `ctx.layout.openEditor`（四列编辑器列），但该能力在官方 `packages/client/ui-layout` 中**不存在**。当前实现依赖对官方包的未提交修改：

- `packages/client/ui-layout/src/client/{AppFrame.module.css,AppFrame.tsx,columns.ts,index.ts,service.ts,stores.ts}` + 5 个测试文件（四列布局）
- `packages/client/ui-conversation/src/client/{apply.ts,service.ts}`（会话目录）
- `packages/extensions/cordis-client-runner/src/client/{api-catalog.ts,slot-catalog.ts}` + `scripts/gen-cordis-inspect-catalog.ts`（layout 服务 `openEditor/closeEditor/toggleEditor` 目录项）

**结论：插件本身合规，但被一个不合规的依赖（官方包内补丁）卡住。** 在官方未合入四列布局前，插件无法在干净的官方版本上完整运行（现有 fallback：`conversation.view` 的「编辑器」标签页）。

### 1.2 官方契约事实（已核实）

1. **挂载契约**：插件以 npm 包 + profile patch 挂载——目标 profile 的 `cordis.patch.yml` 追加 `- insert: { id: deepseek-harness-ui, name: '@deepseek-ai/dsh-ide' }`。
2. **客户端插件三注册面**（`packages/client/AGENTS.md`）：`tsconfig.client.json` 聚合 reference、`dsh.client` manifest 行（web-app `cordis.patch.yml`）、web-app `package.json` 依赖。
3. **客户端 bundle 纯度门禁**：`packages/client/tsdown.client.ts` 的 `GENERATED_REMOTE = /^@deepseek-ai\/dsh-[a-z0-9]+(?:-[a-z0-9]+)*\/remote$/`——**Typert `@Remote` 生成的 client 贡献只放行 `@deepseek-ai/dsh-*` 命名空间**。`@deepseek-ai/dsh-ide` 是合规命名。
4. **rc 阶段无兼容承诺**（根 `AGENTS.md`）：发布前可自由改名/重构，不保证向后兼容。**依赖必须精确锁定到 tag（`dsh-v0.1.0-rc.N`），不能用宽松 semver 范围**。
5. **发布节奏**：`release/dsh-0.1.0-rc.N` 分支 → PR 合并 → tag（`dsh-v0.1.0-rc.7`）→ npm 发布（`@deepseek-ai/dsh@0.1.0-rc.7`，dist-tags `latest`/`next`）。
6. **许可证**：MIT（2026 DeepSeek）。
7. **上游合入快**：外部提交的 pty 修复（`a8dc6f9776`，Fixes #2585，讨论区 #2656 的 3.5s 卡顿问题）几天内随 rc.7 合入发布。

## 2. 推荐方案：零永久 fork 的纯插件架构

```
官方 deepseek-harness（master，只 fetch 不提交）
        │  pnpm patchedDependencies 单点补丁（仅 ui-layout 四列，上游未合入前的过渡）
        ▼
deepseek-harness-UI  ← 唯一承载业务代码的仓库（ide 插件 + 补丁文件，独立版本）
        ▼
deepseek-harness-desktop  ← 锁定 @deepseek-ai/dsh@rc.N + 插件版本，纯胶水
```

依据：

- 官方架构"一切皆插件"，插件以包 + patch 挂载，升级只换版本号；
- 官方 rc 阶段可自由重构，长期 fork 会在每次上游重构时流血；插件不受影响；
- MIT + 上游合入快 → 官方包内修改应贡献 PR 回上游，而非背着 fork；
- 未合入前的过渡用 pnpm `patchedDependencies` 维护**单一补丁文件**（最小冲突面、可审查），不要 fork 整个仓库。

## 3. 上游更新后的同步流程

同步信号 = 官方 tag（`dsh-v0.1.0-rc.N`）+ npm dist-tag（`latest`/`next`）。

| 上游事件 | deepseek-harness（本地克隆） | deepseek-harness-UI | deepseek-harness-desktop |
|---|---|---|---|
| 发 rc.N | `git fetch && git reset --hard origin/master`（无本地提交，直接跟上） | 升 peerDeps/devDeps 到 rc.N → 重跑 `pnpm build` + 插件测试 → 若有 ui-layout 补丁冲突则重套 → 发插件新版本 | 不动 |
| 插件发版 | 不动 | 打包发布（或私有 registry） | 升插件版本 → 重建 → 桌面回归测试 |
| 桌面发版 | 不动 | 不动 | 锁 dsh@rc.N + 插件@x.y.z，出包 |

## 4. 留给 UI 开发 agent 的决策点

### 决策 1（最关键）：四列编辑器列能力的来源

- **1A 贡献上游（推荐）**：把 `ui-layout` 四列 + `openEditor` + catalog 补丁整理为**独立于 ide 插件的 PR 变更集**提交 `deepseek-ai/deepseek-harness`。合入后 fork 面归零，插件直接消费官方能力。代价：等待合入期。
- **1B pnpm patch 过渡**：未合入期间，把补丁做成 `patchedDependencies` 单文件，由 deepseek-harness-UI 维护，上游每次更新重套。
- **1C 插件自实现（去依赖）**：不依赖官方 ui-layout 修改，编辑器列改用 `conversation.view` 标签页 fallback（功能降级）或插件自有列渲染（工作量大、可能与官方布局冲突）。适合等不及上游合入、且可接受降级的场景。

### 决策 2：插件命名空间

- **2A 保持 `@deepseek-ai/dsh-ide`（当前唯一合规路径）**：纯度门禁只放行该命名空间。
- **2B 推动上游放宽 `GENERATED_REMOTE` 到任意 scope**，再迁移自有命名空间（需要上游 PR，低优先级）。
- **2C 弃用 Typert `@Remote`，改用 apiproxy/普通 JSON-RPC**：摆脱命名约束，但失去生成式 remote-client（`@deepseek-ai/dsh-ide/remote` 的产物与纯度门禁豁免）。

### 决策 3：deepseek-harness-UI 仓库形态

- **3A 单包**（现状 `packages/ide`）：简单，多插件时版本耦合。
- **3B pnpm monorepo**（`packages/<name>/` 多插件，各自独立版本）：推荐——与官方仓库形态一致，插件独立发版、独立生命周期。
- **3C 插件集合 bundle**（仿 `packages/bundle/web-app` 的 patch 集成）：提供开箱即用的 profile 补丁，面向最终用户，维护成本更高。

### 决策 4：版本与依赖策略

- 精确锁定 `dsh-*` 到 rc tag（`0.1.0-rc.7`），`peerDependencies` 声明所依赖的官方版本范围；
- 可选：接入官方 tag 发布事件，CI 自动重验证插件（构建 + 测试）再发版。

### 决策 5：desktop 集成方式

- **5A 复用官方 web-app bundle + profile patch 挂载 + 锁版本（推荐）**：上游前端更新只需重打包。
- **5B 自建前端构建**：不推荐，维护成本高，破坏"零 fork"。

## 5. 落地顺序（建议）

1. 决策 1 拍板（优先 1A，配 1B 过渡）；
2. 把 `ide` 插件完整搬进 deepseek-harness-UI（源码、tsdown、版本、README，写明依赖的官方能力清单）——host 面构建已完成，见 `host-build-report.md`；
3. 若走 1A：整理四列布局为独立 PR 变更集（与 ide 插件分开）；
4. 确定决策 2/3/4 后落实仓库形态与版本策略；
5. desktop 按决策 5 实现锁版本 + 挂载 + 壳。

## 6. 参考证据

- 官方仓库：`deepseek-ai/deepseek-harness`，MIT，HEAD `99f6f02fec`（rc.7）
- pty 3.5s 修复：commit `a8dc6f9776`（`fix(pty): keep the controlled prompt so persistent bash settles fast`，Fixes #2585），讨论区 [deepseek-ai/deepseek-harness/discussions/2656](https://github.com/deepseek-ai/deepseek-harness/discussions/2656)
- npm：`@deepseek-ai/dsh@0.1.0-rc.7`（latest）
- 本地构建：`packages/host/ide/lib/`（`index.js`、`typert.host.js`、`typert.remote-client.js`、`types/*`），tarball `deepseek-ai-dsh-ide-0.1.0.tgz`，详见 `host-build-report.md`
