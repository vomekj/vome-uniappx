import { defineStore } from 'pinia'

export type TabName = 'home' | 'discover' | 'message' | 'mine' | 'tabbar'

const MOBILE_MAX = 767

function resolveLayoutWidth(fallback: number) {
  // #ifdef WEB
  try {
    if (typeof document !== 'undefined') {
      return document.documentElement.clientWidth || fallback
    }
  } catch {
    /* ignore */
  }
  // #endif
  return fallback
}

function detectWebPlatform(uniPlatform: string) {
  return uniPlatform === 'web' || uniPlatform === 'h5'
}

/** icon 为 remixicon 名（本地 ttf，见 vm-ri-icon） */
export const TAB_LIST: Array<{
  name: Exclude<TabName, 'tabbar'>
  text: string
  icon: string
  path: string
}> = [
  {
    name: 'home',
    text: '首页',
    icon: 'ri-home-5-line',
    path: '/pages/home/index',
  },
  {
    name: 'discover',
    text: '发现',
    icon: 'ri-compass-3-line',
    path: '/pages/discover/index',
  },
  {
    name: 'message',
    text: '消息',
    icon: 'ri-notification-3-line',
    path: '/pages/message/index',
  },
  {
    name: 'mine',
    text: '我的',
    icon: 'ri-user-3-line',
    path: '/pages/mine/index',
  },
]

export const TAB_SHELL_URL = '/pages/tabbar/index'

export const useAppStore = defineStore('app', {
  state: () => ({
    active: 'home' as TabName,
    windowWidth: 0,
    safeAreaInsets: {} as Record<string, number>,
    /** web/h5；App/小程序为 false */
    isWeb: false,
  }),
  getters: {
    isMobile(state): boolean {
      return state.windowWidth > 0
        ? state.windowWidth <= MOBILE_MAX
        : true
    },
    /** 宽屏顶栏：仅 Web 且非窄屏（App/小程序始终底栏） */
    useTopNav(): boolean {
      return this.isWeb && !this.isMobile
    },
    /** 底栏：与 useTopNav 互斥 */
    useTabbarChrome(): boolean {
      return !this.useTopNav
    },
  },
  actions: {
    setActive(name: TabName) {
      this.active = name
      try {
        uni.setStorageSync('active', name)
      } catch {
        /* ignore */
      }
    },
    /** Tab 一律进壳，禁止切到真实子路由（避免 Web DOM 叠加） */
    goTabShell(name?: Exclude<TabName, 'tabbar'>) {
      if (name) this.setActive(name)
      uni.switchTab({ url: TAB_SHELL_URL })
    },
    goHome() {
      this.goTabShell('home')
    },
    initSystemInfo() {
      try {
        const info = uni.getSystemInfoSync() as {
          windowWidth?: number
          safeAreaInsets?: Record<string, number>
          uniPlatform?: string
        }
        const windowWidth = Number(info.windowWidth || 0)
        const uniPlatform = String(info.uniPlatform || '')
        this.isWeb = detectWebPlatform(uniPlatform)
        const width = this.isWeb
          ? resolveLayoutWidth(windowWidth)
          : windowWidth
        this.windowWidth = width
        this.safeAreaInsets = info.safeAreaInsets || {}
        const uniAny = uni as unknown as {
          onWindowResize?: (cb: (res: { size?: { windowWidth?: number } }) => void) => void
        }
        uniAny.onWindowResize?.((res) => {
          const next = Number(res.size?.windowWidth || 0)
          this.windowWidth = this.isWeb
            ? resolveLayoutWidth(next)
            : next
        })
      } catch {
        this.windowWidth = 375
        this.isWeb = false
      }
    },
  },
})
