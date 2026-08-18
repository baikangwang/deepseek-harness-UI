# deepseek-harness-UI：重构方案 v5（原生验证通过，X 定案）

> 在 `refactor-plan-v4.md` 基础上，按用户要求完成**原生 DSH 实证验证**（备份补丁 → 切回原生 → 重打包）。

## 0. 验证结果（在原生官方 DSH 上实证，非分析）

| 步骤 | 结果 |
|---|---|
| 备份：#6/#7 补丁 + 插件 → 分支 `backup/host-patches-v1`（`563c63f29f`） | ✅ |
| 切回原生：`verify/native` 分支 = `origin/master`（99f6f02fec） | ✅ |
| Host 面 `tsc -b tsconfig.host.json` | ✅ exit 0 |
| Host 面 `tsdown host`（Typert 代码生成） | ✅ `typert.host.js` / `typert.remote-client.js` 产出 |
| Client 面 `tsc -b tsconfig.client.json` | ✅ exit 0（修复后） |
| Client 面 `tsdown client`（bundle） | ✅ `lib/client.js` 215KB |

**结论：X 版插件（编辑器 = `conversation.view` 标签页）在干净官方 DSH 上完整构建通过。** 之前不能构建是配置/类型问题，已修复，与官方补丁无关：

1. **TS6059 rootDir**：client tsconfig `references` 缺少跨包类型导入拉进的包（对齐官方 ui-trajectory：补 `../locale` / `../ui-conversation` / `../ui-sidebar` / `../web-react`）。
2. **模块解析**：新工作区包需 `pnpm install`（`--ignore-scripts`，postinstall 的 lefthook 在沙箱 spawn 边界失败，不影响链接）。
3. **strict 类型**：branded `SessionId`/`WorkspaceId` cast、`noUncheckedIndexedAccess` 守卫（`tabs[i]`/`byId[id]`/`KW[lang]`/`line[i]`）、`exactOptionalPropertyTypes`（`root?: string | undefined`、`cwd` 条件展开、`snippet` 条件展开）、`visible` 改类型守卫、`body` 联合类型。

## 1. 定案

- **编辑器 = `conversation.view` 标签页**（X），官方零修改、可编译、可分发。`dsh plugin add` 挂载。
- **无壳依赖**：`ctx.layout.openEditor` / `editor` 槽全部移除。补丁分支仅作历史备份（`backup/host-patches-v1`）。
- 独立并排列**不属于插件能力**（官方契约硬边界，v4 §1 保留）。

## 2. 剩余（发布前）

- 发布锁 rc tag（`workspace:*` → `0.1.0-rc.7`）。
- 正规化（v4 §4）：JSX / scoped CSS Modules / 注册强类型。
- 运行时验证：部署到真实 Web profile 走 `dsh plugin add`，浏览器实测标签页切换与 RPC。
