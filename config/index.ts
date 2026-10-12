import dev from './dev'
import prod from './prod'

/**
 * 必须用 import.meta.env.DEV（与经典 uniapp 一致）。
 * HX/Vite 运行态 process.env.NODE_ENV 常为 production，会误用 prod 占位域名 → request:fail。
 */
const isDev = Boolean(
  (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV,
)
const env = isDev ? dev : prod

export const config = {
  app: {
    name: '威迈科技',
    desc: 'uni-app x 蒸汽模版',
  },
  host: env.host,
  baseUrl: env.baseUrl,
}

export default config
