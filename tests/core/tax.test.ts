import { describe, it, expect } from 'vitest'
import { grossAnnualExpenses, projectTerminalSippFraction } from '@/core/tax'

describe('grossAnnualExpenses', () => {
  it('returns netExpenses unchanged when pensionTaxRate is 0', () => {
    expect(grossAnnualExpenses(30_000, 0.8, 0)).toBe(30_000)
  })

  it('returns netExpenses unchanged when sippFraction is 0', () => {
    expect(grossAnnualExpenses(30_000, 0, 20)).toBe(30_000)
  })

  it('100% SIPP at 20% tax rate — gross = net / 0.85', () => {
    // W = X / (1 − 0.75 × 0.20) = X / 0.85
    expect(grossAnnualExpenses(30_000, 1.0, 20)).toBeCloseTo(30_000 / 0.85, 2)
  })

  it('50% SIPP at 20% tax rate — blended gross', () => {
    // grossExpenses = 30_000 × [0.5 / 0.85 + 0.5]
    const expected = 30_000 * (0.5 / 0.85 + 0.5)
    expect(grossAnnualExpenses(30_000, 0.5, 20)).toBeCloseTo(expected, 2)
  })

  it('100% SIPP at 40% higher-rate tax — gross = net / 0.70', () => {
    // W = X / (1 − 0.75 × 0.40) = X / 0.70
    expect(grossAnnualExpenses(30_000, 1.0, 40)).toBeCloseTo(30_000 / 0.70, 2)
  })
})

describe('projectTerminalSippFraction', () => {
  const base = {
    currentAge: 35,
    retirementAge: 60,
    realAnnualReturnRate: 5,
    monthlyContributionSipp: 0,
    monthlyContributionOther: 0,
  }

  it('no contributions — fraction equals starting proportion (growth cancels)', () => {
    // Both pots grow at same rate, so fraction = 60_000 / 100_000 = 0.6
    const fraction = projectTerminalSippFraction({
      ...base,
      currentSippValue: 60_000,
      currentOtherInvestments: 40_000,
    })
    expect(fraction).toBeCloseTo(0.6, 5)
  })

  it('equal contributions and equal starting values → 0.5', () => {
    const fraction = projectTerminalSippFraction({
      ...base,
      currentSippValue: 20_000,
      currentOtherInvestments: 20_000,
      monthlyContributionSipp: 500,
      monthlyContributionOther: 500,
    })
    expect(fraction).toBeCloseTo(0.5, 5)
  })

  it('r = 0 edge case — uses simple sum instead of compounding formula', () => {
    // currentSipp=10_000, monthlyContribSipp=500, years=5 → sippEnd = 10_000 + 500×12×5 = 40_000
    // currentOther=10_000, monthlyContribOther=1_000, years=5 → otherEnd = 10_000 + 1_000×12×5 = 70_000
    // fraction = 40_000 / 110_000 ≈ 0.3636
    const fraction = projectTerminalSippFraction({
      currentAge: 35,
      retirementAge: 40,
      realAnnualReturnRate: 0,
      currentSippValue: 10_000,
      currentOtherInvestments: 10_000,
      monthlyContributionSipp: 500,
      monthlyContributionOther: 1_000,
    })
    expect(fraction).toBeCloseTo(40_000 / 110_000, 5)
  })

  it('total = 0 → returns 0 (no division by zero)', () => {
    const fraction = projectTerminalSippFraction({
      ...base,
      currentSippValue: 0,
      currentOtherInvestments: 0,
    })
    expect(fraction).toBe(0)
  })
})
