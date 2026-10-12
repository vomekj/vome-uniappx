import { defineStore } from 'pinia'

export type TabName = 'home' | 'discover' | 'message' | 'mine' | 'tabbar'

const MOBILE_MAX = 767

let navTimer: ReturnType<typeof setTimeout> | null = null

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

export const useAppStore = defineStore('app', {
  state: () => ({
    active: 'home' as TabName,
    windowWidth: 0,
    safeAreaInsets: {} as Record<string, number>,
  }),
  getters: {
    isMobile(state): boolean {
      return state.windowWidth > 0
        ? state.windowWidth <= MOBILE_MAX
        : true
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
    goHome() {
      this.setActive('home')
      if (this.isMobile) {
        uni.switchTab({ url: '/pages/tabbar/index' })
      } else {
        uni.switchTab({ url: '/pages/home/index' })
      }
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
        const width =
          uniPlatform === 'web' || uniPlatform === 'h5'
            ? resolveLayoutWidth(windowWidth)
            : windowWidth
        this.windowWidth = width
        this.safeAreaInsets = info.safeAreaInsets || {}
        // uni-app x 部分端无 onWindowResize；有则监听
        const uniAny = uni as unknown as {
          onWindowResize?: (cb: (res: { size?: { windowWidth?: number } }) => void) => void
        }
        uniAny.onWindowResize?.((res) => {
          const next = Number(res.size?.windowWidth || 0)
          this.windowWidth =
            uniPlatform === 'web' || uniPlatform === 'h5'
              ? resolveLayoutWidth(next)
              : next
        })
      } catch {
        this.windowWidth = 375
      }
    },
    debouncedSwitchTab(url: string) {
      if (navTimer) clearTimeout(navTimer)
      navTimer = setTimeout(() => {
        uni.switchTab({ url })
      }, 300)
    },
  },
})
