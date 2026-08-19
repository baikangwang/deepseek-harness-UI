# dsh-ide-ui 架构设计

> 社区非官方 DSH 插件：把「文件浏览、源码管理、全文搜索、会话管理」收敛进一个
> VSCode 风格左栏，并为 Markdown 文档提供带 KaTeX 的渲染预览。单包、双面
> （Host 能力 + 浏览器 UI），全部通过官方声明的槽位组合，零官方源码修改。

- 当前版本：`0.1.0-rc.18`
- 包名：`dsh-ide-ui`（`packages/ide`）
- 形态：一个 npm 包，Host 半导出 `IdeService`（`ide` Remote），Client 半声明
  `dsh.client.platform: web` 被浏览器发现。

---

## 1. 总体架构

```
┌─ Host 进程（Node）────────────────────────────────┐
│  dsh-ide-ui/lib/index.js                           │
│  IdeService extends Remote('ide')                  │
│    ├─ fs        : ctx.fs（readText/listDir/…）      │
│    ├─ git       : ctx.subprocess.spawn(显式 argv)   │
│    ├─ search    : ripgrep 快路径 → 递归扫描回退      │
│    └─ 系统操作   : explorer.exe / 剪贴板粘贴         │
└────────────────────────────────────────────────────┘
        ▲ ide.* JSON RPC（Client→Host，私有 namespace）
        │
┌─ 浏览器（Client）──────────────────────────────────┐
│  dsh-ide-ui/lib/client.js（CJS bundle）            │
│  apply():                                          │
│    ctx.remote.$mount(ideRemote)                    │
│    ctx.slots.inject('sidebar.workspaces', …)  ← 左栏 │
│    ctx.slots.inject('conversation.view', …)  ← 编辑器 │
└────────────────────────────────────────────────────┘
```

数据归属决定代码落点：只有 Host 拥有文件系统与进程能力，读文件 / git / 搜索全在
Host；Client 只做展示与调用，通过 `ctx.remote.$mount` 挂载的 `ide` namespace 发
RPC，只透传叶子字段（`name/type/path/size`），不序列化活对象。

### 关键约束（决定方案的硬事实）

- 浏览器半由官方 `window.__ModuleLoader__.load({ id, factory })` 加载，**不能
  `require` 任意 npm 包**；组件全部用 `React.createElement` + 自绘 SVG + 主题
  token 实现，UI 依赖（react/react-dom）标记 `neverBundle` 由官方运行时提供。
- 槽位系统 `register` 校验同一子槽不允许多个 entry 以相同优先级声明；同优先级
  重复会抛 `slot "X" already has a registration at priority 0`。因此接管原生会话
  浏览器用**更低优先级遮蔽**（`priority: -1`），而不是替换再重声明。

## 2. 构建（tsdown 自包含，三产物）

`packages/ide/tsdown.config.ts` 定义三个产物，全部 `clean: false` 增量输出：

| 产物 | 入口 | 说明 |
|---|---|---|
| `lib/index.js`（ESM, node） | `src/index.ts` | Host 半，`IdeService`；标准 `@Remote` 装饰器必须降级 |
| `lib/invariant.js`（ESM, node） | `src/invariant.ts` | 无装饰器的独立小模块 |
| `lib/client.js`（CJS, browser） | `src/client/index.ts` | 浏览器半，ModuleLoader 闭包 bundle |

三个必须注意的机制：

1. **装饰器降级**：rolldown/oxc 会保留原生 `@dec` 语法，Node ESM loader 无法解析。
   `lowerDecorators` 插件对含 `@` 的 `.ts` 用 `typescript.transpileModule` 重放 tsc
   的 `__esDecorate` 降级，产出合法 Node ESM。仅 `@deepseek-ai/dsh-typert-protocol`
   保持外部（运行时 peer），其余 `@deepseek-ai/*` 均为 type-only（编译期擦除）。
2. **CSS 注入**：rolldown 1.2.4 起不再打包 CSS。`cssInject` 插件把 `.module.css`
   读成字符串，虚拟模块在运行时注入 `<style data-plugin-css="dsh-ide-ui/styles">`
   （幂等，重复加载不重复注入）；非 module CSS（如 katex）stub 为空——浏览器已由
   官方前端样式表加载。
3. **ModuleLoader 闭包**：client 产物用 banner/footer 包裹
   `window.__ModuleLoader__.load({ id: "dsh-ide-ui", factory: (require) => { … } })`，
   浏览器按 `id` 注册并执行。

Typert 产物（`lib/typert.host.*`、`lib/typert.remote-client.*`）是提交在仓库的
构建产物，仅在 `@Remote` 面变化时重新生成。

## 3. 槽位策略

