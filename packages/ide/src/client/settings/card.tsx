/**
 * Browser card for the `ide` settings namespace, registered into the keyed
 * slot `settings.plugin.item` (key `ide`) so it appears on the official
 * configurable-plugins tab. rc.8: third-party namespaces are served without
 * an allowlist, so Host registration + this card is the whole story.
 *
 * Layout mirrors the official PluginCard (ui-settings-plugins): a collapsible
 * header (title + description + chevron, default collapsed) disclosing the
 * field groups; each group is a bordered box with a clickable group title
 * (collapsible, default expanded). The search-excludes group renders a
 * READ-ONLY list (no edit control — "先不放开设置"), default collapsed.
 *
 * The official CardForm is private implementation and the client bundle
 * purity gate forbids importing its values, so this card carries its own
 * minimal staged form: local drafts, one save (field-level scope.set), one
 * reset (scope.unset). Inline zh copy, consistent with the rest of the plugin.
 * @module dsh-ide-ui/client/settings/card
 */

import { createElement, useEffect, useState, type ReactNode } from 'react'
import type { SettingsScope } from '@deepseek-ai/dsh-client-runtime/client'
import type { IdeSettings } from '../../settings-shared.ts'
import { useIdeSettings, type IdeSettingsHandle } from '../settings-store.ts'
import { IDE_DSH_BASELINE, IDE_VERSION } from '../version.ts'
import { Icon } from '../icons.tsx'

/** The card's inject face: live settings plus the two write verbs. */
export interface IdeSettingsCardFace {
  settings: IdeSettingsHandle
  /** Persist a full resolved section through the browser scope's field writes. */
  save: (patch: IdeSettings) => Promise<void>
  /** Clear every owned field so the section re-inherits defaults. */
  resetAll: () => Promise<void>
}

/** One labeled text/number field. */
function Field(props: {
  label: string
  value: string
  onChange: (v: string) => void
  numeric?: boolean
  placeholder?: string
  hint?: string
}): ReturnType<typeof createElement> {
  const el = createElement
  return el('label', { className: 'dshide-set-field' },
    el('span', { className: 'dshide-set-label' }, props.label),
    el('input', {
      className: 'dshide-set-input',
      type: props.numeric ? 'number' : 'text',
      value: props.value,
      placeholder: props.placeholder ?? '',
      onChange: (e: { target: { value: string } }) => { props.onChange(e.target.value) },
    }),
    props.hint ? el('span', { className: 'dshide-set-hint' }, props.hint) : null,
  )
}

/** One labeled checkbox. */
function Check(props: { label: string; value: boolean; onChange: (v: boolean) => void }): ReturnType<typeof createElement> {
  const el = createElement
  return el('label', { className: 'dshide-set-check' },
    el('input', { type: 'checkbox', checked: props.value, onChange: (e: { target: { checked: boolean } }) => { props.onChange(e.target.checked) } }),
    el('span', null, props.label),
  )
}

/**
 * One settings group: a bordered box whose title row toggles the field area.
 * The title (14px/600) reads above its fields (13px), and the box visually
 * owns every member field.
 */
function Group(props: {
  title: string
  open: boolean
  onToggle: () => void
  children?: ReactNode
}): ReturnType<typeof createElement> {
  const el = createElement
  return el('div', { className: 'dshide-set-group' },
    el('button', {
      type: 'button',
      className: 'dshide-set-group-head',
      'aria-expanded': props.open,
      onClick: () => { props.onToggle() },
    },
    el('span', { className: `dshide-set-chevron${props.open ? ' open' : ''}` }, el(Icon, { name: 'chevron', size: 12 })),
    el('span', { className: 'dshide-set-group-title' }, props.title)),
    props.open ? el('div', { className: 'dshide-set-group-box' }, props.children) : null,
  )
}

