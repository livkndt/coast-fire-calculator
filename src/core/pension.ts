/**
 * The minimum age at which a SIPP (or other personal pension) can be accessed.
 * Rises from 55 to 57 on 6 April 2028. This app uses 57 as the forward-looking rule.
 */
export const SIPP_MIN_ACCESS_AGE = 57

/**
 * Converts a weekly State Pension amount to an annual figure (× 52 weeks).
 *
 * @param weeklyAmount - Weekly State Pension (£), e.g. 221.20 for the 2024/25 full new State Pension
 * @returns Annual State Pension (£)
 */
export function weeklyToAnnual(weeklyAmount: number): number {
  if (weeklyAmount < 0) {
    throw new RangeError('weeklyAmount must be non-negative')
  }
  return weeklyAmount * 52
}

/**
 * Returns whether a SIPP can be drawn at the given retirement age,
 * based on the minimum access age rule.
 *
 * @param retirementAge - The age at which the user intends to retire
 */
export function isSippAccessible(retirementAge: number): boolean {
  return retirementAge >= SIPP_MIN_ACCESS_AGE
}
