# dsh-ide-ui

> 非官方社区插件（Unofficial project, independently developed and maintained by community members）。

给 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 的 Web UI
增加一个 **VSCode 风格的工作台**：在保留「左边栏 + 中心对话」骨架的前提下，把
左侧栏重排为「logo + 活动栏 + 内容区」，将文件浏览、全文搜索、源码管理与会话
管理收敛进一个侧栏；打开文件时中栏出现「编辑器」标签页，Markdown 文档支持带
KaTeX 的富渲染预览。文件图标与 VSCode / CodeBuddy 同源同渲染方式。

- **单包、双面**：一个 npm 包同时携带 Host 半（`ide` Remote 能力服务）与
  浏览器半（侧栏 + 编辑器 UI），经官方 `sidebar.workspaces` /
  `conversation.view` 槽位组合，**零官方源码修改**。
- 架构设计、功能与图标设计原理见 [`docs/architecture.md`](docs/architecture.md)，
  部署与验证见 [`docs/deployment.md`](docs/deployment.md)。

## 特性

- **资源管理器**：递归目录树（懒加载、隐藏文件开关、拖拽移动）、新建/重命名/
  删除、在资源管理器中显示、带行号的只读预览。
- **文件图标**：CodeBuddy genie（seti 家族）图标集，按 **文件名 → 扩展名 →
  语言 ID** 三层映射（`ts → TS 蓝标`、`json → 黄标`、`md → 文档`、`py → 双蛇`、
  `docx → Word`……），20px 彩色图标，与 VSCode 渲染方式一致。
- **全文搜索**：ripgrep 快路径 + 递归扫描回退，结果按文件 + 行号分组，点击跳预览。
- **源代码管理**：分支、已暂存/更改/未跟踪三组变更、逐文件 diff、stage/unstage/
  全部/丢弃/提交。
- **会话管理**：原生对齐的会话/项目行（状态点、相对时间）、搜索、派生、归档、
  树展开状态持久化（刷新后保留）。
- **编辑器**：`conversation.view` 标签页、多文档 tab、Markdown 默认预览模式
  （预览/源码切换）、GFM 表格与任务列表、**KaTeX 数学公式**渲染。
- 菜单图标沿用官方 `ic_ds_*` 字形（18px）；颜色全部走 `--dsw-alias-*` 主题
  token，自动适配浅色/深色主题。

## 布局

```
┌───────────────────────────┬──────────────────┬──────────┐
│ ✦ DeepSeek        [＋][⇔]  │                  │          │
├────┬──────────────────────┤   中心对话       │   详情    │
│ 📁 │  活动视图内容         │   (Conversation) │ (Details) │
│ 🔍 │  · 资源管理器          │                  │          │
│ ⎇  │  · 搜索                │   编辑器标签页    │          │
│ 💬 │  · 源代码管理          │   (EditorView)   │          │
│    │  · 会话管理            │   md → 预览渲染   │          │
│    │ ─────────────────      │                  │          │
│    │  设置（原生）          │                  │          │
└────┴──────────────────────┴──────────────────┴──────────┘
```

- 顶部 logo（点击 = 新建会话）、折叠/rail、底部设置均由原生 sidebar shell 提供并保留。
- 活动栏四图标：资源管理器 → 搜索 → 源代码控制 → 会话管理。
- 打开文件后中栏出现「编辑器」标签页，`.md` 默认预览渲染。

## 目录结构

```
deepseek-harness-UI/
├── README.md                 # 本文件
├── dsh-release.json          # 发布配置（多项目复用：包目录/包名/命令/离线开关）
├── docs/
│   ├── architecture.md       # 架构设计：分层、槽位策略、RPC 契约、组件、图标设计原理
│   ├── deployment.md         # 本地部署与验证流程
│   └── cicd.md               # CI/CD 发布方案（多项目复用，含踩坑记录与经验教训）
├── packages/
│   └── ide/                  # 单包双面：Host `IdeService`（ide Remote）+ Client 侧栏/编辑器
│       └── src/
│           ├── index.ts      # Host 半：IdeService（fs/git/search/系统操作）
│           ├── invariant.ts
│           └── client/       # 浏览器半：侧栏视图、编辑器、Markdown 渲染、图标
├── skills/
│   └── release/SKILL.md      # DSH release skill（操作层，挂到 agent 预设）
└── scripts/
    ├── dsh-release.mjs       # 发布执行层（幂等：读版本→自动打 tag→维护各仓库 workflow）
    ├── verify-ide-plugin.ps1 # 30 项环境验证（部署后必须全绿）
    ├── gen-fileicons-map.mjs # 从 CodeBuddy genie 主题重新生成文件图标映射
    ├── build-offline-package.ps1 # 生成无编译环境的离线安装 zip
    └── offline/
        ├── install-dsh-ide-ui.ps1 # 目标机一键安装脚本（打进离线包）
        └── README.md         # 离线安装/升级/卸载说明
```

## 安装

见 [`docs/deployment.md`](docs/deployment.md)。两种方式：

**无编译环境（目标机一键装）**：直接用 `dist/dsh-ide-ui-offline-<version>.zip`
（预编译 + 一键脚本），解压后运行 `install-dsh-ide-ui.ps1` 即可——无需
TypeScript / tsdown / pnpm / 源码。

**开发者流程**：

1. `npm pack` 产出 `dist/dsh-ide-ui-<version>.tgz`。
2. 解包替换 `~/.dsh/profiles/<name>/node_modules/dsh-ide-ui`（lib/ + package.json）。
3. profile `package.json` 依赖指向 `file:…/dsh-ide-ui-<version>.tgz`。
4. profile `cordis.patch.yml` 单行激活：

```yaml
- insert:
    - id: ide-ui
      name: 'dsh-ide-ui'
```

5. `scripts/verify-ide-plugin.ps1` 全绿后重启 dsh web（浏览器半改动刷新页面即可）。

## 开发

```sh
pnpm install
pnpm build          # tsdown：lib/index.js + lib/client.js + lib/invariant.js
pnpm typecheck      # tsc --noEmit
```

构建机制（装饰器降级、CSS 注入、ModuleLoader 闭包）见
[`docs/architecture.md`](docs/architecture.md) §2。

## License

MIT
