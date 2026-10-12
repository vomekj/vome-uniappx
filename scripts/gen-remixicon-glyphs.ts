/**
 * 从 node_modules/remixicon 生成 utils/remixicon-glyphs.ts
 * 用法：cd uniappx && bun scripts/gen-remixicon-glyphs.ts
 */
import { fromRoot } from './path'

const glyphPath = fromRoot(
  'node_modules',
  'remixicon',
  'fonts',
  'remixicon.glyph.json',
)
const ttfSrc = fromRoot('node_modules', 'remixicon', 'fonts', 'remixicon.ttf')
const ttfDest = fromRoot('static', 'fonts', 'remixicon.ttf')
const outPath = fromRoot('utils', 'remixicon-glyphs.ts')

const g = (await Bun.file(glyphPath).json()) as Record<
  string,
  { unicode?: string }
>

const lines = [
  '/** Auto-generated from remixicon.glyph.json — do not edit */',
  'export const REMIX_GLYPHS: Record<string, string> = {',
]

for (const [name, meta] of Object.entries(g)) {
  const m = String(meta.unicode || '').match(/&#x([0-9A-Fa-f]+);/)
  if (!m) continue
  const lit = `\\u${m[1].toLowerCase().padStart(4, '0')}`
  lines.push(`  '${name}': '${lit}',`)
  lines.push(`  'ri-${name}': '${lit}',`)
}
lines.push('}', '')

await Bun.write(ttfDest, Bun.file(ttfSrc))
await Bun.write(outPath, lines.join('\n'))
console.log(`[gen-remixicon] ${Object.keys(g).length} icons → ${outPath}`)
console.log(`[gen-remixicon] ttf → ${ttfDest}`)
