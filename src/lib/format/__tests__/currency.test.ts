import { describe, expect, it } from 'vitest'
import { formatIdr, formatSignedIdr } from '../currency'

describe('formatIdr', () => {
  it('rounds to whole Rupiah with no fractional currency units', () => {
    expect(formatIdr(5_196_937.064)).toBe('Rp5.196.937')
  })

  it('formats signed cost changes consistently', () => {
    expect(formatSignedIdr(5_196_937.064)).toBe('+Rp5.196.937')
    expect(formatSignedIdr(-22_539_298.7)).toBe('-Rp22.539.299')
  })
})
