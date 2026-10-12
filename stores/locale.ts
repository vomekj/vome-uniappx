import { service } from '../api/client'
import { storage } from '../utils/storage'
import { createLocaleStore } from 'vome-core/client'
import zhCN from '../locales/zh-CN.json'

export type { I18nLangItem } from 'vome-core/client'

export const useLocaleStore = createLocaleStore({
  storageKey: 'locale',
  scopeKey: 'uniappx',
  langMode: 'app',
  cachePacks: true,
  defaultPack: zhCN as Record<string, unknown>,
  persist: {
    get: (k) => storage.get<string>(k),
    set: (k, v) => storage.set(k, v),
  },
  getPackApi: () =>
    (service as { i18n?: { pack?: unknown } }).i18n?.pack as
      | undefined,
})
