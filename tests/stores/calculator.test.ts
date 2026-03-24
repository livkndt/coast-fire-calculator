import { describe, it, expect } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCalculatorStore } from '@/stores/calculator'

function freshStore() {
  setActivePinia(createPinia())
  return useCalculatorStore()
}

describe('useCalculatorStore — default inputs', () => {
  it('starts with UK real-return and SWR defaults', () => {
    const store = freshStore()
    expect(store.inputs.realAnnualReturnRate).toBe(5)
    expect(store.inputs.safeWithdrawalRate).toBe(4)
  })

  it('starts with UK state pension defaults enabled', () => {
    const store = freshStore()
    expect(store.inputs.includeStatePension).toBe(true)
    expect(store.inputs.statePensionAge).toBe(67)
    expect(store.inputs.statePensionWeeklyAmount).toBeCloseTo(221.20, 2)
  })

  it('starts with zero investments and contributions', () => {
    const store = freshStore()
    expect(store.inputs.currentSippValue).toBe(0)
    expect(store.inputs.currentIsaValue).toBe(0)
    expect(store.inputs.currentGiaValue).toBe(0)
    expect(store.inputs.currentCashValue).toBe(0)
    expect(store.inputs.monthlyContributionSipp).toBe(0)
    expect(store.inputs.monthlyContributionIsa).toBe(0)
    expect(store.inputs.monthlyContributionGia).toBe(0)
    expect(store.inputs.monthlyContributionCash).toBe(0)
  })

  it('starts with sensible age defaults', () => {
    const store = freshStore()
    expect(store.inputs.currentAge).toBeGreaterThan(0)
    expect(store.inputs.retirementAge).toBeGreaterThan(store.inputs.currentAge)
  })
})

describe('useCalculatorStore — computed results', () => {
  it('has zero fireNumber and coastNumber when expenses are zero', () => {
    const store = freshStore()
    store.inputs.annualRetirementExpenses = 0
    expect(store.results.fireNumber).toBe(0)
    expect(store.results.coastFireNumber).toBe(0)
  })

  it('currentTotal sums SIPP + ISA + GIA + cash', () => {
    const store = freshStore()
    store.inputs.currentSippValue = 10_000
    store.inputs.currentIsaValue = 5_000
    store.inputs.currentGiaValue = 3_000
    store.inputs.currentCashValue = 2_000
    expect(store.results.currentTotal).toBe(20_000)
  })

  it('setting only ISA contributes to currentTotal', () => {
    const store = freshStore()
    store.inputs.currentIsaValue = 15_000
    expect(store.results.currentTotal).toBe(15_000)
  })

  it('fireNumber increases when expenses increase (reactive)', () => {
    const store = freshStore()
    store.inputs.annualRetirementExpenses = 30_000
    const first = store.results.fireNumber
    store.inputs.annualRetirementExpenses = 60_000
    expect(store.results.fireNumber).toBeGreaterThan(first)
  })

  it('coastNumber decreases when retirement age is pushed out (more runway)', () => {
    const store = freshStore()
    store.inputs.annualRetirementExpenses = 40_000
    store.inputs.retirementAge = 60
    const at60 = store.results.coastFireNumber
    store.inputs.retirementAge = 70
    const at70 = store.results.coastFireNumber
    expect(at70).toBeLessThan(at60)
  })

  it('hasCoasted is true when current total already meets the coast number', () => {
    const store = freshStore()
    store.inputs.annualRetirementExpenses = 1
    store.inputs.currentSippValue = 1_000_000
    expect(store.results.hasCoasted).toBe(true)
    expect(store.results.amountToCoast).toBe(0)
  })

  it('hasCoasted is false and amountToCoast > 0 when not yet coasted', () => {
    const store = freshStore()
    store.inputs.annualRetirementExpenses = 50_000
    store.inputs.currentSippValue = 0
    store.inputs.currentIsaValue = 0
    store.inputs.currentGiaValue = 0
    store.inputs.currentCashValue = 0
    expect(store.results.hasCoasted).toBe(false)
    expect(store.results.amountToCoast).toBeGreaterThan(0)
  })

  it('projectedCoastAge and projectedCoastYear are null when never reached within projection', () => {
    const store = freshStore()
    store.inputs.annualRetirementExpenses = 1_000_000
    store.inputs.currentSippValue = 0
    store.inputs.currentIsaValue = 0
    store.inputs.currentGiaValue = 0
    store.inputs.currentCashValue = 0
    store.inputs.monthlyContributionSipp = 0
    store.inputs.monthlyContributionIsa = 0
    store.inputs.monthlyContributionGia = 0
    store.inputs.monthlyContributionCash = 0
    expect(store.results.projectedCoastAge).toBeNull()
    expect(store.results.projectedCoastYear).toBeNull()
  })

  it('monthly contributions from all three other types are summed into the projection', () => {
    const store = freshStore()
    store.inputs.annualRetirementExpenses = 30_000
    store.inputs.monthlyContributionIsa = 200
    store.inputs.monthlyContributionGia = 100
    store.inputs.monthlyContributionCash = 50
    const lastRow = store.rows[store.rows.length - 1]
    expect(lastRow.otherValue).toBeGreaterThan(0)
  })

  it('projectedCoastAge is the current age when already coasted', () => {
    const store = freshStore()
    store.inputs.annualRetirementExpenses = 1
    store.inputs.currentSippValue = 1_000_000
    expect(store.results.projectedCoastAge).toBe(store.inputs.currentAge)
  })
})

describe('useCalculatorStore — rows', () => {
  it('exposes projection rows with length retirementAge - currentAge + 1', () => {
    const store = freshStore()
    store.inputs.currentAge = 35
    store.inputs.retirementAge = 60
    expect(store.rows).toHaveLength(26)
  })

  it('returns empty rows when retirementAge is less than currentAge', () => {
    const store = freshStore()
    store.inputs.currentAge = 50
    store.inputs.retirementAge = 40
    expect(store.rows).toHaveLength(0)
  })
})

describe('useCalculatorStore — resetToDefaults', () => {
  it('restores all inputs to their original defaults', () => {
    const store = freshStore()
    store.inputs.currentSippValue = 999_999
    store.inputs.annualRetirementExpenses = 100_000
    store.inputs.realAnnualReturnRate = 7
    store.resetToDefaults()
    expect(store.inputs.currentSippValue).toBe(0)
    expect(store.inputs.annualRetirementExpenses).toBe(0)
    expect(store.inputs.realAnnualReturnRate).toBe(5)
  })
})
