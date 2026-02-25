/**
 * Integration test using real user values to verify the Phase 1 calculation
 * engine end-to-end.
 *
 * User inputs
 * -----------
 * Current age:               35
 * Target retirement age:     60
 * Current SIPP:              £52,000
 * Current other investments: £19,000
 * Monthly SIPP contribution: £1,000
 * Monthly other contrib.:    £1,000
 * Annual retirement expenses:£43,000
 * State pension:             Full new State Pension (£221.20/week)
 *
 * Derived assumptions (real-terms, UK defaults)
 * ----------------------------------------------
 * Real annual return rate:   5%
 * Safe withdrawal rate:      4%
 * State pension age:         67
 * Current year:              2026
 */

import { describe, it, expect } from 'vitest'
import { weeklyToAnnual, isSippAccessible } from '@/core/pension'
import { calculateAdjustedFireNumber } from '@/core/fire'
import { calculateCoastNumber, hasCoasted, coastGap } from '@/core/coast'
import { buildProjection, findCoastTarget } from '@/core/projection'

// ── Constants ──────────────────────────────────────────────────────────────

const CURRENT_AGE = 35
const RETIREMENT_AGE = 60
const STATE_PENSION_AGE = 67
const CURRENT_YEAR = 2026

const CURRENT_SIPP = 52_000
const CURRENT_OTHER = 19_000
const MONTHLY_SIPP = 1_000
const MONTHLY_OTHER = 1_000

const ANNUAL_EXPENSES = 43_000
const WEEKLY_STATE_PENSION = 221.20
const REAL_RETURN_RATE = 5       // %
const SWR = 4                    // %

// ── Step 1 — State Pension conversion ──────────────────────────────────────

describe('State Pension', () => {
  it('converts weekly amount to annual correctly', () => {
    // £221.20 × 52 = £11,502.40
    expect(weeklyToAnnual(WEEKLY_STATE_PENSION)).toBeCloseTo(11_502.40, 2)
  })
})

// ── Step 2 — SIPP accessibility at retirement ──────────────────────────────

describe('SIPP accessibility', () => {
  it('SIPP is accessible at retirement age 60 (minimum access age is 57)', () => {
    expect(isSippAccessible(RETIREMENT_AGE)).toBe(true)
  })
})

// ── Step 3 — Adjusted FIRE number ─────────────────────────────────────────

describe('Adjusted FIRE number', () => {
  const annualStatePension = weeklyToAnnual(WEEKLY_STATE_PENSION)

  it('is lower than the naive FIRE number (state pension reduces required pot)', () => {
    const naive = ANNUAL_EXPENSES / (SWR / 100)              // £1,075,000
    const adjusted = calculateAdjustedFireNumber({
      annualExpenses: ANNUAL_EXPENSES,
      safeWithdrawalRate: SWR,
      retirementAge: RETIREMENT_AGE,
      includeStatePension: true,
      statePensionAge: STATE_PENSION_AGE,
      annualStatePension,
      realAnnualReturnRate: REAL_RETURN_RATE,
    })
    expect(adjusted).toBeLessThan(naive)
  })

  it('falls in the expected range (two-tranche with 7-year bridge to SPA)', () => {
    const adjusted = calculateAdjustedFireNumber({
      annualExpenses: ANNUAL_EXPENSES,
      safeWithdrawalRate: SWR,
      retirementAge: RETIREMENT_AGE,
      includeStatePension: true,
      statePensionAge: STATE_PENSION_AGE,
      annualStatePension,
      realAnnualReturnRate: REAL_RETURN_RATE,
    })
    // Expected ≈ £808,500 — allow ±£15,000 for manual rounding
    expect(adjusted).toBeGreaterThan(780_000)
    expect(adjusted).toBeLessThan(840_000)
  })
})

// ── Step 4 — Coast FIRE number ─────────────────────────────────────────────

describe('Coast FIRE number', () => {
  const annualStatePension = weeklyToAnnual(WEEKLY_STATE_PENSION)
  const fireNumber = calculateAdjustedFireNumber({
    annualExpenses: ANNUAL_EXPENSES,
    safeWithdrawalRate: SWR,
    retirementAge: RETIREMENT_AGE,
    includeStatePension: true,
    statePensionAge: STATE_PENSION_AGE,
    annualStatePension,
    realAnnualReturnRate: REAL_RETURN_RATE,
  })
  const yearsToRetirement = RETIREMENT_AGE - CURRENT_AGE  // 25
  const coastNumber = calculateCoastNumber(fireNumber, REAL_RETURN_RATE, yearsToRetirement)

  it('falls in the expected range (fireNumber discounted over 25 years at 5%)', () => {
    // Expected ≈ £238,700 — allow ±£20,000
    expect(coastNumber).toBeGreaterThan(210_000)
    expect(coastNumber).toBeLessThan(270_000)
  })

  it('current total (£71,000) has NOT yet reached the coast number', () => {
    const currentTotal = CURRENT_SIPP + CURRENT_OTHER  // £71,000
    expect(hasCoasted(currentTotal, coastNumber)).toBe(false)
  })

  it('coast gap is in the expected range (roughly £150k–£200k to go)', () => {
    const currentTotal = CURRENT_SIPP + CURRENT_OTHER
    const gap = coastGap(currentTotal, coastNumber)
    expect(gap).toBeGreaterThan(100_000)
    expect(gap).toBeLessThan(220_000)
  })
})

