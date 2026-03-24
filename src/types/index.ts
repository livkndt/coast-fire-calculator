/**
 * All monetary values are in today's money (real terms).
 * Rates are expressed as percentages, e.g. 5 means 5%.
 */
export interface CoastFireInputs {
  currentAge: number
  retirementAge: number

  // State pension
  includeStatePension: boolean
  statePensionAge: number           // Default: 67 (current UK SPA)
  statePensionWeeklyAmount: number  // Default: £221.20 (2024/25 full new State Pension)

  // Investments — split by accessibility
  currentSippValue: number          // Locked until age 57 (rising from 55 in 2028)
  // Accessible anytime — ISA, GIA, savings tracked separately
  currentIsaValue: number
  currentGiaValue: number
  currentCashValue: number

  // Contributions (monthly, in today's money)
  monthlyContributionSipp: number
  monthlyContributionIsa: number
  monthlyContributionGia: number
  monthlyContributionCash: number

  // Retirement spending & assumptions
  annualRetirementExpenses: number  // In today's money
  realAnnualReturnRate: number      // % after inflation, e.g. 5
  safeWithdrawalRate: number        // %, e.g. 4
  pensionTaxRate: number            // Marginal income tax rate on SIPP withdrawals, %, e.g. 20. Default 0.
}

export interface CoastFireResult {
  fireNumber: number                // Total pot needed at retirement
  coastFireNumber: number           // What you need invested today to coast
  currentTotal: number              // Current SIPP + other investments
  hasCoasted: boolean
  amountToCoast: number             // 0 if already coasted
  projectedCoastYear: number | null // Calendar year; null if not reached within projection
  projectedCoastAge: number | null  // User age; null if not reached within projection
}
