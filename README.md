# ide-ui

> 非官方社区插件，由社区成员独立开发和维护（Unofficial project, independently developed and maintained by community members）。

给 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 的 Web UI 增加一个 **VSCode 风格的统一左栏**：在保留「左边栏 + 中心对话 + 右侧详情」三栏骨架的前提下，把左侧栏内部重排为「logo + 活动栏 + 内容区」，把文件浏览、源码管理、全文搜索与会话管理收敛到一个侧栏里。

> 交付为可分发 npm 包（Host [`dsh-ide-ui`](packages/ide/) + Client [`dsh-client-ide-ui`](packages/client-ui-ide/) + 组合层 [`dsh-ide-ui-bundle`](packages/bundle/)），源码与架构说明见 [`docs/`](docs/)。

## 特性

- **资源管理器**：递归目录树、懒加载展开、隐藏文件开关、工作区切换、按名称查找、新建文件/文件夹、重命名、删除，带行号与语法高亮的只读文件预览。
- **搜索**：工作区全文检索（ripgrep 快路径 + 递归扫描回退），结果按「文件 + 行号」分组，点击跳预览。
- **源代码管理**：当前分支、已暂存 / 更改 / 未跟踪三组变更、点文件看 `git diff HEAD`，支持逐文件/全部 stage、unstage、丢弃更改、commit。
- **会话管理**：会话列表（状态点 + 标题 + 所属工作区 + 相对时间），点击打开、新建会话、添加工作区。
- 全部颜色走 `--dsw-alias-*` 主题 token，自动适配浅色 / 深色主题；侧栏折叠成 rail 时只显示活动图标。

## 布局

```
┌───────────────────────────┬──────────────────┬──────────┐
│ ✦ DeepSeek        [＋][⇔]  │                  │          │
├────┬──────────────────────┤   中心对话       │   详情    │
│ 📁 │  活动视图内容         │   (Conversation) │ (Details) │
│ 🔍 │  · 资源管理器          │                  │          │
│ ⎇  │  · 搜索                │                  │          │
│ 💬 │  · 源代码管理          │                  │          │
│    │  · 会话管理            │                  │          │
│    │ ─────────────────      │                  │          │
│    │  设置（原生）          │                  │          │
└────┴──────────────────────┴──────────────────┴──────────┘
```

- 顶部 **logo**（DeepSeek 字标，点击 = 新建会话）由原生 sidebar shell 提供并保留。
- 竖排 **活动栏** 四图标按序排列：资源管理器 → 搜索 → 源代码控制 → 会话管理。
- 折叠成 56px rail 时，只显示活动图标，点击任意图标自动展开并切换到对应视图。

## 目录结构

```
ide-ui/
├── README.md                 # 本文件
├── docs/
│   └── architecture.md       # 系统设计：分层、槽位策略、RPC 契约、数据流、阶段计划
└── packages/
    ├── ide/                  # Host 半：dsh-ide-ui（`ide` Remote：fs / git / 搜索）
    ├── client-ui-ide/        # Client 半：dsh-client-ide-ui（活动栏 + 四视图 + 编辑器标签页）
    └── bundle/               # 组合层：dsh-ide-ui-bundle（cordis.patch.yml 一键挂载）
```

## 安装

以 bundle 方式挂载到任意 profile（三个包分别发布）：

```sh
dsh plugin --profile <name> add dsh-ide-ui-bundle
```

或手动在 profile 的 `cordis.patch.yml` 追加：

```yaml
- insert:
    - id: ide-ui
      name: 'dsh-ide-ui'
    - id: ui-ide
      name: 'dsh-client-ide-ui'
```

## 开发

```sh
pnpm install
pnpm build          # 三个包各自产出 lib/
pnpm typecheck
```

## License

MIT