| 槽位 | 类型 | 注册方式 | 效果 |
|---|---|---|---|
| `sidebar.workspaces` | single | `priority: -1`，**不声明任何子槽** | 更低优先级先渲染，遮蔽原生会话浏览器；logo、折叠 / rail、底部设置等 shell 全部保留 |
| `conversation.view` | tab | `id: 'editor'`, `order: 20`, `label: '编辑器'` | 打开文件后中栏出现编辑器标签页，官方可分发 |

`remote.ide` 是插件自己 `$mount` 提供的 namespace，**不能出现在 `inject` 声明里**
（自供 namespace 会让 fiber 在 apply 前就 park），必须 apply 内
`ctx.get('remote.ide')` 读取——与 `dsh-api-remotes` 的挂载/消费约定一致。

## 4. RPC 契约（`ide.*`）

| 方法 | 入参 | 出参 | 说明 |
|---|---|---|---|
| `roots` | — | `{ root, workspaces[] }` | 沙箱工作区根 + 注册的工作区 |
| `listDir` | `path` | `{ path, entries[] }` | 单层目录，目录优先按名排序 |
| `readText` | `path` | `{ path, content, truncated, size } \| error` | 只读文本，默认 400KB 截断 |
| `newFile` / `mkdir` | `path` | `{ ok, … }` | 新建空文件 / 目录 |
| `delete` / `rename` | `path` / `from,to` | `{ ok, stderr }` | `Remove-Item` / `Move-Item` |
| `explore` | `path, select?` | `{ ok, path }` | `explorer.exe /select,<path>` |
| `paste` | `dest` | `{ ok, files[], stderr }` | 剪贴板 FileDropList 复制 |
| `gitStatus` | `cwd` | `{ branch, changes[], notRepo, error }` | `git status --porcelain=v1 -z` |
| `gitStatusMap` | `cwd` | `{ branch, files{}, ignoredDirs[], notRepo, error }` | 全仓库 path→状态映射（含 ignored），供资源管理器 VSCode 风格装饰 |
| `gitDiff` | `cwd, path?` | `{ stdout, stderr, ok }` | `git diff HEAD -- <path>`（暂存+未暂存） |
| `gitStage`/`gitUnstage`/`gitStageAll`/`gitUnstageAll` | `cwd, paths?` | `{ ok, stderr }` | `git add` / `git reset` |
| `gitDiscard` | `cwd, path, untracked` | `{ ok, stderr }` | 未跟踪删除；否则 `git checkout --` |
| `gitCommit` | `cwd, message` | `{ ok, stdout, stderr }` | `git commit -m` |
| `search` | `cwd, query, caseSensitive?` | `{ matches[], files, truncated, error }` | rg `--json` 快路径 + 递归扫描回退（≤400 文件 / 200 命中） |

git 一律走 `ctx.subprocess.spawn({ argv, cwd, stdio })`，**不经 shell 拼接**，
规避 Windows 引号语义差异与命令注入面。

## 5. 组件拆解（Client）

| 文件 | 职责 |
|---|---|
| `index.ts` | apply：挂 remote、建 store、注册两个槽位 |
| `IdeSidebar.tsx` | `sidebar.workspaces` occupant，活动栏 + 内容区 + rail 态 |
| `views.tsx` | Explorer / Tree / Search / SCM / Session 五个视图 |
| `EditorView.tsx` | `conversation.view` 编辑器：tab 切换 + 预览/源码开关 |
| `markdown.tsx` | 自包含 mdast→React 渲染器 + KaTeX（GFM 表/任务列表） |
| `icons.tsx` | 官方 `ic_ds_*` 菜单字形（18px） |
| `fileicons.ts` | 文件类型图标（见 §8 图标设计原理） |
| `stores.ts` / `lib.ts` | 编辑器 tab store / RPC 封装 |

## 6. 功能清单（rc.18）

- **资源管理器**：工作区目录树（懒加载、隐藏文件开关、drag-drop 移动）、新建/
  重命名/删除/在资源管理器打开、只读预览带行号。
- **Git 状态装饰**（VSCode 风格）：文件/目录图标叠加状态点——已修改（右下橙点）、
  未跟踪（右上灰点）、已暂存（左上绿点）、冲突（红点）；忽略文件半透明。
  目录状态由子文件冒泡聚合（折叠目录也能看到变更）。来源：`ide.gitStatusMap`
  （`git status --porcelain=v1 -z` + `--ignored` 目录级聚合，ignored 上限 3000 条）。
- **全文搜索**：rg 快路径，失败回退递归扫描；点击跳预览。
- **源代码管理**：分支 + 三组变更（暂存/未暂存/未跟踪）、diff 着色、
  stage/unstage/stage all/丢弃/提交。
- **会话管理**：原生对齐的会话/项目行（状态点、相对时间）、搜索/派生/归档、
  **展开状态持久化**（`localStorage` `dshide.session.expanded.v1`）。
- **编辑器**：`conversation.view` 标签页，多文档 tab；Markdown 默认预览模式，
  预览/源码切换；**Markdown 渲染**支持 GFM 表格、任务列表、KaTeX 数学公式，
  预览宽度 1100px、侧边距 28px。
