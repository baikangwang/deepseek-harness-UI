// gen-typert-gitstatusmap.mjs - insert the gitStatusMap descriptor into the committed
// Typert artifacts (typert.remote-client.js / typert.host.js / typert.remote-client.d.ts).
// The generator is not installed locally, so the artifacts are patched by pattern
// (they are fully regular). Run after adding the @Remote method in src/index.ts.
import fs from 'node:fs'
import path from 'node:path'

const lib = path.resolve('packages/ide/lib')

const schemaBlock = `const _dsh_ide_ui_ide_gitStatusMap_parameter_0$schema = z.string()
const _dsh_ide_ui_ide_gitStatusMap_result$schema = z.object({
  'branch': z.string(),
  'files': z.record(z.object({
  'code': z.string(),
  'staged': z.boolean(),
})),
  'ignoredDirs': z.array(z.string()),
  'notRepo': z.boolean(),
  'error': z.string(),
})
`

// Full descriptor block with its own opening brace, ending with the opening
// brace for the gitUnstage descriptor (the anchor follows inside it).
const descriptorBlock = `    {
      id: 'dsh-ide-ui#ide/gitStatusMap',
      service: 'ide',
      namespace: 'ide',
      method: 'gitStatusMap',
      invocation: { kind: 'direct' },
      parameters: [
        {
          name: 'cwd',
          wire: 'cwd',
          source: 'json',
          codec: {
            mode: 'strict',
            typeSymbol: 'dsh-ide-ui#ide/gitStatusMap:cwd',
            schema: _dsh_ide_ui_ide_gitStatusMap_parameter_0$schema,
          },
        },
      ],
      result: {
        mode: 'strict',
        typeSymbol: 'dsh-ide-ui/types#GitStatusMapResult',
        schema: _dsh_ide_ui_ide_gitStatusMap_result$schema,
      },
      sourceLocation: {"file":"packages/host/ide/src/index.ts","line":191,"column":9},
    },
    {
`

function patchJs(file, already) {
  let src = fs.readFileSync(file, 'utf8')
  if (src.includes("id: 'dsh-ide-ui#ide/gitStatusMap'")) { console.log('skip (present):', file); return }
  const schemaAnchor = 'const _dsh_ide_ui_ide_gitUnstage_parameter_0$schema'
  const descAnchor = "      id: 'dsh-ide-ui#ide/gitUnstage',"
  if (!src.includes(schemaAnchor) || !src.includes(descAnchor)) { console.error('anchor missing in', file); process.exit(1) }
  src = src.replace(schemaAnchor, schemaBlock + schemaAnchor)
  src = src.replace(descAnchor, descriptorBlock + descAnchor)
  fs.writeFileSync(file, src, 'utf8')
  console.log('patched:', file)
}

function patchDts(file) {
  let src = fs.readFileSync(file, 'utf8')
  if (src.includes('gitStatusMap')) { console.log('skip (present):', file); return }
  const importLine = "import type { GitDiffResult, GitStatusResult, ListDirResult, ReadTextResult, RootsResult, SearchResult } from 'dsh-ide-ui/types'"
  const newImport = "import type { GitDiffResult, GitStatusMapResult, GitStatusResult, ListDirResult, ReadTextResult, RootsResult, SearchResult } from 'dsh-ide-ui/types'"
  if (!src.includes(importLine)) { console.error('import anchor missing in', file); process.exit(1) }
  src = src.replace(importLine, newImport)
  const nsLine = "    gitStatus: (cwd: string) => Promise<RemoteResult<GitStatusResult>>"
  const nsAdd = nsLine + "\n    gitStatusMap: (cwd: string) => Promise<RemoteResult<GitStatusMapResult>>"
  if (!src.includes(nsLine)) { console.error('namespace anchor missing in', file); process.exit(1) }
  src = src.split(nsLine).join(nsAdd)
  const mapLine = "    'ide/gitStatus': (cwd: string) => Promise<RemoteResult<GitStatusResult>>"
  const mapAdd = mapLine + "\n    'ide/gitStatusMap': (cwd: string) => Promise<RemoteResult<GitStatusMapResult>>"
  if (!src.includes(mapLine)) { console.error('map anchor missing in', file); process.exit(1) }
  src = src.split(mapLine).join(mapAdd)
  fs.writeFileSync(file, src, 'utf8')
  console.log('patched:', file)
}

patchJs(path.join(lib, 'typert.remote-client.js'))
patchJs(path.join(lib, 'typert.host.js'))
patchDts(path.join(lib, 'typert.remote-client.d.ts'))
console.log('done')
