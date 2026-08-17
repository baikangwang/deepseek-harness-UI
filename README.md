# deepseek-harness-UI

给 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 的 Web UI 增加一个 **VSCode 风格的统一左栏**：在保留「左边栏 + 中心对话 + 右侧详情」三栏骨架的前提下，把左侧栏内部重排为「logo + 活动栏 + 内容区」，把文件浏览、源码管理、全文搜索与会话管理收敛到一个侧栏里。

> 实现以 **动态 Cordis 插件** 交付（`vside-1`），源码沉淀在 [`packages/ide/`](packages/ide/)，架构说明见 [`docs/architecture.md`](docs/architecture.md)。

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
deepseek-harness-UI/
├── README.md                 # 本文件
├── docs/
│   └── architecture.md       # 系统设计：分层、槽位策略、RPC 契约、数据流、阶段计划
└── packages/
    └── ide/                  # DSH Code 扩展源码
        ├── host.js           # Host 能力层：fs / git / 搜索
        ├── client.js         # Client 展示层：活动栏 + 四个视图
        ├── package.json      # 未来 @deepseek-ai/dsh-ide 包清单（蓝图）
        └── README.md         # 使用方式 + RPC 契约
```

## 快速开始

当前以动态插件形式运行，不依赖仓库构建：

1. 在 Harness Web 会话中通过 `cordis_define` 加载 `packages/ide/host.js` 与 `packages/ide/client.js` 的插件体；
2. `cordis_run` 激活（首次需在界面批准 Client 包）；
3. 左侧栏即出现统一活动栏。

## License

MIT
