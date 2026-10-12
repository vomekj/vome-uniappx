/**
 * 独立 Tab 子页 → 一律回到 tabbar 壳（深链 / 误入子路由）。
 * 壳内 v-if 嵌入时当前 route 已是 tabbar，不会再 switchTab。
 * 禁止按 isMobile 热切路由（Web DOM 叠加根因）。
 */
import { TAB_LIST, TAB_SHELL_URL, useAppStore, type TabName } from '../stores/app'

function currentRoute() {
  const pages = getCurrentPages()
  return String(pages[pages.length - 1]?.route || '')
}

function isStandaloneTabPage() {
  const route = currentRoute().replace(/^\//, '')
  return TAB_LIST.some((t) => t.path.replace(/^\//, '') === route)
}

export function useMobileTabShell(tabName: Exclude<TabName, 'tabbar'>) {
  const app = useAppStore()
  app.setActive(tabName)
  if (isStandaloneTabPage()) {
    uni.switchTab({ url: TAB_SHELL_URL })
  }
}
