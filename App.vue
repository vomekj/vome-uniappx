<script setup lang="ts">
import { ensureFreshToken, getAccessToken } from './api/client'
import { useThemeStore } from './stores/theme'
import { useUserStore } from './stores/user'
import { useLocaleStore } from './stores/locale'
import { useAppStore } from './stores/app'
import { hideNativeTabBarIfNeeded } from './utils/navigation'
import { subscribeLocaleChange } from 'vome-core/client'

// 生命周期由 uni-app x 编译器注入全局，勿从 @dcloudio/uni-app 手写 import
onLaunch(() => {
  const theme = useThemeStore()
  theme.initTheme()
  useAppStore().initSystemInfo()

  void (async () => {
    await ensureFreshToken()
    if (getAccessToken()) {
      await useUserStore().get()
    }
  })()

  subscribeLocaleChange(() => {
    try {
      const pages = getCurrentPages()
      const cur = pages[pages.length - 1] as {
        $vm?: { onLocaleReload?: () => void }
      }
      cur?.$vm?.onLocaleReload?.()
    } catch {
      /* ignore */
    }
  })
  void useLocaleStore()
})

onShow(() => {
  hideNativeTabBarIfNeeded()
})
onHide(() => {})
</script>

<style>
@import './styles/remixicon.css';
@import './styles/theme.css';

page {
  flex: 1;
  background-color: var(--vm-bg);
  color: var(--vm-text);
}
</style>
