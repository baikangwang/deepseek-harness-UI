/**
 * DSH Code — Client 展示层。
 *
 * 注册进 `sidebar.workspaces`（priority:-1，遮蔽原生会话浏览器、不声明子槽），
 * 渲染一条竖排活动栏 + 四个视图（资源管理器 / 搜索 / 源代码管理 / 会话管理）。
 * 原生 sidebar shell（logo / 新建会话 / 折叠 / 设置）保持不变。
 *
 * 运行时内建：React / host / styles / ctx。无 require，图标全部自绘 SVG。
 */
export default {
  apply(ctx) {
    const slots = ctx.get('slots')
    if (slots === undefined) return
    const el = React.createElement

    const ICONS = {
      explorer: [['path', { d: 'M1.6 4.6A1.6 1.6 0 0 1 3.2 3h3.1l1.7 2h4.8A1.6 1.6 0 0 1 14.4 6.6v4.8A1.6 1.6 0 0 1 12.8 13H3.2a1.6 1.6 0 0 1-1.6-1.6V4.6Z', fill: 'currentColor' }]],
      search: [
        ['circle', { cx: 6.8, cy: 6.8, r: 4.4, fill: 'none', stroke: 'currentColor', strokeWidth: 1.4 }],
        ['path', { d: 'M10.2 10.2 14.2 14.2', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' }],
      ],
      scm: [
        ['circle', { cx: 3.6, cy: 4, r: 1.5, fill: 'currentColor' }],
        ['circle', { cx: 12.4, cy: 4, r: 1.5, fill: 'currentColor' }],
        ['circle', { cx: 12.4, cy: 12, r: 1.5, fill: 'currentColor' }],
        ['path', { d: 'M3.6 5.5v2.3c0 1.6 1.3 2.9 2.9 2.9h4.3', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4 }],
        ['path', { d: 'M12.4 5.5v5', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4 }],
      ],
      chat: [['path', { d: 'M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v6a1.5 1.5 0 0 1-1.5 1.5H6.5L3.5 13.5V11A1.5 1.5 0 0 1 2 9.5v-6Z', fill: 'currentColor' }]],
      newchat: [
        ['path', { d: 'M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v6a1.5 1.5 0 0 1-1.5 1.5H6.5L3.5 13.5V11A1.5 1.5 0 0 1 2 9.5v-6Z', fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, strokeLinejoin: 'round' }],
        ['path', { d: 'M8 4.8v4.4M5.8 7h4.4', fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round' }],
      ],
      plus: [['path', { d: 'M8 3v10M3 8h10', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' }]],
      file: [
        ['path', { d: 'M4.2 1.6h4.9l3 3v8.8a1 1 0 0 1-1 1H4.2a1 1 0 0 1-1-1V2.6a1 1 0 0 1 1-1Z', fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, strokeLinejoin: 'round' }],
        ['path', { d: 'M9.1 1.6v3.1h3.1', fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, strokeLinejoin: 'round' }],
      ],
      folder: [['path', { d: 'M1.6 4.6A1.6 1.6 0 0 1 3.2 3h3.1l1.7 2h4.8A1.6 1.6 0 0 1 14.4 6.6v4.8A1.6 1.6 0 0 1 12.8 13H3.2a1.6 1.6 0 0 1-1.6-1.6V4.6Z', fill: 'currentColor' }]],
      chevron: [['path', { d: 'M6.1 4.6 10.4 8l-4.3 3.4Z', fill: 'currentColor' }]],
      refresh: [
        ['path', { d: 'M13.4 8a5.4 5.4 0 1 1-1.6-3.9', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' }],
        ['path', { d: 'M12.9 1.9 13.5 4.4l-2.5.6', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' }],
      ],
      close: [['path', { d: 'M4.2 4.2l7.6 7.6M11.8 4.2l-7.6 7.6', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' }]],
      back: [['path', { d: 'M10.4 3.8 6.2 8l4.2 4.2Z', fill: 'currentColor' }]],
    }
    function Icon(props) {
      const shapes = ICONS[props.name] || []
      return el('svg', {
        viewBox: '0 0 16 16', width: props.size || 16, height: props.size || 16,
        className: props.className, 'aria-hidden': true,
        style: Object.assign({ display: 'block', flex: 'none' }, props.style || {}),
      }, shapes.map(function (s, i) { return el(s[0], Object.assign({ key: i }, s[1])) }))
    }

    function relTime(ts) {
      if (!ts) return ''
      const diff = Date.now() - ts
      const m = 60000, h = 3600000, d = 86400000
      if (diff < m) return '刚刚'
      if (diff < h) return Math.floor(diff / m) + ' 分钟前'
      if (diff < d) return Math.floor(diff / h) + ' 小时前'
      if (diff < 30 * d) return Math.floor(diff / d) + ' 天前'
      return new Date(ts).toLocaleDateString()
    }

    const css = '.dshide-region{height:100%;width:100%;display:flex;flex-direction:row;overflow:hidden;color:var(--dsw-alias-label-primary);}.dshide-region *{box-sizing:border-box;}.dshide-activity{flex:none;width:40px;display:flex;flex-direction:column;align-items:center;gap:2px;padding:4px 0;border-right:1px solid var(--dsw-alias-border-l1);}.dshide-activity-btn{position:relative;width:40px;height:38px;display:flex;align-items:center;justify-content:center;border:0;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;padding:0;border-radius:8px;}.dshide-activity-btn:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2));}.dshide-activity-btn.active{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2));}.dshide-activity-btn.active::before{content:\'\';position:absolute;left:-2px;top:8px;bottom:8px;width:2px;border-radius:0 2px 2px 0;background:var(--dsw-alias-brand-primary);}.dshide-content{flex:1;min-width:0;display:flex;flex-direction:column;overflow:hidden;}.dshide-region.rail{flex-direction:column;align-items:center;gap:2px;padding:6px 0;}.dshide-region.rail .dshide-activity-btn{width:36px;height:36px;}.dshide-view{flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden;}.dshide-toolbar{flex:none;display:flex;align-items:center;gap:4px;padding:6px 8px;border-bottom:1px solid var(--dsw-alias-border-l1);}.dshide-select{flex:1;min-width:0;height:26px;border:1px solid var(--dsw-alias-border-l1);border-radius:6px;background:var(--dsw-alias-bg-layer-1,transparent);color:var(--dsw-alias-label-primary);font-size:12px;padding:0 6px;}.dshide-iconbtn{width:26px;height:26px;flex:none;display:flex;align-items:center;justify-content:center;border:0;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;border-radius:6px;padding:0;font-size:11px;}.dshide-iconbtn:hover{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2));color:var(--dsw-alias-label-primary);}.dshide-scroll{flex:1;min-height:0;overflow:auto;}.dshide-row{display:flex;align-items:center;gap:6px;height:28px;flex:none;padding:0 8px;cursor:pointer;user-select:none;white-space:nowrap;color:var(--dsw-alias-label-primary);}.dshide-row:hover{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2));}.dshide-row.selected{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2));}.dshide-arrow{width:14px;flex:none;display:flex;align-items:center;justify-content:center;color:var(--dsw-alias-label-secondary);transition:transform .12s ease;}.dshide-arrow.open{transform:rotate(90deg);}.dshide-glyph{flex:none;color:var(--dsw-alias-label-secondary);}.dshide-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;font-size:13px;line-height:20px;}.dshide-time{flex:none;color:var(--dsw-alias-label-secondary);font-size:11px;}.dshide-dot{flex:none;width:8px;height:8px;border-radius:50%;}.dshide-dot-warn{background:var(--dsw-alias-state-warn-primary);}.dshide-dot-ongoing{background:var(--dsw-alias-brand-primary);}.dshide-dot-done{background:var(--dsw-alias-state-success-primary);}.dshide-dot-idle{background:var(--dsw-alias-label-secondary);opacity:.35;}.dshide-loading{padding:16px;color:var(--dsw-alias-label-secondary);font-size:12px;}.dshide-empty{padding:16px 14px;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;}.dshide-preview-header{height:36px;flex:none;display:flex;align-items:center;gap:6px;padding:0 6px 0 4px;border-bottom:1px solid var(--dsw-alias-border-l1);}.dshide-preview-path{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:ui-monospace,Consolas,monospace;font-size:11px;color:var(--dsw-alias-label-secondary);}.dshide-code{flex:1;min-height:0;overflow:auto;margin:0;padding:8px 0;font-family:ui-monospace,Consolas,monospace;font-size:12px;line-height:20px;}.dshide-codeline{display:flex;}.dshide-lineno{flex:none;width:44px;text-align:right;padding-right:12px;color:var(--dsw-alias-label-secondary);user-select:none;opacity:.6;}.dshide-linetext{white-space:pre;}.dshide-search-box{flex:none;display:flex;align-items:center;gap:4px;padding:8px;}.dshide-search-input{flex:1;min-width:0;height:30px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1,transparent);color:var(--dsw-alias-label-primary);font-size:13px;padding:0 10px;outline:none;}.dshide-search-input:focus{border-color:var(--dsw-alias-brand-primary);}.dshide-results{flex:1;min-height:0;overflow:auto;}.dshide-result-summary{padding:8px 12px;font-size:12px;color:var(--dsw-alias-label-secondary);border-bottom:1px solid var(--dsw-alias-border-l1);}.dshide-match{padding:6px 12px;cursor:pointer;border-bottom:1px solid var(--dsw-alias-border-l1);}.dshide-match:hover{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2));}.dshide-match-path{font-size:12px;color:var(--dsw-alias-label-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-bottom:2px;}.dshide-match-line{display:flex;gap:8px;font-family:ui-monospace,Consolas,monospace;font-size:12px;}.dshide-match-lineno{flex:none;color:var(--dsw-alias-brand-primary);min-width:20px;text-align:right;}.dshide-match-text{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--dsw-alias-label-secondary);}.dshide-scm{flex:1;min-height:0;overflow:auto;}.dshide-scm-group-title{padding:10px 12px 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--dsw-alias-label-secondary);}.dshide-scm-status{flex:none;width:14px;text-align:center;font-family:ui-monospace,monospace;font-weight:700;font-size:12px;color:var(--dsw-alias-state-warn-primary);}.dshide-branch{flex:1;min-width:0;display:flex;align-items:center;gap:6px;font-size:12px;color:var(--dsw-alias-label-primary);overflow:hidden;white-space:nowrap;text-overflow:ellipsis;padding:0 4px;}.dshide-rename{color:var(--dsw-alias-label-secondary);font-size:11px;}.dshide-diff-line{white-space:pre;padding-left:8px;}.dshide-diff-line.add{background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 12%,transparent);color:var(--dsw-alias-state-success-primary);}.dshide-diff-line.del{background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 12%,transparent);color:var(--dsw-alias-state-error-primary);}.dshide-diff-line.hunk{color:var(--dsw-alias-brand-primary);}'
    ctx.effect(function () { return styles.insert(css) })

    function Preview(props) {
      const lines = props.content == null ? [] : props.content.split(/\r?\n/)
      return el('div', { className: 'dshide-view dshide-preview' },
        el('div', { className: 'dshide-preview-header' },
          el('button', { type: 'button', className: 'dshide-iconbtn', onClick: props.onBack, 'aria-label': 'Back' }, el(Icon, { name: 'back', size: 14 })),
          el('span', { className: 'dshide-preview-path', title: props.path }, props.path || ''),
        ),
        props.loading ? el('div', { className: 'dshide-loading' }, 'Loading…') :
        props.error ? el('div', { className: 'dshide-empty' }, props.error) :
        el('pre', { className: 'dshide-code' },
          lines.map(function (ln, i) {
            return el('div', { key: i, className: 'dshide-codeline' },
              el('span', { className: 'dshide-lineno' }, String(i + 1)),
              el('span', { className: 'dshide-linetext' }, ln || ' '),
            )
          }),
          props.truncated ? el('div', { className: 'dshide-empty' }, '… file truncated for preview') : null,
        ),
      )
    }

    function Tree(props) {
      const isOpen = props.depth === 0 || props.expanded.has(props.path)
      const [entries, setEntries] = React.useState(undefined)
      React.useEffect(function () {
        let cancelled = false
        setEntries(undefined)
        host.call('ide.listDir', { path: props.path }).then(function (r) {
          if (cancelled) return
          setEntries((r && r.error) ? [] : ((r && r.entries) || []))
        })
        return function () { cancelled = true }
      }, [props.path, isOpen])

      const visible = (entries || []).filter(function (e) { return props.showHidden || !(e.name.length > 0 && e.name[0] === '.') })
      return el('div', null,
        entries === undefined ? el('div', { className: 'dshide-loading' }, 'Loading…') :
        visible.map(function (e) {
          if (e.type === 'directory') {
            const open = props.expanded.has(e.path)
            return el('div', { key: e.path },
              el('div', { className: 'dshide-row', style: { paddingLeft: (props.depth * 12 + 8) + 'px' }, onClick: function () { props.toggle(e.path) } },
                el('span', { className: 'dshide-arrow' + (open ? ' open' : '') }, el(Icon, { name: 'chevron', size: 12 })),
                el(Icon, { name: 'folder', size: 14, className: 'dshide-glyph' }),
                el('span', { className: 'dshide-name' }, e.name),
              ),
              open ? el(Tree, { path: e.path, depth: props.depth + 1, expanded: props.expanded, toggle: props.toggle, onOpen: props.onOpen, showHidden: props.showHidden }) : null,
            )
          }
          return el('div', { key: e.path, className: 'dshide-row', style: { paddingLeft: (props.depth * 12 + 8 + 14) + 'px' }, onClick: function () { props.onOpen(e.path) } },
            el(Icon, { name: 'file', size: 14, className: 'dshide-glyph' }),
            el('span', { className: 'dshide-name' }, e.name),
          )
        }),
      )
    }

    function ExplorerView(props) {
      const [expanded, setExpanded] = React.useState(function () { return new Set() })
      const [preview, setPreview] = React.useState(null)
      const [showHidden, setShowHidden] = React.useState(false)

      const seen = {}
      const options = (props.workspaces || []).map(function (w) { return { path: w.path, title: w.title || w.path } })
        .filter(function (o) { if (seen[o.path]) return false; seen[o.path] = true; return true })
      if (props.root && !seen[props.root]) options.unshift({ path: props.root, title: props.root })

      function toggle(p) {
        setExpanded(function (prev) {
          const n = new Set(prev)
          if (n.has(p)) n.delete(p); else n.add(p)
          return n
        })
      }
      function openFile(path) {
        setPreview({ path: path, loading: true })
        host.call('ide.readText', { path: path }).then(function (r) {
          setPreview({ path: path, content: r && r.content, error: r && r.error, truncated: r && r.truncated })
        })
      }

      if (preview) return el(Preview, { path: preview.path, content: preview.content, error: preview.error, loading: preview.loading, truncated: preview.truncated, onBack: function () { setPreview(null) } })

      return el('div', { className: 'dshide-view' },
        el('div', { className: 'dshide-toolbar' },
          el('select', { className: 'dshide-select', value: props.root || '', onChange: function (e) { props.setRoot(e.target.value); setExpanded(new Set()); setPreview(null) } },
            options.map(function (o) { return el('option', { key: o.path, value: o.path }, o.title) }),
          ),
          el('button', { type: 'button', className: 'dshide-iconbtn', title: 'Refresh', onClick: function () { setExpanded(new Set()); setPreview(null) } }, el(Icon, { name: 'refresh', size: 14 })),
          el('button', { type: 'button', className: 'dshide-iconbtn', title: 'Show hidden', onClick: function () { setShowHidden(function (v) { return !v }) }, style: showHidden ? { color: 'var(--dsw-alias-brand-primary)' } : undefined }, el(Icon, { name: 'file', size: 14 })),
        ),
        el('div', { className: 'dshide-scroll' },
          props.root ? el(Tree, { path: props.root, depth: 0, expanded: expanded, toggle: toggle, onOpen: openFile, showHidden: showHidden }) :
          el('div', { className: 'dshide-empty' }, '暂无工作区，请先在会话管理中新建会话或添加工作区。'),
        ),
      )
    }

    function SearchView(props) {
      const [query, setQuery] = React.useState('')
      const [cs, setCs] = React.useState(false)
      const [loading, setLoading] = React.useState(false)
      const [result, setResult] = React.useState(null)
      const [preview, setPreview] = React.useState(null)

      function run() {
        if (!query.trim()) return
        setLoading(true)
        setResult(null)
        host.call('ide.search', { cwd: props.root, query: query, caseSensitive: cs }).then(function (r) {
          setResult(r || { error: 'no response', matches: [], files: 0, truncated: false })
          setLoading(false)
        })
      }
      function openFile(path) {
        setPreview({ path: path, loading: true })
        host.call('ide.readText', { path: path }).then(function (r) {
          setPreview({ path: path, content: r && r.content, error: r && r.error, truncated: r && r.truncated })
        })
      }

      if (preview) return el(Preview, { path: preview.path, content: preview.content, error: preview.error, loading: preview.loading, truncated: preview.truncated, onBack: function () { setPreview(null) } })

      return el('div', { className: 'dshide-view' },
        el('div', { className: 'dshide-search-box' },
          el('input', { className: 'dshide-search-input', placeholder: '在工作区中搜索…', value: query, onChange: function (e) { setQuery(e.target.value) }, onKeyDown: function (e) { if (e.key === 'Enter') run() } }),
          el('button', { type: 'button', className: 'dshide-iconbtn', title: '区分大小写', onClick: function () { setCs(function (v) { return !v }) }, style: cs ? { color: 'var(--dsw-alias-brand-primary)' } : undefined }, 'Aa'),
          el('button', { type: 'button', className: 'dshide-iconbtn', title: '搜索', onClick: run }, el(Icon, { name: 'search', size: 14 })),
        ),
        loading ? el('div', { className: 'dshide-loading' }, '搜索中…') :
        result == null ? el('div', { className: 'dshide-empty' }, '输入关键字，在工作区文件中搜索内容。') :
        result.error ? el('div', { className: 'dshide-empty' }, result.error) :
        el('div', { className: 'dshide-results' },
          el('div', { className: 'dshide-result-summary' }, result.matches.length + ' 处匹配 · ' + result.files + ' 个文件' + (result.truncated ? '（已截断）' : '')),
          result.matches.length === 0 ? el('div', { className: 'dshide-empty' }, '未找到匹配结果。') :
          result.matches.map(function (m, i) {
            return el('div', { key: i, className: 'dshide-match', onClick: function () { openFile(m.path) } },
              el('div', { className: 'dshide-match-path' }, m.path),
              el('div', { className: 'dshide-match-line' },
                el('span', { className: 'dshide-match-lineno' }, String(m.line)),
                el('span', { className: 'dshide-match-text' }, m.text),
              ),
            )
          }),
        ),
      )
    }

    function DiffView(props) {
      const lines = (props.diff.stdout || '').split(/\r?\n/)
      return el('div', { className: 'dshide-view dshide-preview' },
        el('div', { className: 'dshide-preview-header' },
          el('button', { type: 'button', className: 'dshide-iconbtn', onClick: props.onBack, 'aria-label': 'Back' }, el(Icon, { name: 'back', size: 14 })),
          el('span', { className: 'dshide-preview-path', title: props.diff.path }, props.diff.path || ''),
        ),
        props.diff.loading ? el('div', { className: 'dshide-loading' }, 'Loading…') :
        (props.diff.stderr && !props.diff.stdout) ? el('div', { className: 'dshide-empty' }, props.diff.stderr) :
        el('pre', { className: 'dshide-code' },
          lines.map(function (ln, i) {
            const cls = ln.indexOf('+') === 0 && ln.indexOf('+++') !== 0 ? 'dshide-diff-line add' :
                        ln.indexOf('-') === 0 && ln.indexOf('---') !== 0 ? 'dshide-diff-line del' :
                        ln.indexOf('@@') === 0 ? 'dshide-diff-line hunk' : 'dshide-diff-line'
            return el('div', { key: i, className: cls }, ln || ' ')
          }),
        ),
      )
    }

    function ScmView(props) {
      const [status, setStatus] = React.useState(null)
      const [loading, setLoading] = React.useState(false)
      const [diff, setDiff] = React.useState(null)

      React.useEffect(function () {
        if (!props.root) return
        setLoading(true)
        host.call('ide.git.status', { cwd: props.root }).then(function (r) {
          setStatus(r || { branch: '', changes: [], notRepo: true, error: 'no response' })
          setLoading(false)
        })
      }, [props.root])

      function refresh() {
        if (!props.root) return
        setLoading(true)
        host.call('ide.git.status', { cwd: props.root }).then(function (r) {
          setStatus(r || { branch: '', changes: [], notRepo: true, error: 'no response' })
          setLoading(false)
        })
      }
      function openDiff(path) {
        setDiff({ path: path, loading: true })
        host.call('ide.git.diff', { cwd: props.root, path: path }).then(function (r) {
          setDiff({ path: path, stdout: r && r.stdout, stderr: r && r.stderr, ok: r && r.ok })
        })
      }

      if (diff) return el(DiffView, { diff: diff, onBack: function () { setDiff(null) } })

      const changes = (status && status.changes) || []
      const staged = changes.filter(function (c) { return c.staged && c.staged !== ' ' })
      const unstaged = changes.filter(function (c) { return !c.staged || c.staged === ' ' })
      const untracked = changes.filter(function (c) { return c.xy === '??' })

      function group(label, list) {
        if (list.length === 0) return null
        return el('div', { className: 'dshide-scm-group' },
          el('div', { className: 'dshide-scm-group-title' }, label + ' (' + list.length + ')'),
          list.map(function (c, i) {
            return el('div', { key: i, className: 'dshide-row', onClick: function () { openDiff(c.path) } },
              el('span', { className: 'dshide-scm-status', title: c.xy }, c.staged || c.unstaged || '?'),
              el('span', { className: 'dshide-name' }, c.path),
              c.renameFrom ? el('span', { className: 'dshide-rename' }, '← ' + c.renameFrom) : null,
            )
          }),
        )
      }

      return el('div', { className: 'dshide-view' },
        el('div', { className: 'dshide-toolbar' },
          el('span', { className: 'dshide-branch' },
            el(Icon, { name: 'scm', size: 14 }),
            el('span', null, (status && status.branch) || '源代码管理'),
          ),
          el('button', { type: 'button', className: 'dshide-iconbtn', title: '刷新', onClick: refresh }, el(Icon, { name: 'refresh', size: 14 })),
        ),
        loading ? el('div', { className: 'dshide-loading' }, '读取中…') :
        status == null ? null :
        status.notRepo ? el('div', { className: 'dshide-empty' }, '当前工作区不是 Git 仓库。') :
        status.error ? el('div', { className: 'dshide-empty' }, status.error) :
        el('div', { className: 'dshide-scm' },
          changes.length === 0 ? el('div', { className: 'dshide-empty' }, '没有未提交的更改。') :
          el('div', null, group('已暂存', staged), group('更改', unstaged), group('未跟踪', untracked)),
        ),
      )
    }

    function SessionView(props) {
      const wsState = props.wsState
      const sessState = props.sessState
      const ids = (sessState && sessState.ids) || []
      const byId = (sessState && sessState.byId) || {}
      const current = sessState && sessState.current
      const archived = new Set((wsState && wsState.archivedSessionIds) || [])

      const workspaceBySession = {}
      const items = (wsState && wsState.items) || []
      for (const w of items) for (const sid of w.sessionIds) if (!workspaceBySession[sid]) workspaceBySession[sid] = w.title

      const rows = ids
        .map(function (id) { return byId[id] })
        .filter(function (s) { return s && s.origin !== 'subagent' && !archived.has(s.id) && (!s.blank || s.id === current) })
        .sort(function (a, b) { return b.updatedAt - a.updatedAt })

      function open(id) {
        const sessions = ctx.get('sessions')
        if (sessions) sessions.open(id)
      }
      function newSession() {
        const ws = ctx.get('workspaces')
        if (ws) ws.startSession()
      }
      function addWorkspace() {
        const ws = ctx.get('workspaces')
        if (ws) ws.pickDirectory().then(function (path) { if (path) ws.create({ path: path }) })
      }

      function dotClass(s) {
        if (s.pendingInteraction) return 'dshide-dot dshide-dot-warn'
        if (s.running) return 'dshide-dot dshide-dot-ongoing'
        if (s.completed) return 'dshide-dot dshide-dot-done'
        return 'dshide-dot dshide-dot-idle'
      }

      return el('div', { className: 'dshide-view' },
        el('div', { className: 'dshide-toolbar' },
          el('span', { className: 'dshide-branch' }, '会话管理'),
          el('button', { type: 'button', className: 'dshide-iconbtn', title: '新建会话', onClick: newSession }, el(Icon, { name: 'newchat', size: 14 })),
          el('button', { type: 'button', className: 'dshide-iconbtn', title: '添加工作区', onClick: addWorkspace }, el(Icon, { name: 'plus', size: 14 })),
        ),
        el('div', { className: 'dshide-scroll' },
          rows.length === 0 ? el('div', { className: 'dshide-empty' }, '暂无会话。点击上方按钮新建会话或添加工作区。') :
          rows.map(function (s) {
            const wsTitle = workspaceBySession[s.id]
            return el('div', { key: s.id, className: 'dshide-row' + (s.id === current ? ' selected' : ''), onClick: function () { open(s.id) } },
              el('span', { className: dotClass(s) }),
              el('span', { className: 'dshide-name' }, s.displayTitle || s.id),
              wsTitle ? el('span', { className: 'dshide-rename', title: wsTitle }, wsTitle) : null,
              el('span', { className: 'dshide-time' }, relTime(s.updatedAt)),
            )
          }),
        ),
      )
    }

    function IdeRegion(props) {
      const wide = props.wide
      const expandSidebar = props.expandSidebar
      const useWorkspaces = props.useWorkspaces
      const useSessions = props.useSessions
      const wsState = useWorkspaces ? useWorkspaces(function (s) { return s }) : null
      const sessState = useSessions ? useSessions(function (s) { return s }) : null
      const [active, setActive] = React.useState('sessions')
      const [root, setRoot] = React.useState(undefined)

      const items = (wsState && wsState.items) || []
      const recent = wsState && wsState.recentWorkspaceId
      React.useEffect(function () {
        if (root !== undefined) return
        if (recent) {
          const w = items.find(function (x) { return x.workspaceId === recent })
          if (w && w.path) { setRoot(w.path); return }
        }
        if (items[0] && items[0].path) { setRoot(items[0].path); return }
        host.call('ide.roots', {}).then(function (r) {
          if (r && r.root) setRoot(r.root)
          else if (r && r.workspaces && r.workspaces[0]) setRoot(r.workspaces[0].path)
        })
      }, [root, recent, items])

      const views = [
        { id: 'files', icon: 'explorer', label: '资源管理器' },
        { id: 'search', icon: 'search', label: '搜索' },
        { id: 'scm', icon: 'scm', label: '源代码管理' },
        { id: 'sessions', icon: 'chat', label: '会话管理' },
      ]

      function pick(v) {
        if (!wide && expandSidebar) expandSidebar()
        setActive(v)
      }

      function buttons() {
        return views.map(function (v) {
          return el('button', {
            key: v.id, type: 'button', title: v.label, 'aria-label': v.label,
            className: 'dshide-activity-btn' + (wide && active === v.id ? ' active' : ''),
            onClick: function () { pick(v.id) },
          }, el(Icon, { name: v.icon, size: 20 }))
        })
      }

      if (!wide) {
        return el('div', { className: 'dshide-region rail' }, buttons())
      }

      return el('div', { className: 'dshide-region' },
        el('div', { className: 'dshide-activity' }, buttons()),
        el('div', { className: 'dshide-content' },
          active === 'sessions' ? el(SessionView, { wsState: wsState, sessState: sessState }) :
          active === 'files' ? el(ExplorerView, { root: root, setRoot: setRoot, workspaces: items }) :
          active === 'search' ? el(SearchView, { root: root }) :
          el(ScmView, { root: root }),
        ),
      )
    }

    slots.inject('sidebar.workspaces', function () {
      return slots.register({ name: 'sidebar.workspaces', priority: -1 }, IdeRegion)
    })
  },
}
