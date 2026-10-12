/**
 * 在 Cursor / 终端里启动或发行 uni-app x（走本机 HBuilderX cli，不是 npm Vite）。
 *
 * 运行：https://hx.dcloud.net.cn/cli/launch-web
 * 发行：cli publish --platform h5|mp-weixin ；App 资源 cli publish app-* --type appResource
 *
 * 环境变量：
 *   HBUILDERX_CLI  — cli 可执行文件绝对路径
 *   HBUILDERX_PATH — HBuilderX 安装目录（自动拼 cli）
 *   HX_BROWSER     — launch web 浏览器，默认 Chrome
 */
import { join, projectRoot as resolveProjectRoot } from './path'

const projectRoot = resolveProjectRoot()

async function fileExists(p: string): Promise<boolean> {
  return Bun.file(p).exists()
}

async function resolveCli(): Promise<string | null> {
  const direct = Bun.env.HBUILDERX_CLI?.trim()
  if (direct && (await fileExists(direct))) return direct

  const base = Bun.env.HBUILDERX_PATH?.trim()
  if (base) {
    for (const c of [
      join(base, 'cli'),
      join(base, 'cli.exe'),
      join(base, 'Contents', 'MacOS', 'cli'),
    ]) {
      if (await fileExists(c)) return c
    }
  }

  const home = Bun.env.HOME || Bun.env.USERPROFILE || ''
  const candidates = [
    '/Applications/HBuilderX.app/Contents/MacOS/cli',
    '/Applications/HBuilderX-Alpha.app/Contents/MacOS/cli',
    home ? join(home, 'Applications', 'HBuilderX.app', 'Contents', 'MacOS', 'cli') : '',
    // Windows 常见安装位
    home ? join(home, 'AppData', 'Local', 'HBuilderX', 'cli.exe') : '',
    home ? join(home, 'AppData', 'Roaming', 'HBuilderX', 'cli.exe') : '',
    'C:\\Program Files\\HBuilderX\\cli.exe',
    'C:\\HBuilderX\\cli.exe',
    'D:\\HBuilderX\\cli.exe',
  ]
  for (const c of candidates) {
    if (c && (await fileExists(c))) return c
  }
  return null
}

function printHint(extra?: string) {
  if (extra) console.error(extra)
  console.log(`
[uniappx] 须本机 HBuilderX / HBuilderV。

  bun run dev                 # launch web
  bun run build               # publish h5 → unpackage/
  bun run build:mp-weixin
  bun run build:app-android   # 本地打包 App 资源
  bun run build:app-ios

  # macOS
  export HBUILDERX_PATH="/Applications/HBuilderX.app"
  # Windows (PowerShell)
  $env:HBUILDERX_PATH="C:\\HBuilderX"
`)
}

/** argv[2]: web | mp-weixin | app-* | build | build-* | hint */
const target = Bun.argv[2] || 'web'
const browser = Bun.env.HX_BROWSER?.trim() || 'Chrome'

if (target === 'hint') {
  printHint()
  process.exit(0)
}

const cli = await resolveCli()
if (!cli) {
  printHint('[uniappx] 未找到 HBuilderX cli')
  process.exit(1)
}

type Cmd = { args: string[]; note: string }

function buildCmd(): Cmd {
  switch (target) {
    case 'web':
    case 'h5':
    case 'dev':
      return {
        args: [
          'launch',
          'web',
          '--project',
          projectRoot,
          '--browser',
          browser,
        ],
        note: '运行到浏览器（底层 Vite）',
      }
    case 'mp-weixin':
      return {
        args: ['launch', 'mp-weixin', '--project', projectRoot],
        note: '运行到微信开发者工具',
      }
    case 'app-android':
      return {
        args: ['launch', 'app-android', '--project', projectRoot],
        note: '运行到 Android',
      }
    case 'app-ios':
      return {
        args: ['launch', 'app-ios', '--project', projectRoot],
        note: '运行到 iOS',
      }
    case 'build':
    case 'build-web':
    case 'build-h5':
      return {
        args: ['publish', '--platform', 'h5', '--project', projectRoot],
        note: '发行 Web/H5（产物在 unpackage/）',
      }
    case 'build-mp-weixin':
      return {
        args: [
          'publish',
          '--platform',
          'mp-weixin',
          '--project',
          projectRoot,
        ],
        note: '发行微信小程序（仅编译，不上传）',
      }
    case 'build-app-android':
      return {
        args: [
          'publish',
          'app-android',
          '--type',
          'appResource',
          '--project',
          projectRoot,
        ],
        note: '发行 Android 本地打包资源',
      }
    case 'build-app-ios':
      return {
        args: [
          'publish',
          'app-ios',
          '--type',
          'appResource',
          '--project',
          projectRoot,
        ],
        note: '发行 iOS 本地打包资源',
      }
    default:
      printHint(`[uniappx] 未知目标: ${target}`)
      process.exit(1)
  }
}

const { args, note } = buildCmd()
console.log(`[uniappx] cli ← ${cli}`)
console.log(`[uniappx] ${note}`)
console.log(`[uniappx] ${[cli, ...args].join(' ')}`)

const openFirst = Bun.spawn([cli, 'open'], {
  stdout: 'inherit',
  stderr: 'inherit',
  stdin: 'inherit',
})
const openCode = await openFirst.exited
if (openCode && openCode !== 0) {
  console.warn('[uniappx] cli open 返回非 0，继续尝试…')
}

const child = Bun.spawn([cli, ...args], {
  stdout: 'inherit',
  stderr: 'inherit',
  stdin: 'inherit',
})
process.exit((await child.exited) ?? 1)
