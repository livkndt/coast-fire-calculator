import { describe, it, expect } from 'vitest'
import { buildProjection, findCoastTarget } from '@/core/projection'
import type { ProjectionInputs } from '@/core/projection'

// Baseline inputs reused across tests — individual cases override what they need
const base: ProjectionInputs = {
  currentAge: 40,
  retirementAge: 45,
  statePensionAge: 67,        // outside projection range → never fires
  currentSippValue: 100_000,
  currentOtherInvestments: 50_000,
  monthlyContributionSipp: 0,
  monthlyContributionOther: 0,
  realAnnualReturnRate: 5,
  coastFireNumber: 999_999,   // not reached by default
  currentYear: 2025,
}

describe('buildProjection — shape', () => {
  it('produces one row per year from current age to retirement age inclusive', () => {
    // ages 40, 41, 42, 43, 44, 45 → 6 rows
    expect(buildProjection(base)).toHaveLength(6)
  })

  it('produces a single row when retirement age equals current age', () => {
    expect(buildProjection({ ...base, retirementAge: 40 })).toHaveLength(1)
  })

  it('first row reflects the current position before any growth', () => {
    const rows = buildProjection(base)
    expect(rows[0].age).toBe(40)
    expect(rows[0].year).toBe(2025)
    expect(rows[0].sippValue).toBe(100_000)
    expect(rows[0].otherValue).toBe(50_000)
    expect(rows[0].totalValue).toBe(150_000)
  })

  it('last row is the retirement year', () => {
    const rows = buildProjection(base)
    const last = rows[rows.length - 1]
    expect(last.age).toBe(45)
    expect(last.year).toBe(2030)
  })

  it('each row has the correct sequential age and calendar year', () => {
    const rows = buildProjection(base)
    rows.forEach((row, i) => {
      expect(row.age).toBe(40 + i)
      expect(row.year).toBe(2025 + i)
    })
  })
})

describe('buildProjection — growth and contributions', () => {
  it('applies the real return to both SIPP and other values after row 0', () => {
    // Row 0: 100k + 50k = 150k (current state)
    // Row 1: 100k × 1.1 = 110k, 50k × 1.1 = 55k, total = 165k
    const rows = buildProjection({ ...base, realAnnualReturnRate: 10 })
    expect(rows[1].sippValue).toBeCloseTo(110_000, 2)
    expect(rows[1].otherValue).toBeCloseTo(55_000, 2)
    expect(rows[1].totalValue).toBeCloseTo(165_000, 2)
  })

  it('compounds growth correctly across multiple years', () => {
    // 10k at 10% → 11k → 12.1k
    const rows = buildProjection({
      ...base,
      currentSippValue: 10_000,
      currentOtherInvestments: 0,
      realAnnualReturnRate: 10,
    })
    expect(rows[1].sippValue).toBeCloseTo(11_000, 2)
    expect(rows[2].sippValue).toBeCloseTo(12_100, 2)
  })

  it('adds monthly contributions as an annual lump each year after row 0', () => {
    // 0% growth, £500/mo SIPP + £1,000/mo other
    // Row 0: 0 (starting state)
    // Row 1: £6,000 SIPP + £12,000 other = £18,000
    const rows = buildProjection({
      ...base,
      currentSippValue: 0,
      currentOtherInvestments: 0,
      realAnnualReturnRate: 0,
      monthlyContributionSipp: 500,
      monthlyContributionOther: 1_000,
    })
    expect(rows[0].totalValue).toBe(0)
    expect(rows[1].sippValue).toBe(6_000)
    expect(rows[1].otherValue).toBe(12_000)
    expect(rows[1].totalValue).toBe(18_000)
  })

  it('compounds growth AND contributions together from year 2 onward', () => {
    // Start 0, add £12k/yr at 10%
    // Row 0: 0
    // Row 1: 0 × 1.1 + 12_000 = 12_000
    // Row 2: 12_000 × 1.1 + 12_000 = 13_200 + 12_000 = 25_200
    const rows = buildProjection({
      ...base,
      currentSippValue: 0,
      currentOtherInvestments: 0,
      realAnnualReturnRate: 10,
      monthlyContributionSipp: 0,
      monthlyContributionOther: 1_000,
    })
    expect(rows[1].totalValue).toBeCloseTo(12_000, 2)
    expect(rows[2].totalValue).toBeCloseTo(25_200, 2)
  })

  it('growth is zero and values stay flat when return rate is 0 and no contributions', () => {
    const rows = buildProjection({ ...base, realAnnualReturnRate: 0 })
    rows.forEach(row => {
      expect(row.sippValue).toBe(100_000)
      expect(row.otherValue).toBe(50_000)
    })
  })
})