- **文件图标**：CodeBuddy genie 图标集（详见 §8），20px。
- **菜单图标**：官方 DSH `ic_ds_*` 风格，18px。

## 7. 数据流

```
用户点击活动图标
  └─ IdeSidebar.setActive(view)
       ├─ Explorer/Search/SCM: host.call('ide.*') → Host fs/git/subprocess → JSON → React 渲染
       └─ Sessions: sessions/workspaces 快照 → 本地渲染 → sessions.open / workspaces.startSession
打开文件 → store.add(tab) + clickTabNow('编辑器') → EditorView 渲染（md → Preview）
```

## 8. 图标设计原理

文件图标的目标是「看起来就是 VSCode / CodeBuddy 的文件图标」，采用与 VSCode
完全相同的渲染方式：**图标字体 + 私有区码点 + 每类型颜色**。

### 8.1 为什么不用 SVG

VSCode 文件图标是 seti 家族的**图标字体**（每个字形一个私有区码点），不是 SVG。
早期尝试从 `codicon.ttf` 手工抽取字形转 SVG 失败：TTF 的二次贝塞尔 off-curve
点、复合字形、异常坐标（如 `-6035`）导致多边形破碎成乱线黑块。结论：**字体怎么
渲染，我们就怎么渲染**——直接嵌入字体文件，零几何运算。

### 8.2 字体嵌入与字形解码

- `genie.woff`（CodeBuddy 的 seti 家族字体，37KB）以 base64 嵌入
  `fileicons.ts` 的 `FONT_B64`，运行时注入
  `@font-face{font-family:"dshide-fileicons";src:url(data:font/woff;base64,…)}`。
- 主题 JSON 中每个图标定义是 `{ fontCharacter: "\\E023" }` —— 这是一个 **CSS
  转义字符串**，不是 Unicode 字符。浏览器只在 CSS `content` 里解释它，React
  文本节点会原样显示 `\E0??`。因此渲染前必须解码：`/^\\([0-9A-Fa-f]{1,6})\s?$/`
  → `String.fromCharCode(parseInt(hex, 16))` 得到真实码点（U+E023，私有区
  U+E000–U+F8FF），再交给字体渲染。
  - 陷阱：`\E023` 中的 **E 是十六进制码点的一部分**（U+E023），不是字面前缀，
    正则必须匹配「反斜杠 + 1–6 位 hex」而非「反斜杠 + 字面 E + 2–4 位 hex」。

### 8.3 三层映射（与 VSCode 一致）

VSCode 图标主题按 **文件名 → 扩展名 → 语言 ID** 依次查找，genie 主题的数据也
分三张表，`fileIconKey()` 复刻该顺序：

1. **fileNames**（101 条）：精确文件名优先，如 `readme.md → _info`、
   `vite.config.ts → _vite`、`tsconfig.json` 按用户要求移除（统一走 json 图标）。
2. **fileExtensions**（239 条）：扩展名 → 图标，如 `docx → _word`、`xlsx → _xls`、
   `bsl → _bsl`。
3. **languageIds**（78 条）：语言 ID → 图标，如 `typescript → _typescript`、
   `json → _json`。VSCode 靠语言服务把 `.ts` 识别为 `typescript` 再查表，而前端
   只能拿到扩展名，因此生成时把每个语言 ID 展开成**常见扩展名**补进扩展名表
   （只补缺失键，主题原有映射优先）：`ts → _typescript`、`js → _javascript`、
   `json → _json`、`md → _markdown`、`py → _python`、`jsx/tsx → _react`、
   `sh → _shell`…… 扩展名表因此从 239 增到 335 条。

颜色取自主题 JSON 的 `fontColor`（深色变体），未着色时回退到
`--dsw-alias-label-secondary`。未覆盖类型（如 `.txt`）落到 `_default` 默认文档
图标——与 VSCode 行为一致。生成脚本 `scripts/gen-fileicons-map.mjs` 从
CodeBuddy 安装目录的 `genie_icon_theme.json` 重新生成映射，并校验全部映射值都
存在于 `ICONS`（383 个字形定义），0 缺失才通过。

### 8.4 尺寸

- 文件/文件夹图标 **20px**（32px 行高内居中；16px 时 seti 细线字形难以辨认）。
- 菜单图标沿用官方 `ic_ds_*` **18px**。

## 9. 部署与验证

见 `docs/deployment.md`。核心流程：`tsc --noEmit` → `tsdown` → bump 版本 →
`npm pack` → 解包替换 profile `node_modules/dsh-ide-ui` → 更新 profile
`package.json` 依赖指向新 tgz → `scripts/verify-ide-plugin.ps1`（28 项检查全绿）
→ 重启 dsh web。浏览器半改动刷新页面即可生效。
