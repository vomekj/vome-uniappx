/**
 * 移动端 Tab 子页 → tabbar 壳（对齐经典 uniapp useH5MobileTabShell）
 * 自定义 vm-tabbar 只挂在 pages/tabbar；独立子页会 hideNativeTabBar，须跳回壳才有底栏。
 */
import { watch } from 'vue'
import { useAppStore, type TabName } from '../stores/app'

export function useMobileTabShell(tabName: Exclude<TabName, 'tabbar'>) {
  const app = useAppStore()
  app.setActive(tabName)

  if (app.isMobile) {
    app.debouncedSwitchTab('/pages/tabbar/index')
  }
  watch(
    () => app.isMobile,
    (isMobile) => {
      if (isMobile) {
        app.debouncedSwitchTab('/pages/tabbar/index')
      }
    },
  )
}
