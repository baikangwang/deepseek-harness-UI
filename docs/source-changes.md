# 源码级改造规格（#1 / #3 / #6）

这三项无法在「动态 Cordis 插件」层完成，根源是槽位系统的硬约束：

> `@deepseek-ai/dsh-client-ui-slots` 的 `register` 在注册时校验 `children`，**同一子槽不允许被两个 entry 声明**（`slot "X" is already declared`）。而 `root`/`sidebar`/`conversation` 都是 `single` 且 `replaceRisk: shadows-shipped-ui`，替换即丢失其声明的子槽（`sidebar.workspaces`/`sidebar.settings` 等），且无法重新声明。

因此需要修改 DSH 源码（本仓库不包含 DSH monorepo，此处只给规格）。DSH 源码仓库为 `deepseek-ai/deepseek-harness`，相关包路径如下（对应 npm 包 `@deepseek-ai/*`）。

## #1 新会话按钮移入会话管理

**现状**：`packages/client/ui-sidebar` 的 `SidebarRoot` 在 logo 行下方硬编码了一个「新会话」按钮（`startSession`），不在任何槽内，动态插件无法移除。

**改法**：
- 删除 `SidebarRoot` 中独立的 `newSession` 按钮渲染，只保留品牌字标（点击 = 新会话）与折叠按钮。
- 「新会话」入口改由 `sidebar.workspaces` 的 occupant（DSH Code 的会话管理视图）自行渲染。

## #3 恢复会话管理全部功能（按工作区分组、平铺、搜索、派生、重命名、归档、拖拽等）

**现状**：完整会话能力在 `dsh-client-ui-workspace` 的 `WorkspaceBrowser` 里，注册进 `sidebar.workspaces`。DSH Code 以 `priority:-1` 遮蔽了它，且无法把原生浏览器重挂到自己的面板（重声明 `sidebar.workspaces` 被拒）。

**改法（推荐）**：
- 在 `dsh-client-ui-sidebar` 的 `SlotMap` 增加一个可复用子槽 `sidebar.workspaces.sessions`（`single`/`root`），让 `WorkspaceBrowser` 注册到这个子槽而非直接注册 `sidebar.workspaces`。
- DSH Code 接管 `sidebar.workspaces`（渲染活动栏 + 四视图），「会话管理」视图用 `renderSlot('sidebar.workspaces.sessions', {...})` 原样挂载原生浏览器 —— 完整功能零丢失。
- 或者（次选）：把 `WorkspaceBrowser` 抽成可导出的纯 React 组件 + 数据 hooks，供 DSH Code 直接复用。

## #6 中心区一分为二（编辑器 + 会话）

**现状**：`dsh-client-ui-layout` 的 `AppFrame` 是三栏 flex（`sidebar | conversation | details`），`conversation` 是会话主体。动态插件无法插入新列。

**改法**：
- 在 `AppFrame` 的 `sidebar` 与 `conversation` 之间增加一个 `editor` 列（可折叠、可拖宽，复用现有 drag/concession 机制）。
- 在 `SlotMap` 声明 `editor`（`single`/`session-maybe`），由布局 owner 传入几何（`open/width`）与 `ctx.layout.openEditor/closeEditor/toggleEditor`。
- DSH Code 的「文件查看」「源码管理 diff」渲染到 `editor` 槽；会话保持在中右。
- 打开文件 / 点 diff 时调用 `ctx.layout.openEditor()`，关闭时回收。

## 交付顺序建议

1. 先做 #3 的子槽拆分（影响最小、收益最大：会话管理功能全量回归）。
2. 再做 #6 的 `editor` 列（布局 + 槽 + 几何服务）。
3. 最后 #1（随 #3 一并完成，删 shell 按钮即可）。
