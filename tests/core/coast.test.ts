import { describe, it, expect } from 'vitest'
import { calculateCoastNumber, hasCoasted, coastGap } from '@/core/coast'

describe('calculateCoastNumber', () => {
  // If retirement is today, no growth is possible — need the full FIRE number now
  it('returns the full FIRE number when years to retirement is 0', () => {
    expect(calculateCoastNumber(750_000, 5, 0)).toBe(750_000)
  })

  // Without real growth the pot cannot compound, so you still need the full amount
  it('returns the full FIRE number when real return rate is 0%', () => {
    expect(calculateCoastNumber(750_000, 0, 30)).toBe(750_000)
  })

  // Verify the discounting formula with a 1-year case
  // £110,250 in 1 year at 5% → need £105,000 today  (110_250 / 1.05 = 105_000)
  it('correctly discounts by one year of growth', () => {
    expect(calculateCoastNumber(110_250, 5, 1)).toBeCloseTo(105_000, 2)
  })

  // Verify two-year compounding: £110,250 / 1.05^2 = £100,000
  it('correctly discounts by two years of compound growth', () => {
    expect(calculateCoastNumber(110_250, 5, 2)).toBeCloseTo(100_000, 2)
  })

  // More time means a smaller coast number — more runway for growth
  it('produces a smaller coast number with more years to retirement', () => {
    const tenYears = calculateCoastNumber(750_000, 5, 10)
    const twentyYears = calculateCoastNumber(750_000, 5, 20)
    expect(twentyYears).toBeLessThan(tenYears)
  })

  // A higher return rate means the pot grows faster, so you need less today
  it('produces a smaller coast number with a higher return rate', () => {
    const at5 = calculateCoastNumber(750_000, 5, 20)
    const at7 = calculateCoastNumber(750_000, 7, 20)
    expect(at7).toBeLessThan(at5)
  })

  it('throws for a negative fire number', () => {
    expect(() => calculateCoastNumber(-1, 5, 30)).toThrow(RangeError)
  })

  it('throws for a negative return rate', () => {
    expect(() => calculateCoastNumber(750_000, -1, 30)).toThrow(RangeError)
  })

  it('throws for negative years to retirement', () => {
    expect(() => calculateCoastNumber(750_000, 5, -1)).toThrow(RangeError)
  })
})

describe('hasCoasted', () => {
  it('returns true when current total exceeds the coast number', () => {
    expect(hasCoasted(500_000, 400_000)).toBe(true)
  })

  it('returns true when current total exactly equals the coast number', () => {
    expect(hasCoasted(400_000, 400_000)).toBe(true)
  })

  it('returns false when current total is below the coast number', () => {
    expect(hasCoasted(300_000, 400_000)).toBe(false)
  })

  it('returns true when coast number is zero and user has any investment', () => {
    expect(hasCoasted(1, 0)).toBe(true)
  })
})

describe('coastGap', () => {
  it('returns the shortfall when not yet coasted', () => {
    expect(coastGap(300_000, 400_000)).toBe(100_000)
  })

  it('returns 0 when current total exceeds the coast number', () => {
    expect(coastGap(500_000, 400_000)).toBe(0)
  })

  it('returns 0 when exactly at the coast number (no negative gap)', () => {
    expect(coastGap(400_000, 400_000)).toBe(0)
  })
})

describe('calculateCoastNumber + hasCoasted + coastGap together', () => {
  it('is consistent: a total equal to the coast number passes all three checks', () => {
    const fireNumber = 750_000
    const coast = calculateCoastNumber(fireNumber, 5, 20)

    expect(hasCoasted(coast, coast)).toBe(true)
    expect(coastGap(coast, coast)).toBe(0)
  })

  it('is consistent: a total one pound below the coast number fails', () => {
    const coast = calculateCoastNumber(750_000, 5, 20)
    const justBelow = coast - 1

    expect(hasCoasted(justBelow, coast)).toBe(false)
    expect(coastGap(justBelow, coast)).toBeCloseTo(1, 5)
  })
})