describe('buildProjection — coast milestone', () => {
  // Use 0% growth + £1k/mo contributions and a £25k coast target
  // Row 0: £0 → not coasted
  // Row 1: £12k → not coasted
  // Row 2: £24k → not coasted
  // Row 3: £36k → coasted ✓
  const coastInputs: ProjectionInputs = {
    ...base,
    currentSippValue: 0,
    currentOtherInvestments: 0,
    monthlyContributionOther: 1_000,
    realAnnualReturnRate: 0,
    coastFireNumber: 25_000,
  }

  it('marks coastReached true in the first year the total meets the coast number', () => {
    const rows = buildProjection(coastInputs)
    expect(rows[0].coastReached).toBe(false)
    expect(rows[1].coastReached).toBe(false)
    expect(rows[2].coastReached).toBe(false)
    expect(rows[3].coastReached).toBe(true)
  })

  it('keeps coastReached true on all rows after it first fires', () => {
    const rows = buildProjection(coastInputs)
    const firstCoasted = rows.findIndex(r => r.coastReached)
    rows.slice(firstCoasted).forEach(row => expect(row.coastReached).toBe(true))
  })

  it('marks all rows as coastReached when starting total already meets the coast number', () => {
    const rows = buildProjection({ ...base, coastFireNumber: 100 })
    rows.forEach(row => expect(row.coastReached).toBe(true))
  })

  it('marks no rows as coastReached when coast number is never reached', () => {
    const rows = buildProjection({ ...base, coastFireNumber: 999_999_999 })
    rows.forEach(row => expect(row.coastReached).toBe(false))
  })
})

describe('buildProjection — milestone markers', () => {
  it('marks isRetirementYear true only on the retirement age row', () => {
    const rows = buildProjection(base) // retirementAge: 45
    rows.forEach(row => expect(row.isRetirementYear).toBe(row.age === 45))
  })

  it('marks isStatePensionYear true only on the SPA row when it falls within the projection', () => {
    const rows = buildProjection({ ...base, statePensionAge: 43 })
    rows.forEach(row => expect(row.isStatePensionYear).toBe(row.age === 43))
  })

  it('marks no rows as isStatePensionYear when SPA is beyond the retirement age', () => {
    // base has statePensionAge: 67, retirementAge: 45 — SPA is outside range
    const rows = buildProjection(base)
    rows.forEach(row => expect(row.isStatePensionYear).toBe(false))
  })
})

describe('buildProjection — validation', () => {
  it('throws when retirement age is less than current age', () => {
    expect(() => buildProjection({ ...base, retirementAge: 39 })).toThrow(RangeError)
  })

  it('throws for a negative real return rate', () => {
    expect(() => buildProjection({ ...base, realAnnualReturnRate: -1 })).toThrow(RangeError)
  })
})

describe('findCoastTarget', () => {
  // Helpers: build a projection with the coast number already / not yet / never reached
  const alreadyCoasted = () =>
    buildProjection({ ...base, coastFireNumber: 1 }) // total of 150k on row 0 → instant coast

  const coastsInYear3 = () =>
    buildProjection({
      ...base,
      currentSippValue: 0,
      currentOtherInvestments: 0,
      monthlyContributionOther: 1_000,
      realAnnualReturnRate: 0,
      coastFireNumber: 25_000,
      // Row 0: £0, Row 1: £12k, Row 2: £24k, Row 3: £36k ← first coasted
    })

  const neverCoasts = () =>
    buildProjection({ ...base, coastFireNumber: 999_999_999 })

  it('returns yearsToCoast: 0 when the starting portfolio already meets the coast number', () => {
    const result = findCoastTarget(alreadyCoasted())
    expect(result.yearsToCoast).toBe(0)
    expect(result.coastYear).toBe(2025)
    expect(result.coastAge).toBe(40)
  })

  it('returns the correct year index when coast is reached mid-projection', () => {
    const result = findCoastTarget(coastsInYear3())
    expect(result.yearsToCoast).toBe(3)
    expect(result.coastYear).toBe(2028) // currentYear 2025 + 3
    expect(result.coastAge).toBe(43)    // currentAge 40 + 3
  })

  it('returns all nulls when the coast number is never reached within the projection', () => {
    const result = findCoastTarget(neverCoasts())
    expect(result.yearsToCoast).toBeNull()
    expect(result.coastYear).toBeNull()
    expect(result.coastAge).toBeNull()
  })

  it('returns all nulls for an empty projection array', () => {
    const result = findCoastTarget([])
    expect(result.yearsToCoast).toBeNull()
    expect(result.coastYear).toBeNull()
    expect(result.coastAge).toBeNull()
  })
})
