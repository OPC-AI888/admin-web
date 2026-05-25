// @vitest-environment happy-dom

import { describe, expect, it } from 'vitest'
import { isAuthFailureCode } from './request'

describe('request auth failure detection', () => {
  it('treats backend auth business codes as auth failures', () => {
    expect(isAuthFailureCode(1002)).toBe(true)
    expect(isAuthFailureCode(1003)).toBe(true)
  })

  it('does not treat normal business errors as auth failures', () => {
    expect(isAuthFailureCode(1001)).toBe(false)
    expect(isAuthFailureCode(2002)).toBe(false)
  })
})