/** Render the card. */
export function IdeSettingsCard(props: IdeSettingsCardFace): ReturnType<typeof createElement> {
  const el = createElement
  const live = useIdeSettings(props.settings)
  const [maxFiles, setMaxFiles] = useState(() => String(live.search.maxFiles))
  const [maxMatches, setMaxMatches] = useState(() => String(live.search.maxMatches))
  const [fontSize, setFontSize] = useState(() => String(live.editor.fontSize))
  const [lineNumbers, setLineNumbers] = useState(() => live.editor.showLineNumbers)
  const [abbrevHome, setAbbrevHome] = useState(() => live.explorer.abbreviateHome)
  const [autoRefresh, setAutoRefresh] = useState(() => String(live.git.autoRefreshMs))
  const [saved, setSaved] = useState(false)
  // Card-level collapse (official PluginCard: default collapsed).
  const [open, setOpen] = useState(false)
  // Group-level collapse: editable groups default expanded; the read-only
  // excludes group defaults collapsed so it does not eat space.
  const [groups, setGroups] = useState<{ editor: boolean; explorer: boolean; git: boolean; search: boolean }>(
    { editor: true, explorer: true, git: true, search: false })
  // Resync drafts when the resolved section changes from elsewhere.
  useEffect(() => {
    setMaxFiles(String(live.search.maxFiles))
    setMaxMatches(String(live.search.maxMatches))
    setFontSize(String(live.editor.fontSize))
    setLineNumbers(live.editor.showLineNumbers)
    setAbbrevHome(live.explorer.abbreviateHome)
    setAutoRefresh(String(live.git.autoRefreshMs))
  }, [live])
  const toggleGroup = (key: 'editor' | 'explorer' | 'git' | 'search'): void => {
    setGroups((g) => ({ ...g, [key]: !g[key] }))
  }

  const num = (s: string, fallback: number): number => {
    const n = Number.parseInt(s, 10)
    return Number.isFinite(n) && n >= 0 ? n : fallback
  }
  const save = (): void => {
    // excludes is read-only here ("先不放开设置"): carry the live value through
    // so a save never wipes a hand-edited settings.yaml entry.
    const patch: IdeSettings = {
      search: { excludes: [...live.search.excludes], maxFiles: num(maxFiles, live.search.maxFiles), maxMatches: num(maxMatches, live.search.maxMatches) },
      editor: { fontSize: num(fontSize, live.editor.fontSize), showLineNumbers: lineNumbers },
      explorer: { abbreviateHome: abbrevHome },
      git: { autoRefreshMs: num(autoRefresh, live.git.autoRefreshMs) },
    }
    void props.save(patch).then(() => { setSaved(true); window.setTimeout(() => setSaved(false), 1500) })
  }
  const reset = (): void => { void props.resetAll() }

  return el('div', { className: `dshide-set-card${open ? ' open' : ''}` },
    el('button', {
      type: 'button',
      className: 'dshide-set-card-head',
      'aria-expanded': open,
      onClick: () => { setOpen(!open) },
    },
    el('span', { className: 'dshide-set-head-text' },
      el('span', { className: 'dshide-set-title' }, 'IDE UI 设置'),
      el('span', { className: 'dshide-set-desc' }, `插件偏好设置 · 版本 ${IDE_VERSION} · 基线 DSH ${IDE_DSH_BASELINE}`)),
    el('span', { className: `dshide-set-chevron${open ? ' open' : ''}` }, el(Icon, { name: 'chevron', size: 14 }))),
    open
      ? el('div', { className: 'dshide-set-body' },
        el(Group, { title: '编辑器', open: groups.editor, onToggle: () => { toggleGroup('editor') } },
          el(Field, { label: '字号（px）', value: fontSize, onChange: setFontSize, numeric: true }),
          el(Check, { label: '显示行号', value: lineNumbers, onChange: setLineNumbers })),
        el(Group, { title: '资源管理器', open: groups.explorer, onToggle: () => { toggleGroup('explorer') } },
          el(Check, { label: '路径缩写 ~（POSIX home）', value: abbrevHome, onChange: setAbbrevHome })),
        el(Group, { title: '源代码管理', open: groups.git, onToggle: () => { toggleGroup('git') } },
          el(Field, { label: '自动刷新间隔（ms，0 关闭）', value: autoRefresh, onChange: setAutoRefresh, numeric: true })),
        el(Group, { title: '搜索排除目录', open: groups.search, onToggle: () => { toggleGroup('search') } },
          el('ul', { className: 'dshide-set-excludes' },
            live.search.excludes.map((d, i) => el('li', { key: i }, d)),
            live.search.excludes.length === 0 ? el('li', { className: 'dshide-set-excludes-empty' }, '（无）') : null)),
        el('div', { className: 'dshide-set-actions' },
          el('button', { type: 'button', className: 'dshide-set-btn reset', onClick: reset }, '重置为默认'),
          el('button', { type: 'button', className: 'dshide-set-btn primary', onClick: save }, '保存'),
          saved ? el('span', { className: 'dshide-set-saved' }, '已保存') : null))
      : null,
  )
}

/** Build the card's inject face over a browser settings scope. */
export function createIdeSettingsCardFace(
  settings: IdeSettingsHandle,
  scope: SettingsScope<unknown>,
): IdeSettingsCardFace {
  return {
    settings,
    // The browser scope exposes FIELD-level writes only (set/unset), not
    // whole-section update/replace: persist each top-level group separately.
    save: async (patch) => {
      await scope.set('search', { ...patch.search })
      await scope.set('editor', { ...patch.editor })
      await scope.set('explorer', { ...patch.explorer })
      await scope.set('git', { ...patch.git })
    },
    resetAll: async () => {
      await scope.unset('search')
      await scope.unset('editor')
      await scope.unset('explorer')
      await scope.unset('git')
    },
  }
}
