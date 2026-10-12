import {
  TAB_LIST,
  TAB_SHELL_URL,
  useAppStore,
  type TabName,
} from '../stores/app'

const TAB_ROUTES = new Set([
  'pages/tabbar/index',
  ...TAB_LIST.map((t) => t.path.replace(/^\//, '')),
])

const TAB_URLS = new Set([TAB_SHELL_URL, ...TAB_LIST.map((t) => t.path)])

function getCurrentRoute() {
  const pages = getCurrentPages()
  return pages[pages.length - 1]?.route ?? ''
}

function tabNameFromPath(path: string): Exclude<TabName, 'tabbar'> | null {
  const normalized = path.startsWith('/') ? path : `/${path}`
  const hit = TAB_LIST.find((t) => t.path === normalized)
  return hit ? hit.name : null
}

export function isTabPath(url: string): boolean {
  const path = String(url || '').split('?')[0]
  if (!path) return false
  if (TAB_URLS.has(path)) return true
  return TAB_ROUTES.has(path.replace(/^\//, ''))
}

/** Tab → 壳 + setActive；其它 → navigateTo / redirectTo */
export function openPage(
  url: string,
  opts?: { replace?: boolean },
): void {
  const raw = String(url || '').trim()
  if (!raw) return
  const pathOnly = raw.split('?')[0]
  if (isTabPath(pathOnly)) {
    const app = useAppStore()
    const name = tabNameFromPath(pathOnly)
    if (name) app.setActive(name)
    uni.switchTab({ url: TAB_SHELL_URL })
    return
  }
  if (opts?.replace) {
    uni.redirectTo({ url: raw })
    return
  }
  uni.navigateTo({ url: raw })
}

export function openBack(): void {
  uni.navigateBack({
    fail: () => {
      useAppStore().goHome()
    },
  })
}

/** 自定义底栏时隐藏原生 tabBar */
export function hideNativeTabBarIfNeeded() {
  const route = getCurrentRoute()
  if (!TAB_ROUTES.has(route)) return
  try {
    uni.hideTabBar({
      animation: false,
      fail: () => {},
    })
  } catch {
    /* ignore */
  }
}