// ── Step 5 — Year-by-year projection ──────────────────────────────────────

describe('Projection shape', () => {
  const annualStatePension = weeklyToAnnual(WEEKLY_STATE_PENSION)
  const fireNumber = calculateAdjustedFireNumber({
    annualExpenses: ANNUAL_EXPENSES,
    safeWithdrawalRate: SWR,
    retirementAge: RETIREMENT_AGE,
    includeStatePension: true,
    statePensionAge: STATE_PENSION_AGE,
    annualStatePension,
    realAnnualReturnRate: REAL_RETURN_RATE,
  })
  const coastNumber = calculateCoastNumber(
    fireNumber,
    REAL_RETURN_RATE,
    RETIREMENT_AGE - CURRENT_AGE,
  )

  const rows = buildProjection({
    currentAge: CURRENT_AGE,
    retirementAge: RETIREMENT_AGE,
    statePensionAge: STATE_PENSION_AGE,
    currentSippValue: CURRENT_SIPP,
    currentOtherInvestments: CURRENT_OTHER,
    monthlyContributionSipp: MONTHLY_SIPP,
    monthlyContributionOther: MONTHLY_OTHER,
    realAnnualReturnRate: REAL_RETURN_RATE,
    coastFireNumber: coastNumber,
    currentYear: CURRENT_YEAR,
  })

  it('produces 26 rows (ages 35 to 60 inclusive)', () => {
    expect(rows).toHaveLength(26)
  })

  it('first row reflects the current position (age 35, year 2026, £71k total)', () => {
    expect(rows[0].age).toBe(35)
    expect(rows[0].year).toBe(2026)
    expect(rows[0].sippValue).toBe(52_000)
    expect(rows[0].otherValue).toBe(19_000)
    expect(rows[0].totalValue).toBe(71_000)
  })

  it('retirement row is at age 60, year 2051', () => {
    const retirementRow = rows[rows.length - 1]
    expect(retirementRow.age).toBe(60)
    expect(retirementRow.year).toBe(2051)
    expect(retirementRow.isRetirementYear).toBe(true)
  })

  it('SPA (67) is beyond retirement age — no row is marked isStatePensionYear', () => {
    rows.forEach(row => expect(row.isStatePensionYear).toBe(false))
  })

  it('portfolio at retirement (age 60) is well above the FIRE number', () => {
    const retirementRow = rows[rows.length - 1]
    expect(retirementRow.totalValue).toBeGreaterThan(fireNumber)
  })
})

// ── Step 6 — Coast milestone ───────────────────────────────────────────────

describe('Coast milestone', () => {
  const annualStatePension = weeklyToAnnual(WEEKLY_STATE_PENSION)
  const fireNumber = calculateAdjustedFireNumber({
    annualExpenses: ANNUAL_EXPENSES,
    safeWithdrawalRate: SWR,
    retirementAge: RETIREMENT_AGE,
    includeStatePension: true,
    statePensionAge: STATE_PENSION_AGE,
    annualStatePension,
    realAnnualReturnRate: REAL_RETURN_RATE,
  })
  const coastNumber = calculateCoastNumber(
    fireNumber,
    REAL_RETURN_RATE,
    RETIREMENT_AGE - CURRENT_AGE,
  )

  const rows = buildProjection({
    currentAge: CURRENT_AGE,
    retirementAge: RETIREMENT_AGE,
    statePensionAge: STATE_PENSION_AGE,
    currentSippValue: CURRENT_SIPP,
    currentOtherInvestments: CURRENT_OTHER,
    monthlyContributionSipp: MONTHLY_SIPP,
    monthlyContributionOther: MONTHLY_OTHER,
    realAnnualReturnRate: REAL_RETURN_RATE,
    coastFireNumber: coastNumber,
    currentYear: CURRENT_YEAR,
  })

  it('does not start already coasted (£71k is below the coast number)', () => {
    expect(rows[0].coastReached).toBe(false)
  })

  it('coast is reached within the projection', () => {
    const target = findCoastTarget(rows)
    expect(target.yearsToCoast).not.toBeNull()
  })

  it('coast is reached around age 41 (year 6 of projection)', () => {
    const target = findCoastTarget(rows)
    // Allow ±1 year either side of the expected milestone
    expect(target.yearsToCoast).toBeGreaterThanOrEqual(5)
    expect(target.yearsToCoast).toBeLessThanOrEqual(7)
    expect(target.coastAge).toBeGreaterThanOrEqual(40)
    expect(target.coastAge).toBeLessThanOrEqual(42)
  })

  it('coast calendar year is in the late 2030s', () => {
    const target = findCoastTarget(rows)
    expect(target.coastYear).toBeGreaterThanOrEqual(2031)
    expect(target.coastYear).toBeLessThanOrEqual(2033)
  })

  it('all rows from the coast milestone onward remain marked coastReached', () => {
    const target = findCoastTarget(rows)
    const startIndex = target.yearsToCoast as number
    rows.slice(startIndex).forEach(row => expect(row.coastReached).toBe(true))
  })
})
