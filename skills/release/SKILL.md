---
name: release
description: 发布 DSH 相关包——读取项目版本、自动打 tag 并触发该仓库的 GitHub Actions 打包（构建 → tgz → 离线 zip → GitHub Release）。使用前必须向用户确认。
---

# release：DSH 包发布

## 何时使用

用户表达"发布 / 打包 / release / 发版"意图时。**不用于**日常开发推送（普通
`git push` 不触发任何构建）。

## 架构（三层）

| 层 | 载体 | 位置 |
|---|---|---|
| 操作层 | 本 skill | agent 预设的 skills/release/ |
| 执行层 | `dsh-release.mjs` | 仓库根 `scripts/dsh-release.mjs`（跨项目复用，幂等） |
| CI 层 | 各仓库自己的 `release.yml` | `.github/workflows/release.yml`（由执行层按模板生成/覆盖，勿手改） |

每个项目根目录放 `dsh-release.json`（进 git），字段：

```jsonc
{
  "packageDir": "packages/ide",     // package.json 所在目录（版本来源）
  "packageName": "dsh-ide-ui",      // 包名（决定 tgz / zip 命名）
  "tagPrefix": "v",                 // tag 前缀
  "offline": true,                  // 是否生成离线安装包
  "offlineScript": "scripts/build-offline-package.ps1",
  "typecheck": "pnpm typecheck",    // 缺省/空 = 跳过该步骤
  "build": "pnpm build",
  "npm": false,                     // true 且配了 NPM_TOKEN 才 npm publish
  "pnpmVersion": 11
}
```

无配置文件时脚本自动探测（有 `dsh.client` / `dependencies.zod` / `dsh-` 前缀的
package.json）；探测不到则要求提供。

## 工作流（agent 步骤）

1. **定位项目根**：找 `dsh-release.json`；否则找含 dsh 特征的 `package.json`。
   多项目时让用户指定 `--root`。
2. **读取版本**：`node <root>/scripts/dsh-release.mjs --root <root> --dry-run`
   ——输出项目、版本、tag 状态、workflow 状态（create/keep/overwrite）。若
   `dsh-release.mjs` 缺失（新项目），从本 skill 的模板生成（见下）。
3. **前置检查**：
   - `package.json` 版本是否已 bump（对比上次 tag，可用 dry-run 输出判断）；
   - 工作区是否有未提交改动（`git status --porcelain`，若有提醒但不阻塞）；
   - git 凭据/代理可用（Windows 沙箱下 git 可能需完整访问权限）。
4. **确认（必须）**：向用户展示摘要并询问，例如：
   > 将发布 `dsh-ide-ui 0.1.0-rc.20`：自动打 tag `v0.1.0-rc.20` 并推送，
   > 触发该仓库 release workflow（构建 → tgz → 离线 zip → GitHub Release）。
   > 确认吗？
   用户拒绝 → 停止，不做任何操作。
5. **执行**：`node <root>/scripts/dsh-release.mjs --root <root> --yes`
   （`--yes` 跳过脚本自身确认——agent 已在第 4 步取得用户同意，避免双重询问）。
   沙箱拒绝（EPERM）时，以完整访问权限重跑同一命令。
6. **验证并汇报**：
   - 脚本输出 tag 推送成功；
   - 如有 `gh`/网络：`gh api repos/<owner>/<repo>/actions/workflows` 或
     Actions 页面确认 run 已触发；
   - 汇报：tag、workflow run 状态、产物将挂到 Release 页面。

## 幂等性（重复执行安全）

| 对象 | 已存在 | 不存在 |
|---|---|---|
| `v<版本>` tag | 跳过创建（`--force` 才强制重建并重发） | 自动创建 + 推送 |
| `release.yml` | 与模板一致 → keep；不一致 → **覆盖**（dsh-release.json 是真相来源） | 自动生成 |
| GitHub Release | workflow 内复用并更新附件（clobber） | workflow 内自动创建 |

## 新项目接入（幂等自举）

1. 把 `dsh-release.json`（改包目录/包名/命令）和 `scripts/dsh-release.mjs`
   （从任意已有项目复制）放进新项目；
2. 跑一次发布流程——workflow 缺失会自动生成并提交推送；
3. 之后每次发布走同一流程。

## 故障排查

| 现象 | 处理 |
|---|---|
| `spawnSync git EPERM` | 沙箱限制 git 子进程，用完整访问权限重跑 |
| `推送 ... 失败: ...` | git 凭据（Windows wincred 需完整权限）或代理（xray 等）未就绪 |
| `tag 已存在` | 同版本重复发布用 `--force`（会删除远程 tag 重建，谨慎） |
| workflow 提交后 Actions 没反应 | 确认 workflow 在默认分支；触发条件是 `v*` tag 推送，普通 push 不触发 |
| 生成产物里没有离线 zip | 配置 `offline: true` + `offlineScript` 指向真实脚本 |
