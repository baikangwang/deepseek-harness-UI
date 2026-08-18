# @deepseek-ai/dsh-client-ui-ide

deepseek-harness-UI 的 **Client 面**：统一左侧栏（资源管理器 / 搜索 / 源代码管理 / 会话管理）+ 独立编辑器列。纯展示层——文件 / git / 查找原语通过挂载自己的 `ide` Remote（`ctx.remote.$mount(ideRemote)`）到达，会话 / 工作区数据来自框架的全局 `useSessions` / `useWorkspaces` 钩子。

- 注册到 `sidebar.workspaces`（`priority: -1` 占据整栏）。
- 布局有 `ctx.layout.openEditor` 时注册进 `editor` 槽，否则回退到 `conversation.view` 的「编辑器」标签页。

## Model Experience

None, as the sidebar and editor column are pure presentation over the `ide` Remote and framework slot hooks — they contribute no model-visible surface.

#### KV Cache effect

Independent: this package adds no model-request tokens, so it cannot invalidate a reusable KV-cache prefix.

## Known Limitations and Deferred Work

- **动态插件形态的移植** — 组件仍以 `apply` 闭包内的 `createElement` 方式书写，槽注册用宽松类型（`as unknown as …`）绕过 `SlotMap` 强类型；DSH 惯用法是拆成 `.tsx` 组件 + `register` 的 `inject` face + CSS Modules。
- **编辑器列依赖 #6 四列补丁** — `ctx.layout.openEditor` 缺失时自动回退到 `conversation.view`，无独立列。
