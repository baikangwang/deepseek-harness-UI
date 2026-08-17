/**
 * DSH Code — Host 能力层。
 *
 * 以动态 Cordis 插件的 Host 半身运行：提供 `ide.*` 私有 RPC（文件列表/读取、
 * git 状态/diff、工作区内容搜索）。所有能力都来自宿主服务，绝不自行拼 shell：
 *  - fs        -> ctx.get('fs')
 *  - git       -> ctx.get('subprocess') 显式 argv
 *  - 工作区根  -> ctx.get('workspaceRegistry') / ctx.get('sandboxPolicy')
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

    // ---- 工作区根 ----
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

    // ---- 单层目录 ----
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

    // ---- 只读文本（预览） ----
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

    // ---- git（subprocess 显式 argv） ----
    async function git(cwd, args) {
      if (subprocess === undefined) return { ok: false, exitCode: null, stdout: '', stderr: 'subprocess service unavailable' }
      try {
        const exe = await subprocess.resolveExecutable('git')
        const handle = subprocess.spawn({
          argv: [exe].concat(args.map(str)),
          cwd,
          stdio: {
            stdin: 'ignore',
            stdout: { maxBytes: 2 * 1024 * 1024, spill: { maxBytes: 8 * 1024 * 1024 } },
            stderr: { maxBytes: 128 * 1024 },
          },
          graceMs: 3000,
        })
        const outcome = await handle.done
        const out = handle.collected.stdout ? handle.collected.stdout.readFrom(0).text : ''
        const err = handle.collected.stderr ? handle.collected.stderr.readFrom(0).text : ''
        return { ok: outcome.exitCode === 0, exitCode: outcome.exitCode, stdout: out, stderr: err }
      } catch (e) {
        return { ok: false, exitCode: null, stdout: '', stderr: e && e.message ? str(e.message) : str(e) }
      }
    }

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

    // ---- 工作区内容搜索（递归扫描，有界） ----
    harness.handle('ide.search', async (args) => {
      if (fs === undefined) return { error: 'filesystem service unavailable', matches: [], files: 0, truncated: false }
      const cwd = str(args && args.cwd)
      const query = str(args && args.query)
      const caseSensitive = !!(args && args.caseSensitive)
      if (query === '' || cwd === '') return { error: '', matches: [], files: 0, truncated: false }
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
        return { error: err && err.message ? str(err.message) : str(err), matches, files, truncated }
      }
      return { error: '', matches, files, truncated }
    })
  },
}
