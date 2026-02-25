/**
 * Calculates the Coast FIRE number — the amount needed in investments today
 * such that, with no further contributions, the pot will grow to the target
 * FIRE number by the chosen retirement age.
 *
 * Formula: coastNumber = fireNumber / (1 + r)^yearsToRetirement
 *
 * All values are in real (inflation-adjusted) terms.
 *
 * @param fireNumber - Target retirement pot (£, today's money)
 * @param realAnnualReturnRate - Expected real return as a %, e.g. 5 for 5%
 * @param yearsToRetirement - Years between now and the target retirement age
 * @returns The Coast FIRE number (£)
 */
export function calculateCoastNumber(
  fireNumber: number,
  realAnnualReturnRate: number,
  yearsToRetirement: number,
): number {
  if (fireNumber < 0) {
    throw new RangeError('fireNumber must be non-negative')
  }
  if (realAnnualReturnRate < 0) {
    throw new RangeError('realAnnualReturnRate must be non-negative')
  }
  if (yearsToRetirement < 0) {
    throw new RangeError('yearsToRetirement must be non-negative')
  }

  const r = realAnnualReturnRate / 100
  return fireNumber / Math.pow(1 + r, yearsToRetirement)
}

/**
 * Returns true if the current total investments have reached (or exceeded)
 * the Coast FIRE number — i.e. the user can stop making additional
 * contributions and still retire on track.
 */
export function hasCoasted(currentTotal: number, coastNumber: number): boolean {
  return currentTotal >= coastNumber
}

/**
 * Returns the shortfall between the current investments and the Coast FIRE
 * number. Returns 0 if the user has already coasted (no negative gap).
 */
export function coastGap(currentTotal: number, coastNumber: number): number {
  return Math.max(0, coastNumber - currentTotal)
}
