/**
 * Calculates the total investment pot required to sustain a given annual
 * spending indefinitely, using the Safe Withdrawal Rate method.
 *
 * All values are in real (inflation-adjusted) terms — i.e. today's money.
 *
 * @param annualExpenses - Annual spending in retirement (£, today's money)
 * @param safeWithdrawalRate - SWR as a percentage, e.g. 4 for 4%
 * @returns The FIRE number (£)
 */
export function calculateFireNumber(
  annualExpenses: number,
  safeWithdrawalRate: number,
): number {
  if (annualExpenses < 0) {
    throw new RangeError('annualExpenses must be non-negative')
  }
  if (safeWithdrawalRate <= 0) {
    throw new RangeError('safeWithdrawalRate must be a positive number')
  }

  return annualExpenses / (safeWithdrawalRate / 100)
}

export interface AdjustedFireInputs {
  annualExpenses: number
  safeWithdrawalRate: number      // %, e.g. 4 for 4%
  retirementAge: number
  includeStatePension: boolean
  statePensionAge: number
  annualStatePension: number      // £/year
  realAnnualReturnRate: number    // %, e.g. 5 for 5%
}

/**
 * Calculates the total pot required at retirement, accounting for the UK State
 * Pension and the gap between retirement age and State Pension age.
 *
 * Uses a two-tranche approach when retiring before SPA:
 *   - Tranche 1 (bridge): present value of funding full expenses during the gap
 *   - Tranche 2 (long-term): present value of the pot needed at SPA to fund
 *     reduced expenses (after state pension) indefinitely
 *
 * All values are in real (inflation-adjusted) terms.
 */
export function calculateAdjustedFireNumber(inputs: AdjustedFireInputs): number {
  const {
    annualExpenses,
    safeWithdrawalRate,
    retirementAge,
    includeStatePension,
    statePensionAge,
    annualStatePension,
    realAnnualReturnRate,
  } = inputs

  if (annualExpenses < 0) {
    throw new RangeError('annualExpenses must be non-negative')
  }
  if (safeWithdrawalRate <= 0) {
    throw new RangeError('safeWithdrawalRate must be a positive number')
  }
  if (realAnnualReturnRate < 0) {
    throw new RangeError('realAnnualReturnRate must be non-negative')
  }

  if (!includeStatePension) {
    return calculateFireNumber(annualExpenses, safeWithdrawalRate)
  }

  const swr = safeWithdrawalRate / 100
  const r = realAnnualReturnRate / 100
  const gapYears = Math.max(0, statePensionAge - retirementAge)
  // Net expenses after state pension kicks in (floored at 0)
  const netExpenses = Math.max(0, annualExpenses - annualStatePension)

  // No gap: state pension available from retirement day 1
  if (gapYears === 0) {
    return netExpenses / swr
  }

  // Two-tranche approach for early retirement
  const phase2Pot = netExpenses / swr

  if (r === 0) {
    // No real growth: bridge is a simple sum, phase 2 pot needs no discounting
    return annualExpenses * gapYears + phase2Pot
  }

  const growthFactor = Math.pow(1 + r, gapYears)
  // Present value of an annuity: fund full expenses across the gap years
  const bridge = (annualExpenses * (1 - 1 / growthFactor)) / r
  // Discount phase 2 pot back to retirement date
  const phase2PotAtRetirement = phase2Pot / growthFactor

  return bridge + phase2PotAtRetirement
}
