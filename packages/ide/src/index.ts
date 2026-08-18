/**
 * ide-ui — Host half: the `ide` Remote namespace.
 *
 * A single `TypertRemoteService` (registered as `ide`) exposes the file /
 * git / search primitives the browser client (the sidebar and editor column)
 * reaches through `ctx.remote.ide`. Every capability comes from Host services
 * — never hand-rolled shell:
 *   - fs                -> this.ctx.fs
 *   - git / ripgrep     -> this.ctx.subprocess (explicit argv)
 *   - workspace roots   -> this.ctx.workspaceRegistry / this.ctx.sandboxPolicy
 *
 * Methods throw on failure (the Remote layer wraps a throw into a
 * RemoteResult error), mirroring the DSH convention that a Remote is either a
 * clean value or a typed failure.
 */
import type { Context } from '@deepseek-ai/cordis'
import { TypertRemoteService, Remote } from '@deepseek-ai/dsh-typert-protocol'
import type {
  GitChange, GitDiffResult, GitStatusResult, ListDirResult, ReadTextResult,
  RootsResult, SearchMatch, SearchResult, WorkspaceRef,
} from './types.ts'
// Type-only: resolve the injected Host service augmentations
// (ctx.fs / ctx.subprocess / ctx.workspaceRegistry / ctx.sandboxPolicy).
import type { FsDirEntry, FsTarget } from '@deepseek-ai/dsh-fs'
import type {} from '@deepseek-ai/dsh-fs'
import type {} from '@deepseek-ai/dsh-subprocess'
import type {} from '@deepseek-ai/dsh-workspace'
import type {} from '@deepseek-ai/dsh-sandbox-policy'

/** Subprocess outcome from the `subprocess` service. */
interface RunResult {
  ok: boolean
  exitCode: number | null
  stdout: string
  stderr: string
  spawnFailed: boolean
}

/** Remote-only service exposing the DSH Code file / git / search surface. */
export class IdeService extends TypertRemoteService {
  static inject = ['fs', 'subprocess', 'workspaceRegistry', 'sandboxPolicy']

  constructor(ctx: Context) {
    super(ctx, 'ide')
  }

  private str(v: unknown): string {
    return v == null ? '' : String(v)
  }

  private root(): string {
    const policy = this.ctx.sandboxPolicy as { workspaceRoot?: unknown } | undefined
    return policy !== undefined && policy.workspaceRoot ? this.str(policy.workspaceRoot) : ''
  }

  /** Run one executable with explicit argv (no shell concatenation). */
  private async run(exe: string, cwd: string, args: unknown[], maxBytes?: number): Promise<RunResult> {
    const subprocess = this.ctx.subprocess
    if (subprocess === undefined) {
      return { ok: false, exitCode: null, stdout: '', stderr: 'subprocess service unavailable', spawnFailed: true }
    }
    try {
      const bin = await subprocess.resolveExecutable(exe)
      const handle = subprocess.spawn({
        argv: [bin, ...args.map(this.str)],
        cwd: cwd || this.root() || '.',
        stdio: {
          stdin: 'ignore',
          stdout: { maxBytes: maxBytes ?? 2 * 1024 * 1024, spill: { maxBytes: 8 * 1024 * 1024 } },
          stderr: { maxBytes: 128 * 1024 },
        },
        graceMs: 3000,
      })
      const outcome = await handle.done
      const stdout = handle.collected.stdout ? handle.collected.stdout.readFrom(0).text : ''
      const stderr = handle.collected.stderr ? handle.collected.stderr.readFrom(0).text : ''
      return { ok: outcome.exitCode === 0, exitCode: outcome.exitCode, stdout, stderr, spawnFailed: false }
    } catch (error) {
      return {
        ok: false,
        exitCode: null,
        stdout: '',
        stderr: error instanceof Error ? error.message : String(error),
        spawnFailed: true,
      }
    }
  }

  private git(cwd: string, args: string[]): Promise<RunResult> {
    return this.run('git', cwd, args)
  }

  private pwsh(script: string, args: string[]): Promise<RunResult> {
    return this.run('pwsh', this.root(), ['-NoProfile', '-NonInteractive', '-Command', script, ...args])
  }

