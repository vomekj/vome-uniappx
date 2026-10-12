import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storage } from '../utils/storage'
import { request, service, clearTokens } from '../api/client'
import type { AppUser, UserTokenPayload } from '../typings/user'

let getFlight: Promise<AppUser | null> | null = null

export const useUserStore = defineStore('user', () => {
  const cached = storage.info()
  const token = ref(String(cached.token || ''))
  const info = ref<AppUser | undefined>(
    (cached.userInfo as AppUser | undefined) || undefined,
  )
  const loaded = ref(false)

  const displayName = computed(
    () =>
      info.value?.name ||
      info.value?.phone ||
      info.value?.email ||
      '用户',
  )

  function setToken(data: UserTokenPayload) {
    token.value = data.token
    storage.set('token', data.token, Math.max(1, data.expire - 5))
    storage.set(
      'refreshToken',
      data.refreshToken,
      Math.max(1, data.refreshExpire - 5),
    )
    loaded.value = false
  }

  function set(value: AppUser) {
    info.value = value
    storage.set('userInfo', value)
  }

  function clear() {
    clearTokens()
    token.value = ''
    info.value = undefined
    loaded.value = false
    getFlight = null
  }

  function logout() {
    void (async () => {
      try {
        await service.user?.info?.logout?.({})
      } catch {
        /* ignore */
      } finally {
        clear()
        uni.reLaunch({ url: '/pages/login/index' })
      }
    })()
  }

  async function get(): Promise<AppUser | null> {
    if (!token.value && !storage.get('token')) return null
    if (getFlight) return getFlight
    getFlight = (async () => {
      try {
        const person =
          (await service.user?.info?.person?.({})) ??
          (await request<AppUser>('/app/user/info/person', {
            method: 'GET',
            toast: false,
          }))
        if (person) {
          set(person)
          loaded.value = true
          return person
        }
        return null
      } catch {
        return null
      } finally {
        getFlight = null
      }
    })()
    return getFlight
  }

  async function loginByPassword(body: {
    account: string
    password: string
  }) {
    const payload = {
      account: String(body.account || '').trim(),
      password: body.password,
    }
    const data =
      (await service.user?.login?.password?.(payload)) ??
      (await request<UserTokenPayload>('/app/user/login/password', {
        method: 'POST',
        body: payload,
      }))
    setToken(data)
    await get()
    return data
  }

  return {
    token,
    info,
    loaded,
    displayName,
    setToken,
    set,
    clear,
    logout,
    get,
    loginByPassword,
  }
})
