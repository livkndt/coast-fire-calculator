import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { weeklyToAnnual } from '@/core/pension'
import { calculateAdjustedFireNumber } from '@/core/fire'
import { projectTerminalSippFraction } from '@/core/tax'
import { calculateCoastNumber, hasCoasted, coastGap } from '@/core/coast'
import { buildProjection, findCoastTarget } from '@/core/projection'
import type { CoastFireInputs, CoastFireResult } from '@/types'
import type { ProjectionRow } from '@/core/projection'

const DEFAULT_INPUTS: CoastFireInputs = {
  currentAge: 35,
  retirementAge: 60,
  includeStatePension: true,
  statePensionAge: 67,
  statePensionWeeklyAmount: 221.20,
  currentSippValue: 0,
  currentIsaValue: 0,
  currentGiaValue: 0,
  currentCashValue: 0,
  monthlyContributionSipp: 0,
  monthlyContributionIsa: 0,
  monthlyContributionGia: 0,
  monthlyContributionCash: 0,
  annualRetirementExpenses: 0,
  realAnnualReturnRate: 5,
  safeWithdrawalRate: 4,
  pensionTaxRate: 0,
}

export const useCalculatorStore = defineStore('calculator', () => {
  const inputs = ref<CoastFireInputs>({ ...DEFAULT_INPUTS })

  const totalOther = computed(() =>
    inputs.value.currentIsaValue + inputs.value.currentGiaValue + inputs.value.currentCashValue
  )

  const totalMonthlyOther = computed(() =>
    inputs.value.monthlyContributionIsa + inputs.value.monthlyContributionGia + inputs.value.monthlyContributionCash
  )

  /** Year-by-year projection rows — empty if inputs are invalid. */
  const rows = computed<ProjectionRow[]>(() => {
    if (inputs.value.retirementAge < inputs.value.currentAge) return []
    return buildProjection({
      currentAge: inputs.value.currentAge,
      retirementAge: inputs.value.retirementAge,
      statePensionAge: inputs.value.statePensionAge,
      currentSippValue: inputs.value.currentSippValue,
      currentOtherInvestments: totalOther.value,
      monthlyContributionSipp: inputs.value.monthlyContributionSipp,
      monthlyContributionOther: totalMonthlyOther.value,
      realAnnualReturnRate: inputs.value.realAnnualReturnRate,
      coastFireNumber: _coastFireNumber(),
      currentYear: new Date().getFullYear(),
    })
  })

  /** Derived results — recomputed whenever any input changes. */
  const results = computed<CoastFireResult>(() => {
    const fireNumber = _fireNumber()
    const coastFireNumber = _coastFireNumber()
    const currentTotal = inputs.value.currentSippValue + totalOther.value
    const coasted = hasCoasted(currentTotal, coastFireNumber)
    const amountToCoast = coastGap(currentTotal, coastFireNumber)
    const target = findCoastTarget(rows.value)

    return {
      fireNumber,
      coastFireNumber,
      currentTotal,
      hasCoasted: coasted,
      amountToCoast,
      projectedCoastYear: target.coastYear,
      projectedCoastAge: target.coastAge,
    }
  })

  function resetToDefaults() {
    inputs.value = { ...DEFAULT_INPUTS }
  }

  // ── Private helpers ────────────────────────────────────────────────────

  function _inputsValid(): boolean {
    const i = inputs.value
    return (
      i.safeWithdrawalRate > 0 &&
      i.realAnnualReturnRate > 0 &&
      i.annualRetirementExpenses >= 0 &&
      i.retirementAge > i.currentAge
    )
  }

  function _fireNumber(): number {
    if (!_inputsValid()) return 0
    const annualStatePension = weeklyToAnnual(inputs.value.statePensionWeeklyAmount)
    const sippFraction = projectTerminalSippFraction({
      currentAge: inputs.value.currentAge,
      retirementAge: inputs.value.retirementAge,
      currentSippValue: inputs.value.currentSippValue,
      currentOtherInvestments: totalOther.value,
      monthlyContributionSipp: inputs.value.monthlyContributionSipp,
      monthlyContributionOther: totalMonthlyOther.value,
      realAnnualReturnRate: inputs.value.realAnnualReturnRate,
    })
    return calculateAdjustedFireNumber({
      annualExpenses: inputs.value.annualRetirementExpenses,
      safeWithdrawalRate: inputs.value.safeWithdrawalRate,
      retirementAge: inputs.value.retirementAge,
      includeStatePension: inputs.value.includeStatePension,
      statePensionAge: inputs.value.statePensionAge,
      annualStatePension,
      realAnnualReturnRate: inputs.value.realAnnualReturnRate,
      sippFraction,
      pensionTaxRate: inputs.value.pensionTaxRate,
    })
  }

  function _coastFireNumber(): number {
    if (!_inputsValid()) return 0
    const yearsToRetirement = Math.max(0, inputs.value.retirementAge - inputs.value.currentAge)
    return calculateCoastNumber(_fireNumber(), inputs.value.realAnnualReturnRate, yearsToRetirement)
  }

  return { inputs, rows, results, resetToDefaults }
})