  @Remote('roots')
  async roots(): Promise<RootsResult> {
    const workspaces: WorkspaceRef[] = []
    const registry = this.ctx.workspaceRegistry
    if (registry !== undefined) {
      try {
        for (const w of registry.list()) {
          workspaces.push({ id: this.str(w.id), title: this.str(w.title), path: this.str(w.path) })
        }
      } catch { /* registry listing is best-effort */ }
    }
    const policy = this.ctx.sandboxPolicy as { workspaceRoot?: unknown } | undefined
    const root = policy !== undefined ? this.str(policy.workspaceRoot) : ''
    return { root, workspaces }
  }

  @Remote('listDir')
  async listDir(path: string): Promise<ListDirResult> {
    const fs = this.ctx.fs
    if (fs === undefined) throw new Error('filesystem service unavailable')
    const target = await fs.resolve(path)
    const entries = await fs.listDir(target)
    const rows = entries
      .filter((e): e is FsDirEntry & { type: 'directory' | 'file' } => e.type === 'directory' || e.type === 'file')
      .map((e) => ({
        name: e.name,
        type: e.type,
        path: this.str(e.target && e.target.displayPath),
        size: typeof e.size === 'number' ? e.size : null,
      }))
    rows.sort((a, b) => {
      const ad = a.type === 'directory' ? 0 : 1
      const bd = b.type === 'directory' ? 0 : 1
      if (ad !== bd) return ad - bd
      return a.name < b.name ? -1 : a.name > b.name ? 1 : 0
    })
    return { path: this.str(target.displayPath), entries: rows }
  }

  @Remote('readText')
  async readText(path: string): Promise<ReadTextResult> {
    const fs = this.ctx.fs
    if (fs === undefined) throw new Error('filesystem service unavailable')
    const cap = 400 * 1024
    const target = await fs.resolve(path)
    const info = await fs.stat(target)
    if (info !== undefined && info.type !== 'file') throw new Error('not a regular file')
    const text = await fs.readText(target)
    const truncated = text.length > cap
    return { path: this.str(target.displayPath), content: truncated ? text.slice(0, cap) : text, truncated, size: text.length }
  }

  @Remote('newFile')
  async newFile(path: string): Promise<{ ok: true; path: string }> {
    const fs = this.ctx.fs
    if (fs === undefined) throw new Error('filesystem service unavailable')
    const target = await fs.resolve(path)
    await fs.writeText(target, '', { kind: 'createIfAbsent' })
    return { ok: true, path: this.str(target.displayPath) }
  }

  @Remote('mkdir')
  async mkdir(path: string): Promise<{ ok: boolean; stderr: string; path: string }> {
    const d = await this.pwsh('New-Item -ItemType Directory -Force -Path $args[0] | Out-Null', [path])
    return { ok: d.ok, stderr: d.stderr, path }
  }

  @Remote('delete')
  async delete(path: string): Promise<{ ok: boolean; stderr: string; path: string }> {
    const d = await this.pwsh('Remove-Item -LiteralPath $args[0] -Recurse -Force', [path])
    return { ok: d.ok, stderr: d.stderr, path }
  }

  @Remote('rename')
  async rename(from: string, to: string): Promise<{ ok: boolean; stderr: string; from: string; to: string }> {
    const d = await this.pwsh('Move-Item -LiteralPath $args[0] -Destination $args[1] -Force', [from, to])
    return { ok: d.ok, stderr: d.stderr, from, to }
  }

  @Remote('explore')
  async explore(path: string, select?: boolean): Promise<{ ok: boolean; path: string }> {
    const argv = select ? [`/select,${path}`] : [path]
    const d = await this.run('explorer.exe', this.root(), argv)
    return { ok: !d.spawnFailed, path }
  }

  @Remote('paste')
  async paste(dest: string): Promise<{ ok: boolean; files: string[]; stderr: string }> {
    const script = '$files=@(Get-Clipboard -Format FileDropList);$out=@();foreach($f in $files){Copy-Item -LiteralPath $f -Destination $args[0] -Recurse -Force;$out+=(Split-Path $f -Leaf)};$out -join [char]10'
    const d = await this.pwsh(script, [dest])
    return { ok: d.ok, files: d.stdout.split('\n').filter(Boolean), stderr: d.stderr }
  }

