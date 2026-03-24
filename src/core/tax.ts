/**
 * Computes the SIPP proportion of the total portfolio at retirement using
 * analytical compounding (avoids circular dependency on projection rows).
 */
export function projectTerminalSippFraction(inputs: {
  currentAge: number
  retirementAge: number
  currentSippValue: number
  currentOtherInvestments: number
  monthlyContributionSipp: number
  monthlyContributionOther: number
  realAnnualReturnRate: number
}): number {
  const {
    currentAge,
    retirementAge,
    currentSippValue,
    currentOtherInvestments,
    monthlyContributionSipp,
    monthlyContributionOther,
    realAnnualReturnRate,
  } = inputs

  const years = Math.max(0, retirementAge - currentAge)
  const r = realAnnualReturnRate / 100

  let sippEnd: number
  let otherEnd: number

  if (r === 0) {
    sippEnd = currentSippValue + monthlyContributionSipp * 12 * years
    otherEnd = currentOtherInvestments + monthlyContributionOther * 12 * years
  } else {
    const growthFactor = Math.pow(1 + r, years)
    const annuityFactor = (growthFactor - 1) / r
    sippEnd = currentSippValue * growthFactor + monthlyContributionSipp * 12 * annuityFactor
    otherEnd = currentOtherInvestments * growthFactor + monthlyContributionOther * 12 * annuityFactor
  }

  const total = sippEnd + otherEnd
  if (total === 0) return 0
  return sippEnd / total
}

/**
 * Returns the gross annual withdrawal needed to achieve netExpenses after
 * SIPP income tax (25% tax-free element applied per withdrawal in
 * flexi-access drawdown).
 *
 * Formula: grossExpenses = netExpenses × [sippFraction / (1 − 0.75t) + (1 − sippFraction)]
 *
 * If pensionTaxRate = 0 or sippFraction = 0, returns netExpenses unchanged.
 *
 * @param netExpenses  - Annual spending in retirement (today's money)
 * @param sippFraction - Proportion of pot in SIPP at retirement (0–1)
 * @param pensionTaxRate - Marginal income tax rate on SIPP withdrawals, % (e.g. 20)
 */
export function grossAnnualExpenses(
  netExpenses: number,
  sippFraction: number,
  pensionTaxRate: number,
): number {
  if (pensionTaxRate === 0 || sippFraction === 0) return netExpenses
  const t = pensionTaxRate / 100
  return netExpenses * (sippFraction / (1 - 0.75 * t) + (1 - sippFraction))
}
