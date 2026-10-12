import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { storage } from '../utils/storage'

export type ThemeMode = 'light' | 'dark'

/** 弧形扫瞄过渡中，避免连点叠两次 View Transition（仅 Web） */
let themeTransitioning = false

type ViewTransitionDoc = Document & {
  startViewTransition?: (update: () => void) => {
    finished: Promise<void>
  }
}

export const useThemeStore = defineStore('theme', () => {
  const themeMode = ref<ThemeMode>(
    (storage.get<string>('theme') as ThemeMode) || 'light',
  )
  const isDark = computed(() => themeMode.value === 'dark')

  function applyDom(dark: boolean) {
    // #ifdef WEB
    try {
      if (typeof document !== 'undefined') {
        const theme = dark ? 'dark' : 'light'
        document.documentElement.setAttribute('data-theme', theme)
        document.documentElement.classList.toggle('theme-dark', dark)
        document.documentElement.classList.toggle('theme-light', !dark)
        document.body?.classList.toggle('theme-dark', dark)
        document.body?.classList.toggle('theme-light', !dark)
      }
    } catch {
      /* ignore */
    }
    // #endif
  }

  function prefersReducedMotion() {
    // #ifdef WEB
    try {
      if (typeof window === 'undefined') return true
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    } catch {
      return true
    }
    // #endif
    // #ifndef WEB
    return true
    // #endif
  }

  function runThemeUpdate(apply: () => void, animate: boolean) {
    // #ifdef WEB
    const doc =
      typeof document !== 'undefined'
        ? (document as ViewTransitionDoc)
        : null
    if (
      animate &&
      doc?.startViewTransition &&
      !prefersReducedMotion() &&
      !themeTransitioning
    ) {
      themeTransitioning = true
      const transition = doc.startViewTransition(apply)
      void transition.finished.finally(() => {
        themeTransitioning = false
      })
      return
    }
    // #endif
    apply()
  }

  function initTheme() {
    applyDom(isDark.value)
  }

  function setTheme(mode: ThemeMode, options?: { animate?: boolean }) {
    const nextDark = mode === 'dark'
    const visualChange = nextDark !== isDark.value
    const animate = options?.animate !== false && visualChange

    runThemeUpdate(() => {
      themeMode.value = mode
      storage.set('theme', mode)
      applyDom(mode === 'dark')
    }, animate)
  }

  function toggleTheme() {
    setTheme(isDark.value ? 'light' : 'dark')
  }

  return {
    themeMode,
    isDark,
    initTheme,
    setTheme,
    toggleTheme,
  }
})