  @Remote('gitStatus')
  async gitStatus(cwd: string): Promise<GitStatusResult> {
    if (cwd === '') return { branch: '', changes: [], notRepo: true, error: 'no workspace directory' }
    const branch = await this.git(cwd, ['rev-parse', '--abbrev-ref', 'HEAD'])
    const st = await this.git(cwd, ['status', '--porcelain=v1', '-z', '--untracked-files=all'])
    if (!branch.ok) {
      return { branch: '', changes: [], notRepo: true, error: (branch.stderr || '').trim() || 'not a git repository' }
    }
    if (!st.ok) {
      return { branch: branch.stdout.trim(), changes: [], notRepo: false, error: (st.stderr || '').trim() }
    }
    return { branch: branch.stdout.trim(), changes: this.parseStatus(st.stdout), notRepo: false, error: '' }
  }

  private parseStatus(stdout: string): GitChange[] {
    const out: GitChange[] = []
    const parts = stdout.split('\0')
    let i = 0
    while (i < parts.length) {
      const rec = parts[i]; i++
      if (rec == null || rec === '' || rec.length < 4) continue
      const xy = rec.slice(0, 2)
      const path = rec.slice(3)
      const staged = xy[0] === ' ' ? '' : (xy[0] ?? '')
      const unstaged = xy[1] === ' ' ? '' : (xy[1] ?? '')
      if (xy[0] === 'R' || xy[0] === 'C') {
        const from = i < parts.length ? (parts[i] ?? '') : ''
        if (i < parts.length) i++
        out.push({ xy, path, renameFrom: from, staged, unstaged })
      } else {
        out.push({ xy, path, renameFrom: '', staged, unstaged })
      }
    }
    return out
  }

  @Remote('gitDiff')
  async gitDiff(cwd: string, path?: string): Promise<GitDiffResult> {
    const argv = path ? ['diff', 'HEAD', '--', path] : ['diff', 'HEAD', '--stat']
    const d = await this.git(cwd, argv)
    return { stdout: d.stdout, ok: d.ok, stderr: d.stderr, path: path ?? '' }
  }

  @Remote('gitStage')
  async gitStage(cwd: string, paths: string[]): Promise<{ ok: boolean; stderr: string }> {
    if (paths.length === 0) return { ok: false, stderr: 'no paths' }
    const d = await this.git(cwd, ['add', '--', ...paths])
    return { ok: d.ok, stderr: d.stderr }
  }

  @Remote('gitUnstage')
  async gitUnstage(cwd: string, paths: string[]): Promise<{ ok: boolean; stderr: string }> {
    if (paths.length === 0) return { ok: false, stderr: 'no paths' }
    const d = await this.git(cwd, ['reset', '-q', '--', ...paths])
    return { ok: d.ok, stderr: d.stderr }
  }

  @Remote('gitStageAll')
  async gitStageAll(cwd: string): Promise<{ ok: boolean; stderr: string }> {
    const d = await this.git(cwd, ['add', '-A'])
    return { ok: d.ok, stderr: d.stderr }
  }

  @Remote('gitUnstageAll')
  async gitUnstageAll(cwd: string): Promise<{ ok: boolean; stderr: string }> {
    const d = await this.git(cwd, ['reset', '-q', 'HEAD'])
    return { ok: d.ok, stderr: d.stderr }
  }

  @Remote('gitDiscard')
  async gitDiscard(cwd: string, path: string, untracked: boolean): Promise<{ ok: boolean; stderr: string; path: string }> {
    if (path === '') return { ok: false, stderr: 'no path', path }
    if (untracked) {
      const d = await this.pwsh('Remove-Item -LiteralPath $args[0] -Recurse -Force', [path])
      return { ok: d.ok, stderr: d.stderr, path }
    }
    const d = await this.git(cwd, ['checkout', '--', path])
    return { ok: d.ok, stderr: d.stderr, path }
  }

