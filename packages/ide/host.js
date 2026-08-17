/**
 * DSH Code — Host 能力层。
 *
 * 以动态 Cordis 插件的 Host 半身运行：提供 `ide.*` 私有 RPC（文件列表/读取、
 * git 状态/diff/stage/unstage/commit、工作区内容搜索）。所有能力都来自宿主服务，
 * 绝不自行拼 shell：
 *  - fs        -> ctx.get('fs')
 *  - git/rg    -> ctx.get('subprocess') 显式 argv
 *  - 工作区根  -> ctx.get('workspaceRegistry') / ctx.get('sandboxPolicy')
 *
 * 搜索优先走 ripgrep（`rg --json`，可用时），失败/缺失时回退到递归扫描。
 *
 * 正式化路径（P3）：把这里的 handler 抽成一个 `ctx.ide` Service，Client→Host 走
 * `ctx.remote`，`harness.handle` 仅保留给动态插件形态。
 */
export default {
  apply(ctx) {
    const fs = ctx.get('fs')
    const subprocess = ctx.get('subprocess')
    const workspaceRegistry = ctx.get('workspaceRegistry')
    const sandboxPolicy = ctx.get('sandboxPolicy')

    const str = (v) => (v == null ? '' : String(v))
    const root = () => (sandboxPolicy !== undefined && sandboxPolicy.workspaceRoot ? str(sandboxPolicy.workspaceRoot) : '')

    // 通用进程执行（显式 argv，无 shell 拼接）
    async function run(exe, cwd, args, maxBytes) {
      if (subprocess === undefined) return { ok: false, exitCode: null, stdout: '', stderr: 'subprocess service unavailable', spawnFailed: true }
      try {
        const bin = await subprocess.resolveExecutable(exe)
        const handle = subprocess.spawn({
          argv: [bin].concat(args.map(str)),
          cwd: cwd || root() || '.',
          stdio: {
            stdin: 'ignore',
            stdout: { maxBytes: maxBytes || 2 * 1024 * 1024, spill: { maxBytes: 8 * 1024 * 1024 } },
            stderr: { maxBytes: 128 * 1024 },
          },
          graceMs: 3000,
        })
        const outcome = await handle.done
        const out = handle.collected.stdout ? handle.collected.stdout.readFrom(0).text : ''
        const err = handle.collected.stderr ? handle.collected.stderr.readFrom(0).text : ''
        return { ok: outcome.exitCode === 0, exitCode: outcome.exitCode, stdout: out, stderr: err, spawnFailed: false }
      } catch (e) {
        return { ok: false, exitCode: null, stdout: '', stderr: e && e.message ? str(e.message) : str(e), spawnFailed: true }
      }
    }

    const git = (cwd, args) => run('git', cwd, args)
    const pwsh = (script, args) => run('pwsh', root(), ['-NoProfile', '-NonInteractive', '-Command', script].concat((args || []).map(str)))

    harness.handle('ide.roots', async () => {
      const workspaces = []
      if (workspaceRegistry !== undefined) {
        try {
          for (const w of workspaceRegistry.list()) {
            workspaces.push({ id: str(w.workspaceId), title: str(w.title), path: str(w.path) })
          }
        } catch (e) { /* ignore */ }
      }
      const root = sandboxPolicy !== undefined ? str(sandboxPolicy.workspaceRoot) : ''
      return { root, workspaces }
    })

    harness.handle('ide.listDir', async (args) => {
      if (fs === undefined) return { error: 'filesystem service unavailable' }
      const path = str(args && args.path)
      try {
        const target = await fs.resolve(path)
        const entries = await fs.listDir(target)
        const rows = entries.map((e) => ({
          name: e.name,
          type: e.type,
          path: str(e.target && e.target.displayPath),
          size: typeof e.size === 'number' ? e.size : null,
        }))
        rows.sort((a, b) => {
          const ad = a.type === 'directory' ? 0 : 1
          const bd = b.type === 'directory' ? 0 : 1
          if (ad !== bd) return ad - bd
          return a.name < b.name ? -1 : a.name > b.name ? 1 : 0
        })
        return { path: str(target.displayPath), entries: rows }
      } catch (err) {
        return { error: err && err.message ? str(err.message) : str(err), path }
      }
    })

    harness.handle('ide.readText', async (args) => {
      if (fs === undefined) return { error: 'filesystem service unavailable' }
      const path = str(args && args.path)
      const cap = args && args.maxBytes ? Number(args.maxBytes) : 400 * 1024
      try {
        const target = await fs.resolve(path)
        const info = await fs.stat(target)
        if (info !== undefined && info.type !== 'file') return { error: 'not a regular file', path }
        const text = await fs.readText(target)
        const truncated = text.length > cap
        return { path: str(target.displayPath), content: truncated ? text.slice(0, cap) : text, truncated, size: text.length }
      } catch (err) {
        return { error: err && err.message ? str(err.message) : str(err), path }
      }
    })

    harness.handle('ide.newFile', async (args) => {
      if (fs === undefined) return { error: 'filesystem service unavailable' }
      const path = str(args && args.path)
      try {
        const target = await fs.resolve(path)
        await fs.writeText(target, '', { kind: 'createIfAbsent' })
        return { ok: true, path: str(target.displayPath) }
      } catch (err) { return { error: err && err.message ? str(err.message) : str(err), path } }
    })

    harness.handle('ide.mkdir', async (args) => {
      const path = str(args && args.path)
      const d = await pwsh('New-Item -ItemType Directory -Force -Path $args[0] | Out-Null', [path])
      return { ok: d.ok, stderr: d.stderr, path }
    })

    harness.handle('ide.delete', async (args) => {
      const path = str(args && args.path)
      const d = await pwsh('Remove-Item -LiteralPath $args[0] -Recurse -Force', [path])
      return { ok: d.ok, stderr: d.stderr, path }
    })

    harness.handle('ide.rename', async (args) => {
      const from = str(args && args.from)
      const to = str(args && args.to)
      const d = await pwsh('Move-Item -LiteralPath $args[0] -Destination $args[1] -Force', [from, to])
      return { ok: d.ok, stderr: d.stderr, from, to }
    })

    harness.handle('ide.explore', async (args) => {
      const path = str(args && args.path)
      const select = !!(args && args.select)
      const argv = select ? ['/select,' + path] : [path]
      const d = await run('explorer.exe', root(), argv)
      return { ok: !d.spawnFailed, path }
    })

    harness.handle('ide.paste', async (args) => {
      const dest = str(args && args.dest)
      const script = '$files=@(Get-Clipboard -Format FileDropList);$out=@();foreach($f in $files){Copy-Item -LiteralPath $f -Destination $args[0] -Recurse -Force;$out+=(Split-Path $f -Leaf)};$out -join [char]10'
      const d = await pwsh(script, [dest])
      return { ok: d.ok, files: d.stdout.split('\n').filter(Boolean), stderr: d.stderr }
    })

    harness.handle('ide.git.status', async (args) => {
      const cwd = str(args && args.cwd)
      if (cwd === '') return { branch: '', changes: [], notRepo: true, error: 'no workspace directory' }
      const branch = await git(cwd, ['rev-parse', '--abbrev-ref', 'HEAD'])
      const st = await git(cwd, ['status', '--porcelain=v1', '-z', '--untracked-files=all'])
      if (!branch.ok) {
        return { branch: '', changes: [], notRepo: true, error: (branch.stderr || '').trim() || 'not a git repository' }
      }
      if (!st.ok) {
        return { branch: branch.stdout.trim(), changes: [], notRepo: false, error: (st.stderr || '').trim() }
      }
      return { branch: branch.stdout.trim(), changes: parseStatus(st.stdout), notRepo: false, error: '' }
    })

    function parseStatus(stdout) {
      const out = []
      const parts = stdout.split('\0')
      let i = 0
      while (i < parts.length) {
        const rec = parts[i]; i++
        if (rec == null || rec === '' || rec.length < 4) continue
        const xy = rec.slice(0, 2)
        const p = rec.slice(3)
        const staged = xy[0] === ' ' ? '' : xy[0]
        const unstaged = xy[1] === ' ' ? '' : xy[1]
        if (xy[0] === 'R' || xy[0] === 'C') {
          const from = (i < parts.length) ? (parts[i] || '') : ''
          if (i < parts.length) i++
          out.push({ xy, path: p, renameFrom: from, staged, unstaged })
        } else {
          out.push({ xy, path: p, renameFrom: '', staged, unstaged })
        }
      }
      return out
    }

    harness.handle('ide.git.diff', async (args) => {
      const cwd = str(args && args.cwd)
      const path = str(args && args.path)
      const argv = path ? ['diff', 'HEAD', '--', path] : ['diff', 'HEAD', '--stat']
      const d = await git(cwd, argv)
      return { stdout: d.stdout, ok: d.ok, stderr: d.stderr, path }
    })

    harness.handle('ide.git.stage', async (args) => {
      const cwd = str(args && args.cwd)
      const paths = (args && args.paths && args.paths.length) ? args.paths.map(str) : []
      if (paths.length === 0) return { ok: false, stderr: 'no paths' }
      const d = await git(cwd, ['add', '--'].concat(paths))
      return { ok: d.ok, stdout: d.stdout, stderr: d.stderr }
    })

    harness.handle('ide.git.unstage', async (args) => {
      const cwd = str(args && args.cwd)
      const paths = (args && args.paths && args.paths.length) ? args.paths.map(str) : []
      if (paths.length === 0) return { ok: false, stderr: 'no paths' }
      const d = await git(cwd, ['reset', '-q', '--'].concat(paths))
      return { ok: d.ok, stderr: d.stderr }
    })

    harness.handle('ide.git.stageAll', async (args) => {
      const cwd = str(args && args.cwd)
      const d = await git(cwd, ['add', '-A'])
      return { ok: d.ok, stderr: d.stderr }
    })

    harness.handle('ide.git.unstageAll', async (args) => {
      const cwd = str(args && args.cwd)
      const d = await git(cwd, ['reset', '-q', 'HEAD'])
      return { ok: d.ok, stderr: d.stderr }
    })

    harness.handle('ide.git.discard', async (args) => {
      const cwd = str(args && args.cwd)
      const path = str(args && args.path)
      const untracked = !!(args && args.untracked)
      if (path === '') return { ok: false, stderr: 'no path' }
      if (untracked) {
        const d = await pwsh('Remove-Item -LiteralPath $args[0] -Recurse -Force', [path])
        return { ok: d.ok, stderr: d.stderr, path }
      }
      const d = await git(cwd, ['checkout', '--', path])
      return { ok: d.ok, stderr: d.stderr, path }
    })

    harness.handle('ide.git.commit', async (args) => {
      const cwd = str(args && args.cwd)
      const message = str(args && args.message).trim()
      if (message === '') return { ok: false, stderr: 'empty commit message' }
      const d = await git(cwd, ['commit', '-m', message])
      return { ok: d.ok, stdout: d.stdout, stderr: d.stderr }
    })

    harness.handle('ide.search', async (args) => {
      if (fs === undefined) return { error: 'filesystem service unavailable', matches: [], files: 0, truncated: false }
      const cwd = str(args && args.cwd)
      const query = str(args && args.query)
      const caseSensitive = !!(args && args.caseSensitive)
      if (query === '' || cwd === '') return { error: '', matches: [], files: 0, truncated: false }

      // 快路径：ripgrep（可用时）
      if (subprocess !== undefined) {
        const rgArgs = ['--json', '--no-config', '--line-number', '-e', query,
          '--glob', '!**/node_modules/**', '--glob', '!**/.git/**', '--glob', '!**/dist/**', '--glob', '!**/build/**',
          caseSensitive ? '--case-sensitive' : '--ignore-case']
        const rg = await run('rg', cwd, rgArgs)
        if (!rg.spawnFailed && (rg.exitCode === 0 || rg.exitCode === 1)) {
          const matches = []
          for (const line of rg.stdout.split('\n')) {
            if (line === '') continue
            try {
              const obj = JSON.parse(line)
              if (obj && obj.type === 'match' && obj.data) {
                matches.push({ path: str(obj.data.path && obj.data.path.text), line: obj.data.line_number, text: str(obj.data.lines && obj.data.lines.text).slice(0, 240) })
              }
            } catch (e) { /* skip */ }
          }
          const truncated = matches.length > 200
          return { error: '', matches: matches.slice(0, 200), files: new Set(matches.map((m) => m.path)).size, truncated }
        }
      }

      // 回退：递归扫描
      const q = caseSensitive ? query : query.toLowerCase()
      const matches = []
      let files = 0
      let truncated = false
      const MAX_FILES = 400
      const MAX_MATCHES = 200
      const SKIP = new Set(['.git', 'node_modules', 'dist', 'build', 'out', 'target', 'coverage', '.next', '.dsh', '.agent-presets', '__pycache__', '.venv', 'venv', '.idea', '.vscode'])

      async function walk(target) {
        if (truncated || files >= MAX_FILES || matches.length >= MAX_MATCHES) return
        let entries
        try { entries = await fs.listDir(target) } catch (e) { return }
        for (const e of entries) {
          if (truncated || files >= MAX_FILES || matches.length >= MAX_MATCHES) return
          if (SKIP.has(e.name)) continue
          if (e.name.length > 0 && e.name[0] === '.') continue
          if (e.type === 'directory') {
            await walk(e.target)
          } else if (e.type === 'file') {
            if (typeof e.size === 'number' && e.size > 256 * 1024) continue
            files++
            let text
            try { text = await fs.readText(e.target) } catch (err) { continue }
            if (text.indexOf('\0') !== -1) continue
            const lines = text.split(/\r?\n/)
            for (let li = 0; li < lines.length; li++) {
              const line = lines[li]
              const hay = caseSensitive ? line : line.toLowerCase()
              if (hay.indexOf(q) !== -1) {
                matches.push({ path: str(e.target.displayPath), line: li + 1, text: line.length > 240 ? line.slice(0, 240) : line })
                if (matches.length >= MAX_MATCHES) { truncated = true; break }
              }
            }
          }
        }
      }

      try {
        const rootTarget = await fs.resolve(cwd)
        await walk(rootTarget)
      } catch (err) {
        return { error: err && err.message ? str(err.message) : str(err), matches, files: new Set(matches.map((m) => m.path)).size, truncated }
      }
      return { error: '', matches, files: new Set(matches.map((m) => m.path)).size, truncated }
    })
  },
}
