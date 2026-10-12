type StorageEntry = {
  value: unknown
  expire?: number
}

const PREFIX = 'vome_uniappx_'

function fullKey(key: string) {
  return `${PREFIX}${key}`
}

function readEntry(key: string): StorageEntry | null {
  try {
    const raw = uni.getStorageSync(fullKey(key))
    if (raw == null || raw === '') return null
    if (typeof raw === 'object' && raw !== null && 'value' in (raw as object)) {
      return raw as StorageEntry
    }
    return { value: raw }
  } catch {
    return null
  }
}

export const storage = {
  set(key: string, value: unknown, expireSeconds?: number) {
    const entry: StorageEntry = { value }
    if (expireSeconds != null && expireSeconds > 0) {
      entry.expire = Date.now() + expireSeconds * 1000
    }
    uni.setStorageSync(fullKey(key), entry)
  },

  get<T = unknown>(key: string): T | null {
    const entry = readEntry(key)
    if (!entry) return null
    return entry.value as T
  },

  remove(key: string) {
    try {
      uni.removeStorageSync(fullKey(key))
    } catch {
      /* ignore */
    }
  },

  isExpired(key: string): boolean {
    const entry = readEntry(key)
    if (!entry) return true
    if (entry.expire == null) return false
    return Date.now() >= entry.expire
  },

  info(): Record<string, unknown> {
    return {
      token: storage.get('token') || '',
      refreshToken: storage.get('refreshToken') || '',
      userInfo: storage.get('userInfo') || undefined,
    }
  },
}
