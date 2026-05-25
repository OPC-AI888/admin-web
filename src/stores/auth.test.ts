// @vitest-environment happy-dom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from './auth'
import { TOKEN_KEYS } from '@/utils/auth'
import { authApi } from '@/api/auth'

vi.mock('@/api/auth', () => ({
  authApi: {
    login: vi.fn(),
  },
}))

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('stores admin login tokens when backend returns camelCase fields', async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      admin: {
        id: 1,
        username: 'admin',
        role: 'SUPER_ADMIN',
      },
    } as never)

    const auth = useAuthStore()
    await auth.login({
      username: 'admin',
      password: 'secret123',
      captcha: 'abcd',
      captchaKey: 'captcha-key',
    })

    expect(auth.accessToken).toBe('access-token')
    expect(auth.refreshToken).toBe('refresh-token')
    expect(localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN)).toBe('access-token')
    expect(localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN)).toBe('refresh-token')
  })
})
