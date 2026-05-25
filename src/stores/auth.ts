import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth'
import type { LoginParams } from '@/api/auth'
import {
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  setRefreshToken,
  clearTokens,
  getAdminInfo,
  setAdminInfo,
  getTokenPair,
} from '@/utils/auth'

export interface AdminInfo {
  id: number
  username: string
  role: string
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(getAccessToken())
  const refreshToken = ref<string | null>(getRefreshToken())
  const admin = ref<AdminInfo | null>(getAdminInfo<AdminInfo>())

  const isLoggedIn = computed(() => !!accessToken.value)
  const isSuperAdmin = computed(() => admin.value?.role === 'SUPER_ADMIN')

  async function login(params: LoginParams) {
    const res = await authApi.login(params)
    const tokens = getTokenPair(res)
    accessToken.value = tokens.accessToken
    refreshToken.value = tokens.refreshToken
    admin.value = res.admin
    setAccessToken(tokens.accessToken)
    setRefreshToken(tokens.refreshToken)
    setAdminInfo(res.admin)
    return res
  }

  async function refresh() {
    const rt = refreshToken.value
    if (!rt) throw new Error('No refresh token')
    const res = await authApi.refresh(rt)
    const tokens = getTokenPair(res)
    accessToken.value = tokens.accessToken
    refreshToken.value = tokens.refreshToken
    setAccessToken(tokens.accessToken)
    setRefreshToken(tokens.refreshToken)
    return res
  }

  async function logout() {
    try {
      await authApi.logout()
    } catch {
      // ignore
    } finally {
      clearSession()
    }
  }

  async function fetchProfile() {
    const profile = await authApi.getProfile()
    admin.value = {
      id: profile.id,
      username: profile.username,
      role: profile.role,
    }
    setAdminInfo(admin.value)
    return profile
  }

  function setTokens(at: string, rt: string) {
    accessToken.value = at
    refreshToken.value = rt
    setAccessToken(at)
    setRefreshToken(rt)
  }

  function clearSession() {
    accessToken.value = null
    refreshToken.value = null
    admin.value = null
    clearTokens()
  }

  return {
    accessToken,
    refreshToken,
    admin,
    isLoggedIn,
    isSuperAdmin,
    login,
    refresh,
    logout,
    fetchProfile,
    setTokens,
    clearSession,
  }
})
