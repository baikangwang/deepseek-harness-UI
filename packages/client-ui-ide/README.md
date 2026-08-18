# dsh-client-ide-ui

ide-ui 的 **Client 半**（非官方社区插件）：统一左侧栏（资源管理器 / 搜索 / 源代码管理 / 会话管理）+ 编辑器标签页。纯展示层——文件 / git / 查找原语通过挂载 `dsh-ide-ui` 的 `ide` Remote（`ctx.remote.$mount(ideRemote)`）到达，会话 / 工作区数据来自框架的全局 `useSessions` / `useWorkspaces` 钩子。

- 注册到 `sidebar.workspaces`（`priority: -1` 占据整栏）。
- 编辑器注册进 `conversation.view` 的「编辑器」标签页（可分发，官方零修改）。

## Model Experience

None, as the sidebar and editor column are pure presentation over the `ide` Remote and framework slot hooks — they contribute no model-visible surface.

#### KV Cache effect

Independent: this package adds no model-request tokens, so it cannot invalidate a reusable KV-cache prefix.

## Known Limitations and Deferred Work

- **JSX / 样式封装** — 组件用 `createElement`（非 JSX）书写；样式在 `styles.module.css` 中全部以 `:global()` 包裹（类名保持字面量）。DSH 惯用法是 JSX + 语义 token 的 scoped CSS Modules——正规化清单见 `docs/refactor-plan-v4.md` §4。
- **注册边界 `as any`** — `ctx.slots.register` 的组件参数在注册点做了 `as any` 转换（组合 props 含 owner + framework shares）；组件内部 props 已按 `IdeSidebarProps` / `EditorViewProps` 强类型。
- **编辑器是 `conversation.view` 标签页** — 官方槽，可分发；与对话为时序切换（看编辑器时看不到聊天）。独立并排列需要壳扩展（改官方 ui-layout），不属于插件能力（`docs/refactor-plan-v4.md` §1）。
