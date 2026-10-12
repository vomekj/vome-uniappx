import { config } from '../config'
import {
  configureClient,
  createEps,
  getService,
} from 'vome-core/client'
import { storage } from '../utils/storage'
import type { UserTokenPayload } from '../typings/user'
// HX 解析不了 package exports 的 typings 子路径，走物理路径
import type { RequestOptions } from '../node_modules/vome-core/typings/admin/comm/request'

export function apiUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path
  const base = String(config.baseUrl || '').replace(/\/$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}

export function getAccessToken() {
  if (storage.isExpired('token')) return ''
  return String(storage.get('token') || '')
}

export function getRefreshToken() {
  if (storage.isExpired('refreshToken')) return ''
  return String(storage.get('refreshToken') || '')
}

export function setTokens(accessToken: string, refreshToken: string) {
  storage.set('token', accessToken)
  storage.set('refreshToken', refreshToken, 7 * 24 * 60 * 60)
}

export function clearTokens() {
  storage.remove('token')
  storage.remove('refreshToken')
  storage.remove('userInfo')
}

let requests: Array<(token: string) => void> = []
let isRefreshing = false

function persistTokenPayload(data: UserTokenPayload) {
  storage.set('token', data.token, Math.max(1, data.expire - 5))
  storage.set(
    'refreshToken',
    data.refreshToken,
    Math.max(1, data.refreshExpire - 5),
  )
}

function redirectLogin() {
  const pages = getCurrentPages()
  const route = pages[pages.length - 1]?.route || ''
  if (route.includes('pages/login/index')) return
  clearTokens()
  uni.reLaunch({ url: '/pages/login/index' })
}

export function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    return Promise.reject(new Error('无 refreshToken'))
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: apiUrl('/app/user/login/refreshToken'),
      method: 'POST',
      header: { 'content-type': 'application/json' },
      data: { refreshToken },
      success(res) {
        const body = res.data as {
          code?: number
          message?: string
          data?: UserTokenPayload
        }
        if (
          res.statusCode === 200 &&
          body?.code === 1000 &&
          body.data?.token
        ) {
          persistTokenPayload(body.data)
          resolve(body.data.token)
          return
        }
        reject(new Error(body?.message || '刷新 token 失败'))
      },
      fail(err) {
        reject(new Error(err.errMsg || '网络错误'))
      },
    })
  })
}

export async function ensureFreshToken(): Promise<string> {
  const access = getAccessToken()
  if (access && !storage.isExpired('token')) {
    return access
  }

  if (storage.isExpired('refreshToken') || !getRefreshToken()) {
    if (access) clearTokens()
    return ''
  }

  if (isRefreshing) {
    return new Promise((resolve) => {
      requests.push((token) => resolve(token))
    })
  }

  isRefreshing = true
  try {
    const token = await refreshAccessToken()
    requests.forEach((cb) => cb(token))
    requests = []
    return token
  } catch (err) {
    requests.forEach((cb) => {
      try {
        cb('')
      } catch {
        /* ignore */
      }
    })
    requests = []
    const msg = err instanceof Error ? err.message : String(err)
    if (
      /刷新 token 失败|无 refreshToken|过期|登录已失效|Unauthorized|unauthorized/i.test(
        msg,
      )
    ) {
      redirectLogin()
    }
    return ''
  } finally {
    isRefreshing = false
  }
}

export async function request<T>(
  path: string,
  init?: RequestOptions,
): Promise<T> {
  const { toast: showToast = true, skipRefresh, ...rest } = init || {}
  const method = String(rest.method || 'GET').toUpperCase()
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  }

  const isRefreshApi = path.includes('refreshToken')
  let token = getAccessToken()

  if (
    !skipRefresh &&
    !isRefreshApi &&
    storage.get('token') &&
    storage.isExpired('token')
  ) {
    if (storage.isExpired('refreshToken')) {
      redirectLogin()
      throw new Error('登录已失效，请重新登录')
    }
    token = await ensureFreshToken()
  }

  if (token) headers.authorization = `Bearer ${token}`

  const lang = String(storage.get<string>('locale') || '').trim()
  if (lang) headers['X-Lang'] = lang

  let body: string | Record<string, unknown> | ArrayBuffer | undefined
  if (rest.body != null) {
    body =
      typeof rest.body === 'string'
        ? (JSON.parse(rest.body as string) as Record<string, unknown>)
        : (rest.body as Record<string, unknown>)
  }

  const data = await new Promise<{
    statusCode: number
    data: { code?: number; message?: string; data?: T } | string
  }>((resolve, reject) => {
    uni.request({
      url: apiUrl(path),
      method: (['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'].includes(
        method,
      )
        ? method
        : 'GET') as never,
      // uni-app x UTS 下 header 类型更严，运行时仍是普通对象
      header: headers as never,
      data: method === 'GET' ? undefined : (body as never),
      success: (res) => resolve(res as never),
      fail: (err) => reject(err),
    })
  })

  const raw = data.data
  const json =
    typeof raw === 'string'
      ? (() => {
          try {
            return JSON.parse(raw) as {
              code?: number
              message?: string
              data?: T
            }
          } catch {
            return null
          }
        })()
      : (raw as { code?: number; message?: string; data?: T } | null)

  if (json?.code === 1000) return json.data as T

  const message =
    json?.message ||
    (typeof raw === 'string' ? raw : '') ||
    `请求失败 (${data.statusCode})`

  const needAuth =
    !skipRefresh &&
    !isRefreshApi &&
    (data.statusCode === 401 ||
      /token|登录|未授权|鉴权|Unauthorized|unauthorized|登录失效/i.test(
        message,
      ))

  if (needAuth) {
    redirectLogin()
    throw new Error('登录已失效，请重新登录')
  }

  if (showToast) {
    uni.showToast({ title: message.slice(0, 40), icon: 'none' })
  }
  throw new Error(message)
}

configureClient({
  request,
  baseUrl: config.baseUrl,
  // HX 可能不标 import.meta.env.DEV，避免去拉不存在的 /eps.json
  loadStaticEps: async () => ({
    eps: true,
    app: {},
    admin: {},
    dict: {},
  }),
})

export const service = getService('app')

export async function bootEps(force = false) {
  return createEps({ force, side: 'app', requireRoot: false })
}
