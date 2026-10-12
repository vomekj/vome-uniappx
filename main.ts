import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { bootEps } from './api/client'

export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()
  app.use(pinia)

  void bootEps()
    .then(async () => {
      try {
        const { useLocaleStore } = await import('./stores/locale')
        await useLocaleStore().initLocale()
      } catch (e) {
        console.warn('[boot] initLocale failed', e)
      }
    })
    .catch((e) => {
      console.warn('[boot] createEps failed', e)
    })

  return { app }
}
