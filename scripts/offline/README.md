# dsh-ide-ui 离线安装包

无需编译环境（不需要 TypeScript / tsdown / pnpm / 源码仓库），直接把预编译好的
插件装进本地 DSH profile。

## 包内容

```
dsh-ide-ui-offline-<版本>.zip
├── install-dsh-ide-ui.ps1      # 一键安装脚本
├── dsh-ide-ui-<版本>.tgz       # 预编译插件（Host + Client 双面）
└── README.md                   # 本文件
```

## 前提

- Windows（PowerShell 5.1+）
- 已安装 DSH web（`npx @deepseek-ai/dsh web` 能启动）——运行 dsh 本身就需要 Node.js
- `tar` 命令（Windows 10 1803+ / Windows 11 自带）
- **不需要**任何编译工具链

## 安装（3 步）

1. 解压 `dsh-ide-ui-offline-<版本>.zip` 到任意目录；
2. 在该目录打开 PowerShell，运行：
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\install-dsh-ide-ui.ps1
   ```
   （默认装到 `~/.dsh/profiles/web`；其他 profile 用 `-ProfileName <名字>`）
3. **完全重启 dsh web**（刷新浏览器不够，Host 半需要进程重载）：
   ```powershell
   Get-NetTCPConnection -LocalPort 3080 | Select-Object OwningProcess
   Stop-Process -Id <PID> -Force
   npx @deepseek-ai/dsh web --port 3080
   ```

浏览器打开 http://127.0.0.1:3080 即可看到 VSCode 风格侧栏（建议开新会话测试）。

## 脚本做了什么

| 步骤 | 动作 |
|---|---|
| 备份 | 旧安装移到 `node_modules\dsh-ide-ui.bak-<时间戳>`（`-Force` 则直接覆盖） |
| 解包 | `tar -xf` tgz 到临时目录，复制 `lib/` + `package.json` 到 `node_modules\dsh-ide-ui` |
| 依赖 | profile `package.json` 的 `dependencies['dsh-ide-ui']` 指向本 tgz（`file:` 绝对路径） |
| 激活 | `cordis.patch.yml` 写入 `- id: ide-ui / name: 'dsh-ide-ui'`（幂等，已有则跳过） |
| 校验 | 检查 host `IdeService`、client bundle id、槽位注册 |

## 升级 / 卸载

- **升级**：把新版 zip 里的 tgz + install.ps1 放到同一目录再跑一次脚本即可（自动备份旧版）。
- **卸载**：删除 `node_modules\dsh-ide-ui`，把 `cordis.patch.yml` 里的
  `- id: ide-ui` 行删掉（或整行注释），然后重启 dsh web。

## 常见问题

| 现象 | 处理 |
|---|---|
| `找不到 dsh-ide-ui-*.tgz` | tgz 与脚本必须在同一目录 |
| `profile 不存在` | 用 `-ProfileName` 指定实际 profile 名 |
| 装完没变化 | 确认已**完全重启** dsh web 进程；浏览器 Ctrl+F5 强刷 |
| 想回退旧版 | 把备份目录 `.bak-<时间戳>` 改回 `node_modules\dsh-ide-ui` 再重启 |
