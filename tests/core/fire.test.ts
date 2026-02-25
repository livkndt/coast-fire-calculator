import { describe, it, expect } from 'vitest'
import { calculateFireNumber } from '@/core/fire'

describe('calculateFireNumber', () => {
  // The textbook case — £30k/yr at 4% SWR needs a £750k pot
  it('calculates the standard 4% SWR case', () => {
    expect(calculateFireNumber(30_000, 4)).toBe(750_000)
  })

  // A more conservative SWR means you need a larger pot
  it('calculates a conservative 3% SWR', () => {
    expect(calculateFireNumber(30_000, 3)).toBeCloseTo(1_000_000, 2)
  })

  // A less conservative SWR means a smaller required pot
  it('calculates an aggressive 5% SWR', () => {
    expect(calculateFireNumber(30_000, 5)).toBe(600_000)
  })

  // The relationship is linear: double the expenses, double the pot
  it('scales linearly with expenses', () => {
    expect(calculateFireNumber(60_000, 4)).toBe(calculateFireNumber(30_000, 4) * 2)
  })

  // No expenses in retirement = no pot required
  it('returns 0 for zero annual expenses', () => {
    expect(calculateFireNumber(0, 4)).toBe(0)
  })

  // Handles non-round numbers — verifies the arithmetic, not just easy cases
  it('handles fractional results correctly', () => {
    // £25,000 / 3.5% = £714,285.71...
    expect(calculateFireNumber(25_000, 3.5)).toBeCloseTo(714_285.71, 2)
  })

  // Guard: dividing by zero SWR would give Infinity — must be rejected
  it('throws for a zero SWR', () => {
    expect(() => calculateFireNumber(30_000, 0)).toThrow(RangeError)
  })

  // Guard: a negative SWR is not meaningful
  it('throws for a negative SWR', () => {
    expect(() => calculateFireNumber(30_000, -4)).toThrow(RangeError)
  })

  // Guard: negative expenses are not meaningful
  it('throws for negative annual expenses', () => {
    expect(() => calculateFireNumber(-1_000, 4)).toThrow(RangeError)
  })
})
