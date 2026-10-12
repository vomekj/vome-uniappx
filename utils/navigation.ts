import { TAB_LIST } from '../stores/app'

const TAB_ROUTES = new Set([
  'pages/tabbar/index',
  ...TAB_LIST.map((t) => t.path.replace(/^\//, '')),
])

const TAB_URLS = new Set([
  '/pages/tabbar/index',
  ...TAB_LIST.map((t) => t.path),
])

function getCurrentRoute() {
  const pages = getCurrentPages()
  return pages[pages.length - 1]?.route ?? ''
}

export function isTabPath(url: string): boolean {
  const path = String(url || '').split('?')[0]
  if (!path) return false
  if (TAB_URLS.has(path)) return true
  return TAB_ROUTES.has(path.replace(/^\//, ''))
}

/** Tab → switchTab；其它 → navigateTo / redirectTo */
export function openPage(
  url: string,
  opts?: { replace?: boolean },
): void {
  const raw = String(url || '').trim()
  if (!raw) return
  const pathOnly = raw.split('?')[0]
  if (isTabPath(pathOnly)) {
    uni.switchTab({ url: pathOnly })
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
      openPage('/pages/home/index', { replace: true })
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
