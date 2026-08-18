# @deepseek-ai/dsh-client-ui-ide

deepseek-harness-UI 的 **Client 面**：统一左侧栏（资源管理器 / 搜索 / 源代码管理 / 会话管理）+ 独立编辑器列。纯展示层——文件 / git / 查找原语通过挂载自己的 `ide` Remote（`ctx.remote.$mount(ideRemote)`）到达，会话 / 工作区数据来自框架的全局 `useSessions` / `useWorkspaces` 钩子。

- 注册到 `sidebar.workspaces`（`priority: -1` 占据整栏）。
- 布局有 `ctx.layout.openEditor` 时注册进 `editor` 槽，否则回退到 `conversation.view` 的「编辑器」标签页。

## Model Experience

None, as the sidebar and editor column are pure presentation over the `ide` Remote and framework slot hooks — they contribute no model-visible surface.

#### KV Cache effect

Independent: this package adds no model-request tokens, so it cannot invalidate a reusable KV-cache prefix.

## Known Limitations and Deferred Work

- **JSX / 样式封装** — 组件用 `createElement`（非 JSX）书写；样式在 `styles.module.css` 中全部以 `:global()` 包裹（类名保持字面量），未做 scoped 哈希。DSH 惯用法是 JSX + 语义 token 的 scoped CSS Modules。
- **注册边界 `as any`** — `ctx.slots.register` 的组件参数在注册点做了 `as any` 转换（组合 props 含 owner + framework shares）；组件内部 props 已按 `IdeSidebarProps` / `EditorViewProps` 强类型。完整 SlotMap 强类型注册是后续项。
- **编辑器列依赖 #6 四列补丁** — `ctx.layout.openEditor` 缺失时自动回退到 `conversation.view`，无独立列。
