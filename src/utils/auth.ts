// Token 存取工具（localStorage，key 前缀 admin_）

const PREFIX = 'admin_'

export const TOKEN_KEYS = {
  ACCESS_TOKEN: `${PREFIX}access_token`,
  REFRESH_TOKEN: `${PREFIX}refresh_token`,
  ADMIN_INFO: `${PREFIX}admin_info`,
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN)
}

export function setAccessToken(token: string): void {
  localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, token)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN)
}

export function setRefreshToken(token: string): void {
  localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, token)
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN)
  localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN)
  localStorage.removeItem(TOKEN_KEYS.ADMIN_INFO)
}

export function getAdminInfo<T>(): T | null {
  const raw = localStorage.getItem(TOKEN_KEYS.ADMIN_INFO)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function setAdminInfo(info: unknown): void {
  localStorage.setItem(TOKEN_KEYS.ADMIN_INFO, JSON.stringify(info))
}
