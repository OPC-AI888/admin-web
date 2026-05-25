// @vitest-environment happy-dom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { Router } from 'vue-router'
import { setupGuards } from './guards'
import { setAccessToken, clearTokens } from '@/utils/auth'

vi.mock('element-plus', () => ({
  ElMessage: {
    error: vi.fn(),
  },
}))

describe('router guards', () => {
  let guard: Parameters<Router['beforeEach']>[0]

  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    guard = undefined as unknown as Parameters<Router['beforeEach']>[0]
    setupGuards({
      beforeEach(fn: Parameters<Router['beforeEach']>[0]) {
        guard = fn
      },
    } as Router)
  })

  it('redirects protected routes to login when no token exists', async () => {
    const runGuard = guard as unknown as (to: unknown, from: unknown, next: unknown) => Promise<unknown>
    const result = await runGuard({
      path: '/dashboard',
      fullPath: '/dashboard',
      meta: {},
    } as never, {} as never, vi.fn())

    expect(result).toEqual({ path: '/login', query: { redirect: '/dashboard' } })
  })

  it('redirects stale token sessions to login when profile fetch fails', async () => {
    clearTokens()
    setAccessToken('stale-token')

    const runGuard = guard as unknown as (to: unknown, from: unknown, next: unknown) => Promise<unknown>
    const result = await runGuard({
      path: '/dashboard',
      fullPath: '/dashboard',
      meta: {},
    } as never, {} as never, vi.fn())

    expect(result).toEqual({ path: '/login', query: { redirect: '/dashboard' } })
  })
})
