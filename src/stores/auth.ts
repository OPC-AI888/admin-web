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
    accessToken.value = res.access_token
    refreshToken.value = res.refresh_token
    admin.value = res.admin
    setAccessToken(res.access_token)
    setRefreshToken(res.refresh_token)
    setAdminInfo(res.admin)
    return res
  }

  async function refresh() {
    const rt = refreshToken.value
    if (!rt) throw new Error('No refresh token')
    const res = await authApi.refresh(rt)
    accessToken.value = res.access_token
    refreshToken.value = res.refresh_token
    setAccessToken(res.access_token)
    setRefreshToken(res.refresh_token)
    return res
  }

  async function logout() {
    try {
      await authApi.logout()
    } catch {
      // ignore
    } finally {
      accessToken.value = null
      refreshToken.value = null
      admin.value = null
      clearTokens()
    }
  }

  async function fetchProfile() {
    const profile = await authApi.getProfile()
    admin.value = { id: profile.id, username: profile.username, role: profile.role }
    setAdminInfo(admin.value)
    return profile
  }

  function setTokens(at: string, rt: string) {
    accessToken.value = at
    refreshToken.value = rt
    setAccessToken(at)
    setRefreshToken(rt)
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
  }
})