  @Remote('gitCommit')
  async gitCommit(cwd: string, message: string): Promise<{ ok: boolean; stdout: string; stderr: string }> {
    const trimmed = message.trim()
    if (trimmed === '') return { ok: false, stdout: '', stderr: 'empty commit message' }
    const d = await this.git(cwd, ['commit', '-m', trimmed])
    return { ok: d.ok, stdout: d.stdout, stderr: d.stderr }
  }

  @Remote('search')
  async search(cwd: string, query: string, caseSensitive: boolean): Promise<SearchResult> {
    const fs = this.ctx.fs
    if (fs === undefined) return { error: 'filesystem service unavailable', matches: [], files: 0, truncated: false }
    if (query === '' || cwd === '') return { error: '', matches: [], files: 0, truncated: false }

    // Fast path: ripgrep, when available.
    const subprocess = this.ctx.subprocess
    if (subprocess !== undefined) {
      const rgArgs = [
        '--json', '--no-config', '--line-number', '-e', query,
        '--glob', '!**/node_modules/**', '--glob', '!**/.git/**', '--glob', '!**/dist/**', '--glob', '!**/build/**',
        caseSensitive ? '--case-sensitive' : '--ignore-case',
      ]
      const rg = await this.run('rg', cwd, rgArgs)
      if (!rg.spawnFailed && (rg.exitCode === 0 || rg.exitCode === 1)) {
        const matches: SearchMatch[] = []
        for (const line of rg.stdout.split('\n')) {
          if (line === '') continue
          try {
            const obj = JSON.parse(line) as { type?: string; data?: { path?: { text?: string }; line_number?: number; lines?: { text?: string } } }
            if (obj.type === 'match' && obj.data) {
              matches.push({
                path: this.str(obj.data.path?.text),
                line: obj.data.line_number ?? 0,
                text: this.str(obj.data.lines?.text).slice(0, 240),
              })
            }
          } catch { /* skip malformed line */ }
        }
        const truncated = matches.length > 200
        return { error: '', matches: matches.slice(0, 200), files: new Set(matches.map((m) => m.path)).size, truncated }
      }
    }

    // Fallback: recursive scan.
    const q = caseSensitive ? query : query.toLowerCase()
    const matches: SearchMatch[] = []
    let files = 0
    let truncated = false
    const MAX_FILES = 400
    const MAX_MATCHES = 200
    const SKIP = new Set(['.git', 'node_modules', 'dist', 'build', 'out', 'target', 'coverage', '.next', '.dsh', '.agent-presets', '__pycache__', '.venv', 'venv', '.idea', '.vscode'])

    const walk = async (target: FsTarget): Promise<void> => {
      if (truncated || files >= MAX_FILES || matches.length >= MAX_MATCHES) return
      let entries: FsDirEntry[]
      try { entries = await fs.listDir(target) } catch { return }
      for (const e of entries) {
        if (truncated || files >= MAX_FILES || matches.length >= MAX_MATCHES) return
        if (SKIP.has(e.name)) continue
        if (e.name.length > 0 && e.name[0] === '.') continue
        if (e.type === 'directory') {
          await walk(e.target)
        } else if (e.type === 'file') {
          if (typeof e.size === 'number' && e.size > 256 * 1024) continue
          files++
          let text: string
          try { text = await fs.readText(e.target) } catch { continue }
          if (text.indexOf('\0') !== -1) continue
          const lines = text.split(/\r?\n/)
          for (let li = 0; li < lines.length; li++) {
            const line = lines[li]
            if (line === undefined) continue
            const hay = caseSensitive ? line : line.toLowerCase()
            if (hay.indexOf(q) !== -1) {
              matches.push({ path: this.str(e.target.displayPath), line: li + 1, text: line.length > 240 ? line.slice(0, 240) : line })
              if (matches.length >= MAX_MATCHES) { truncated = true; break }
            }
          }
        }
      }
    }

    const rootTarget = await fs.resolve(cwd)
    await walk(rootTarget)
    return { error: '', matches, files: new Set(matches.map((m) => m.path)).size, truncated }
  }
}

export default IdeService
