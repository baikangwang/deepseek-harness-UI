// gen-fileicons-map.mjs - regenerate EXT_MAP/NAME_MAP from CodeBuddy genie_icon_theme.json
// EXT_MAP = theme.fileExtensions + languageIds expanded into common extensions (only missing keys).
// NAME_MAP = theme.fileNames minus tsconfig.json (user wants json icon for json files).
// Usage: node scripts/gen-fileicons-map.mjs
import fs from 'node:fs'
import path from 'node:path'

const themePath = 'C:/Users/wangbaikang/AppData/Local/Programs/CodeBuddy CN/resources/app/extensions/theme-genie/fileicons/genie_icon_theme.json'
const target = path.resolve('packages/ide/src/client/fileicons.ts')

const theme = JSON.parse(fs.readFileSync(themePath, 'utf8'))

// language id -> common file extensions (covers every genie languageId)
const LANGUAGE_EXT = {
  argdown: ['argdown'], bat: ['bat', 'cmd'], bicep: ['bicep'], blade: ['blade'],
  c: ['c', 'h'], clojure: ['clj', 'cljs', 'cljc', 'edn'], coffeescript: ['coffee', 'cson', 'iced'],
  cpp: ['cpp', 'cc', 'cxx', 'hpp', 'hh', 'hxx', 'h++'], csharp: ['cs', 'csx'],
  css: ['css'], 'cuda-cpp': ['cu', 'cuh'], dart: ['dart'], 'django-html': [],
  dockercompose: [], dockerfile: ['dockerfile'], elixir: ['ex', 'exs'], elm: ['elm'],
  erb: ['erb'], fsharp: ['fs', 'fsi', 'fsx'], 'git-commit': [], 'github-issues': [],
  go: ['go'], godot: ['gd'], gradle: ['gradle'], groovy: ['groovy', 'gvy', 'gy'],
  haml: ['haml'], handlebars: ['hbs', 'handlebars'], haskell: ['hs', 'lhs'], haxe: ['hx'],
  html: ['html', 'htm', 'xhtml'], ignore: [], jade: ['jade'], java: ['java'],
  javascript: ['js', 'mjs', 'cjs'], javascriptreact: ['jsx'], jinja: ['jinja', 'j2'],
  json: ['json', 'jsonc', 'json5', 'geojson'], jsonc: [], jsonl: ['jsonl'], julia: ['jl'],
  kotlin: ['kt', 'kts'], latex: ['tex', 'latex'], less: ['less'], lua: ['lua'],
  makefile: ['makefile', 'mk', 'mak'], markdown: ['md', 'markdown', 'mdown', 'mkd', 'mdx'],
  mustache: ['mustache'], nunjucks: ['njk', 'nunjucks'], 'objective-c': ['m'],
  'objective-cpp': ['mm'], ocaml: ['ml', 'mli'], perl: ['pl', 'pm'],
  php: ['php', 'phtml'], postcss: [], powershell: ['ps1', 'psm1', 'psd1'],
  properties: ['properties', 'ini', 'conf', 'cfg'], python: ['py', 'pyw', 'pyi'],
  r: ['r', 'rmd'], razor: ['cshtml'], rescript: ['res', 'resi'], ruby: ['rb', 'rake', 'gemspec'],
  rust: ['rs'], sass: ['sass'], scss: ['scss'], 'search-result': [],
  shellscript: ['sh', 'bash', 'zsh', 'ksh', 'fish'], sql: ['sql', 'ddl'], stylus: ['styl'],
  swift: ['swift'], terraform: ['tf', 'tfvars'], tex: [], todo: [],
  typescript: ['ts', 'mts', 'cts'], typescriptreact: ['tsx'], vala: ['vala', 'vapi'],
  vue: ['vue'], xml: ['xml', 'xsd', 'xsl', 'xslt', 'plist', 'csproj'], yaml: ['yml', 'yaml'],
}

// merged EXT_MAP: theme.fileExtensions wins, language expansions fill missing keys
const merged = {}
for (const [k, v] of Object.entries(theme.fileExtensions || {})) merged[k] = v
let added = 0
for (const [lid, icon] of Object.entries(theme.languageIds || {})) {
  for (const e of LANGUAGE_EXT[lid] || []) {
    if (!(e in merged)) { merged[e] = icon; added++ }
  }
}

// NAME_MAP: theme.fileNames minus tsconfig.json
const names = { ...(theme.fileNames || {}) }
delete names['tsconfig.json']

function tsStr(v) { return JSON.stringify(String(v)) }
function block(name, map) {
  const lines = Object.entries(map).map(([k, v]) => `  ${tsStr(k)}: ${tsStr(v)},`)
  return `const ${name}: Record<string, string | undefined> = {\n${lines.join('\n')}\n}`
}

const extBlock = block('EXT_MAP', merged)
const nameBlock = block('NAME_MAP', names)

let src = fs.readFileSync(target, 'utf8')
const extStart = src.indexOf('const EXT_MAP')
const nameEndMarker = src.indexOf('\n/** Resolve the icon definition name for a file path. */')
if (extStart < 0 || nameEndMarker < 0) { console.error('boundary markers not found'); process.exit(1) }
const before = src.slice(0, extStart)
const after = src.slice(nameEndMarker + 1)
src = before + extBlock + '\n\n' + nameBlock + '\n' + after
fs.writeFileSync(target, src, 'utf8')

console.log(`EXT_MAP entries: ${Object.keys(merged).length} (theme ${Object.keys(theme.fileExtensions || {}).length} + lang-added ${added}), NAME_MAP entries: ${Object.keys(names).length}`)
for (const k of ['ts', 'js', 'json', 'md', 'py', 'jsx', 'tsx', 'vue', 'sh']) console.log(`  ${k} => ${merged[k]}`)
console.log('tsconfig.json in NAME_MAP:', 'tsconfig.json' in names)
