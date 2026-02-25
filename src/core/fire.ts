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
