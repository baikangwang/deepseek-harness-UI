# DSH Code 系统设计

## 1. 目标与约束

在不改动 Harness 核心的前提下，把「文件浏览、源码管理、查找、会话管理」四个能力收敛进一个 VSCode 风格左栏，同时保持「左边栏 + 中心对话」的既有骨架。

关键约束（决定方案的硬事实）：

- 动态插件只能拿到 `ctx / React / host / styles / console` 等受限内建，**不能 `require`** npm 包（如 UI primitives、shiki），因此组件与图标全部用 `React.createElement` + 自绘 SVG + 主题 token 实现。
- 槽位系统（`@deepseek-ai/dsh-client-ui-slots`）在 `register` 时校验：**同一子槽不允许被两个 entry 声明**（`slot "X" is already declared`）。这否决了「接管 `sidebar` 再重声明 `sidebar.workspaces`」的朴素方案。

## 2. 分层

| 层 | 职责 | 载体 | 依赖 |
|---|---|---|---|
| Host 能力层 | 文件列表/读取、git 命令、内容搜索 | `packages/ide/host.js` | `ctx.fs`、`ctx.subprocess`、`ctx.workspaceRegistry`、`ctx.sandboxPolicy` |
| 通信层 | Client→Host 私有 JSON RPC | `harness.handle` / `host.call` | — |
| Client 展示层 | 活动栏 + 四视图 | `packages/ide/client.js` | `ctx.slots`、`React`、`styles`、标准 hooks |

数据归属决定代码落点：只有 Host 拥有文件系统与进程能力，故读文件 / 跑 git / 搜索都在 Host；Client 只做展示与调用。

## 3. 槽位策略：为什么替换 `sidebar.workspaces` 而非 `sidebar`

目标布局需要「logo 顶部 + 活动栏 + 四视图」。存在两条路径：

1. **接管 `sidebar`**：替换整列，重声明 `sidebar.workspaces` / `sidebar.settings` 以重挂原生插件。
   - ❌ 失败：`register` 的 `children` 校验拒绝重复声明 `sidebar.workspaces`（已被原生 shell 声明）。
2. **替换 `sidebar.workspaces` 区域**（采用）：
   - 以 `priority: -1` 注册进 `sidebar.workspaces`（`single` 槽，更低优先级者渲染），遮蔽原生会话浏览器，且**不声明任何子槽**，从而绕过重复声明校验。
   - 原生 shell 整体保留：logo、新建会话、折叠 / rail、底部设置入口全部原样可用。
   - 代价：原生会话浏览器的搜索 / 派生 / 重命名 / 拖拽等高级能力不在「会话管理」视图中，改由标准 hooks 重实现一个精简列表，留待补齐。

## 4. RPC 契约（`ide.*`）

| 方法 | 入参 | 出参 | 说明 |
|---|---|---|---|
| `ide.roots` | — | `{ root, workspaces[] }` | 沙箱工作区根 + 注册的工作区列表 |
| `ide.listDir` | `{ path }` | `{ path, entries[] }` | 单层目录，目录优先、按名排序；`entry = { name, type, path, size }` |
| `ide.readText` | `{ path, maxBytes? }` | `{ path, content, truncated, size } \| { error }` | 只读文本（默认 400KB 截断） |
| `ide.git.status` | `{ cwd }` | `{ branch, changes[], notRepo, error }` | `git status --porcelain=v1 -z`，`changes[] = { xy, path, staged, unstaged, renameFrom }` |
| `ide.git.diff` | `{ cwd, path }` | `{ stdout, stderr, ok, path }` | `git diff HEAD -- <path>`（含暂存 + 未暂存） |
| `ide.git.stage` | `{ cwd, paths[] }` | `{ ok, stderr }` | `git add -- <paths>` |
| `ide.git.unstage` | `{ cwd, paths[] }` | `{ ok, stderr }` | `git reset -q -- <paths>` |
| `ide.git.commit` | `{ cwd, message }` | `{ ok, stdout, stderr }` | `git commit -m <message>` |
| `ide.search` | `{ cwd, query, caseSensitive? }` | `{ matches[], files, truncated, error }` | ripgrep 快路径（`--json`）+ 递归扫描回退，`match = { path, line, text }` |

### git 走 `subprocess` 显式 argv

git 通过 `ctx.subprocess.spawn({ argv, cwd, stdio })` 执行，**不经过 shell 拼接**，规避 Windows 下 bash / pwsh 引号语义差异，也避免命令注入面。

### 搜索的取舍

优先用 ripgrep 快路径（`rg --json`，显式 `--glob` 排除 `node_modules`/`.git`/`dist`/`build`，失败或 `rg` 缺失时回退到 `ctx.fs` 递归扫描）。递归扫描有界（≤400 文件 / 200 命中，跳过二进制与大文件），自包含、不依赖 `rg` 是否安装。

## 5. 数据流

```
用户点击活动图标
  └─ Client: IdeRegion.setActive(view)
       ├─ Explorer/Search/SCM: host.call('ide.*') → Host ctx.fs / ctx.subprocess → JSON 返回 → React 渲染
       └─ Sessions: useSessions / useWorkspaces 快照 → 本地渲染 → ctx.sessions.open / ctx.workspaces.startSession
```

只透传叶子字段（`name/type/displayPath/size`），不序列化 `FsTarget` 等活对象。

## 6. 组件拆解（Client）

| 组件 | 职责 |
|---|---|
| `IdeRegion` | `sidebar.workspaces` 的 occupant；持有 `active` / `root`，渲染活动栏 + 内容区，处理 rail 态 |
| `ExplorerView` / `Tree` | 目录树（懒加载、隐藏文件、工作区切换） |
| `SearchView` | 搜索输入 + 结果列表 |
| `ScmView` / `DiffView` | git 状态分组 + diff 着色 |
| `SessionView` | 会话列表（状态点 / 标题 / 工作区 / 相对时间） |
| `Preview` | 带行号的只读文件预览 |

## 7. 阶段计划

- [x] **P0**：活动栏 + 资源管理器 + 搜索 + 源码管理（只读）+ 会话列表（精简）。
- [ ] **P1（当前规划）**：
  - 语法高亮预览（轻量正则 tokenizer，JS/TS/JSON/Markdown/HTML/CSS）。
  - SCM 的 stage / unstage / commit（`git add`/`reset`/`commit` + 提交信息输入）。
  - 搜索 ripgrep 快路径 + 失败回退到递归扫描。
- [ ] **P2**：编辑器升级（shiki 高亮、行内 diff、可写 + 保存）、分支切换、替换式搜索、正则 / glob 过滤。
- [ ] **P3（正式化）**：抽成 `@deepseek-ai/dsh-ide` 包 —— Host 能力抽为 Service（`ctx.ide`），Client→Host 走 `ctx.remote`，Client 复用 UI primitives 与 `ReadBlock`/`DiffBlock`/`SearchBlock`。
