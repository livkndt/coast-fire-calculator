export interface ProjectionRow {
  year: number
  age: number
  sippValue: number
  otherValue: number
  totalValue: number
  /** True from the first year the total meets or exceeds the coast number, and stays true. */
  coastReached: boolean
  isRetirementYear: boolean
  isStatePensionYear: boolean
}

export interface ProjectionInputs {
  currentAge: number
  retirementAge: number
  statePensionAge: number
  currentSippValue: number
  currentOtherInvestments: number
  monthlyContributionSipp: number
  monthlyContributionOther: number
  realAnnualReturnRate: number  // %, e.g. 5 for 5%
  coastFireNumber: number       // pre-calculated target; pass 0 to show as always coasted
  currentYear: number           // e.g. new Date().getFullYear()
}

/**
 * Builds a year-by-year projection of portfolio growth from the current age
 * to the chosen retirement age (inclusive).
 *
 * Row 0 is the current position. Each subsequent row represents the end-of-year
 * value after applying real growth and annual contributions (monthly × 12).
 *
 * Both SIPP and other investments are tracked separately but counted together
 * when determining whether the Coast FIRE number has been reached.
 *
 * Assumption: annual compounding; contributions made at end of each year.
 * All values are in real (inflation-adjusted) terms.
 */
export interface CoastTarget {
  /** How many years from now until the coast number is first reached.
   *  0 = already coasted. null = not reached within the projection. */
  yearsToCoast: number | null
  coastYear: number | null
  coastAge: number | null
}

/**
 * Finds when the portfolio first reaches the Coast FIRE number within a
 * projection built by `buildProjection`.
 *
 * Returns `yearsToCoast: 0` if the starting portfolio already meets the target.
 * Returns all nulls if the coast number is not reached before retirement.
 */
export function findCoastTarget(rows: ProjectionRow[]): CoastTarget {
  const index = rows.findIndex((row) => row.coastReached)

  if (index === -1) {
    return { yearsToCoast: null, coastYear: null, coastAge: null }
  }

  return {
    yearsToCoast: index,
    coastYear: rows[index].year,
    coastAge: rows[index].age,
  }
}

export function buildProjection(inputs: ProjectionInputs): ProjectionRow[] {
  const {
    currentAge,
    retirementAge,
    statePensionAge,
    currentSippValue,
    currentOtherInvestments,
    monthlyContributionSipp,
    monthlyContributionOther,
    realAnnualReturnRate,
    coastFireNumber,
    currentYear,
  } = inputs

  if (retirementAge < currentAge) {
    throw new RangeError('retirementAge must be greater than or equal to currentAge')
  }
  if (realAnnualReturnRate < 0) {
    throw new RangeError('realAnnualReturnRate must be non-negative')
  }

  const r = realAnnualReturnRate / 100
  const annualSipp = monthlyContributionSipp * 12
  const annualOther = monthlyContributionOther * 12
  const totalYears = retirementAge - currentAge

  const rows: ProjectionRow[] = []
  let sippValue = currentSippValue
  let otherValue = currentOtherInvestments
  let everCoasted = false

  for (let i = 0; i <= totalYears; i++) {
    const age = currentAge + i
    const totalValue = sippValue + otherValue

    if (totalValue >= coastFireNumber) {
      everCoasted = true
    }

    rows.push({
      year: currentYear + i,
      age,
      sippValue,
      otherValue,
      totalValue,
      coastReached: everCoasted,
      isRetirementYear: age === retirementAge,
      isStatePensionYear: age === statePensionAge,
    })

    // Apply growth and contributions ready for the next row.
    // Skipped after the final row to avoid unnecessary work.
    if (i < totalYears) {
      sippValue = sippValue * (1 + r) + annualSipp
      otherValue = otherValue * (1 + r) + annualOther
    }
  }

  return rows
}
