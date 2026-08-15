import { describe, expect, it } from 'vitest'
import { DASHBOARD_ACCESS_VALUE, isDashboardAccessGranted } from '../dashboard-access'

describe('isDashboardAccessGranted', () => {
  it('accepts only the access token set by the landing CTA', () => {
    expect(isDashboardAccessGranted(DASHBOARD_ACCESS_VALUE)).toBe(true)
    expect(isDashboardAccessGranted(undefined)).toBe(false)
    expect(isDashboardAccessGranted('anything-else')).toBe(false)
  })
})
