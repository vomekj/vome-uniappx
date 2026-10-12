export type UserTokenPayload = {
  token: string
  expire: number
  refreshToken: string
  refreshExpire: number
}

export type AppUser = {
  id?: number
  userId?: number
  name?: string
  phone?: string
  email?: string
  avatarUrl?: string
}
