import { describe, it, expect } from 'vitest'
import { calculateFireNumber, calculateAdjustedFireNumber } from '@/core/fire'

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

describe('calculateAdjustedFireNumber', () => {
  // Shared base inputs — individual tests override what they need
  const base = {
    annualExpenses: 30_000,
    safeWithdrawalRate: 4,
    retirementAge: 55,
    includeStatePension: false,
    statePensionAge: 67,
    annualStatePension: 11_502.40, // £221.20/wk × 52
    realAnnualReturnRate: 5,
    sippFraction: 0,
    pensionTaxRate: 0,
  }

  describe('state pension disabled', () => {
    it('falls back to the basic FIRE number', () => {
      // No state pension adjustment — same as calculateFireNumber(30_000, 4)
      expect(calculateAdjustedFireNumber({ ...base, includeStatePension: false }))
        .toBe(750_000)
    })
  })

  describe('state pension enabled, no gap (retiring at or after SPA)', () => {
    it('reduces the required pot by netting off state pension income', () => {
      // Net expenses = £30,000 − £11,502.40 = £18,497.60
      // FIRE number  = £18,497.60 / 4% = £462,440 (exact)
      expect(
        calculateAdjustedFireNumber({ ...base, retirementAge: 67, includeStatePension: true }),
      ).toBeCloseTo(462_440, 0)
    })

    it('returns 0 when state pension fully covers retirement expenses', () => {
      // £10k expenses < £11,502.40 state pension → no pot needed
      expect(
        calculateAdjustedFireNumber({
          ...base,
          annualExpenses: 10_000,
          retirementAge: 67,
          includeStatePension: true,
        }),
      ).toBe(0)
    })
  })

  describe('state pension enabled, gap years (retiring before SPA)', () => {
    it('uses the two-tranche approach for a 12-year gap', () => {
      // Gap = 12yr, r = 5%, SWR = 4%
      // Phase 2 pot at SPA  = (£30k − £11,502.40) / 4%  = £462,440
      // Bridge               = £30k × annuityFactor(12, 5%) ≈ £265,898
      // Phase 2 PV today     = £462,440 / 1.05^12         ≈ £257,504
      // Total                                              ≈ £523,402
      expect(
        calculateAdjustedFireNumber({ ...base, includeStatePension: true }),
      ).toBeCloseTo(523_402, -1) // within ±5
    })

    it('still needs a bridge pot when state pension exceeds retirement expenses', () => {
      // Phase 2 pot = 0 (fully covered by state pension)
      // Bridge = £10k × annuityFactor(12, 5%) ≈ £88,633
      expect(
        calculateAdjustedFireNumber({
          ...base,
          annualExpenses: 10_000,
          includeStatePension: true,
        }),
      ).toBeCloseTo(88_633, -1) // within ±5
    })

    it('handles zero real return rate (no discounting)', () => {
      // r = 0: bridge = £30k × 12 = £360,000 (simple sum, no compounding)
      // Phase 2 pot at retirement = £462,440 (no discounting)
      // Total = £822,440
      expect(
        calculateAdjustedFireNumber({
          ...base,
          includeStatePension: true,
          realAnnualReturnRate: 0,
        }),
      ).toBeCloseTo(822_440, 0)
    })
  })

  describe('validation', () => {
    it('throws for negative annual expenses', () => {
      expect(() =>
        calculateAdjustedFireNumber({ ...base, annualExpenses: -1 }),
      ).toThrow(RangeError)
    })

    it('throws for zero or negative SWR', () => {
      expect(() =>
        calculateAdjustedFireNumber({ ...base, safeWithdrawalRate: 0 }),
      ).toThrow(RangeError)
    })

    it('throws for a negative real return rate', () => {
      expect(() =>
        calculateAdjustedFireNumber({ ...base, realAnnualReturnRate: -1 }),
      ).toThrow(RangeError)
    })
  })

  describe('pension tax (pensionTaxRate > 0)', () => {
    it('100% SIPP at 20% tax, no state pension → FIRE number = grossed / SWR', () => {
      // grossedExpenses = 30_000 / (1 - 0.75×0.20) = 30_000 / 0.85
      const grossed = 30_000 / 0.85
      const expected = grossed / 0.04
      expect(
        calculateAdjustedFireNumber({
          ...base,
          includeStatePension: false,
          sippFraction: 1.0,
          pensionTaxRate: 20,
        }),
      ).toBeCloseTo(expected, 2)
    })

    it('100% SIPP at 20% tax with state pension gap — FIRE number is higher than no-tax equivalent', () => {
      const noTax = calculateAdjustedFireNumber({
        ...base,
        includeStatePension: true,
        sippFraction: 1.0,
        pensionTaxRate: 0,
      })
      const withTax = calculateAdjustedFireNumber({
        ...base,
        includeStatePension: true,
        sippFraction: 1.0,
        pensionTaxRate: 20,
      })
      expect(withTax).toBeGreaterThan(noTax)
    })
  })
})
