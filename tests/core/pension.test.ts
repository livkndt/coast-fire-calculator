import { describe, it, expect } from 'vitest'
import { weeklyToAnnual, isSippAccessible, SIPP_MIN_ACCESS_AGE } from '@/core/pension'

describe('weeklyToAnnual', () => {
  // The 2024/25 full new State Pension is £221.20/week = £11,502.40/year
  it('converts the 2024/25 full new State Pension correctly', () => {
    expect(weeklyToAnnual(221.20)).toBeCloseTo(11_502.40, 2)
  })

  it('multiplies by 52 weeks', () => {
    expect(weeklyToAnnual(100)).toBe(5_200)
  })

  it('returns 0 for a zero weekly amount', () => {
    expect(weeklyToAnnual(0)).toBe(0)
  })

  it('throws for a negative weekly amount', () => {
    expect(() => weeklyToAnnual(-1)).toThrow(RangeError)
  })
})

describe('isSippAccessible', () => {
  // The SIPP minimum access age is 57 from April 2028 (raised from 55)
  // Since this app is forward-looking, 57 is treated as the rule
  it('exports the minimum access age as a named constant', () => {
    expect(SIPP_MIN_ACCESS_AGE).toBe(57)
  })

  it('returns true when retirement age equals the minimum access age', () => {
    expect(isSippAccessible(57)).toBe(true)
  })

  it('returns true when retirement age is above the minimum access age', () => {
    expect(isSippAccessible(60)).toBe(true)
    expect(isSippAccessible(67)).toBe(true)
  })

  it('returns false when retirement age is below the minimum access age', () => {
    expect(isSippAccessible(56)).toBe(false)
    expect(isSippAccessible(45)).toBe(false)
  })
})
