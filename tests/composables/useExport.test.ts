import { describe, it, expect } from 'vitest'
import { buildCsvContent, buildSummaryText } from '@/composables/useExport'
import type { ProjectionRow } from '@/core/projection'
import type { CoastFireInputs, CoastFireResult } from '@/types'

// ── Helpers ────────────────────────────────────────────────────────────────

function row(overrides: Partial<ProjectionRow> = {}): ProjectionRow {
  return {
    year: 2026, age: 35, sippValue: 0, otherValue: 0, totalValue: 0,
    coastReached: false, isRetirementYear: false, isStatePensionYear: false,
    ...overrides,
  }
}

const sampleRows: ProjectionRow[] = [
  row({ year: 2026, age: 35, sippValue: 30_000, otherValue: 20_000, totalValue: 50_000 }),
  row({ year: 2027, age: 36, sippValue: 40_000, otherValue: 30_000, totalValue: 70_000 }),
  row({ year: 2028, age: 37, sippValue: 55_000, otherValue: 45_000, totalValue: 100_000, coastReached: true }),
  row({ year: 2029, age: 38, sippValue: 70_000, otherValue: 55_000, totalValue: 125_000, coastReached: true }),
  row({ year: 2030, age: 39, sippValue: 85_000, otherValue: 65_000, totalValue: 150_000, coastReached: true, isRetirementYear: true }),
]

const baseResult: CoastFireResult = {
  fireNumber: 800_000,
  coastFireNumber: 200_000,
  currentTotal: 50_000,
  hasCoasted: false,
  amountToCoast: 150_000,
  projectedCoastAge: 37,
  projectedCoastYear: 2028,
}

const baseInputs: CoastFireInputs = {
  currentAge: 35,
  retirementAge: 39,
  includeStatePension: true,
  statePensionAge: 67,
  statePensionWeeklyAmount: 221.20,
  currentSippValue: 30_000,
  currentIsaValue: 15_000,
  currentGiaValue: 3_000,
  currentCashValue: 2_000,
  monthlyContributionSipp: 500,
  monthlyContributionIsa: 300,
  monthlyContributionGia: 100,
  monthlyContributionCash: 100,
  annualRetirementExpenses: 32_000,
  realAnnualReturnRate: 5,
  safeWithdrawalRate: 4,
}

// ── buildCsvContent ────────────────────────────────────────────────────────

describe('buildCsvContent — structure', () => {
  it('first line is a header row', () => {
    const lines = buildCsvContent(sampleRows).split('\n')
    // Header should not be a number
    expect(Number.isNaN(Number(lines[0].split(',')[0]))).toBe(true)
  })

  it('total line count equals rows.length + 1 (header + data)', () => {
    const lines = buildCsvContent(sampleRows).split('\n')
    expect(lines).toHaveLength(sampleRows.length + 1)
  })

  it('each data row has 7 comma-separated values', () => {
    const lines = buildCsvContent(sampleRows).split('\n')
    lines.slice(1).forEach(line => {
      expect(line.split(',').length).toBe(7)
    })
  })

  it('returns a header + one data row for a single-row projection', () => {
    const lines = buildCsvContent([sampleRows[0]]).split('\n')
    expect(lines).toHaveLength(2)
  })
})

describe('buildCsvContent — data values', () => {
  it('year and age columns match row data', () => {
    const lines = buildCsvContent(sampleRows).split('\n')
    const first = lines[1].split(',')
    expect(first[0]).toBe('2026')
    expect(first[1]).toBe('35')
  })

  it('total portfolio column matches totalValue', () => {
    const lines = buildCsvContent(sampleRows).split('\n')
    const first = lines[1].split(',')
    expect(Number(first[4])).toBe(50_000)
  })

  it('coast reached column is "No" before coast and "Yes" from first coast onward', () => {
    const lines = buildCsvContent(sampleRows).split('\n')
    expect(lines[1].split(',')[5]).toBe('No')   // row 0 — not coasted
    expect(lines[2].split(',')[5]).toBe('No')   // row 1 — not coasted
    expect(lines[3].split(',')[5]).toBe('Yes')  // row 2 — first coasted
    expect(lines[4].split(',')[5]).toBe('Yes')  // row 3 — still coasted
  })
})

describe('buildCsvContent — milestone column', () => {
  it('marks the first coasted row with a coast milestone label', () => {
    const lines = buildCsvContent(sampleRows).split('\n')
    const milestone = lines[3].split(',')[6]  // row index 2 → line 3
    expect(milestone.toLowerCase()).toContain('coast')
  })

  it('does not mark non-first coasted rows with the coast milestone', () => {
    const lines = buildCsvContent(sampleRows).split('\n')
    const milestone = lines[4].split(',')[6]  // row 3 — coasted but not first
    expect(milestone.toLowerCase()).not.toContain('coast')
  })

  it('marks the retirement row with a retirement label', () => {
    const lines = buildCsvContent(sampleRows).split('\n')
    const milestone = lines[5].split(',')[6]  // row 4 — retirement
    expect(milestone.toLowerCase()).toContain('retirement')
  })

  it('marks the SPA row with a state pension label', () => {
    const spaRows = [
      ...sampleRows.slice(0, 3),
      row({ year: 2029, age: 38, totalValue: 125_000, coastReached: true, isStatePensionYear: true }),
    ]
    const lines = buildCsvContent(spaRows).split('\n')
    const milestone = lines[4].split(',')[6]
    expect(milestone.toLowerCase()).toContain('state pension')
  })

  it('non-milestone rows have an empty milestone column', () => {
    const lines = buildCsvContent(sampleRows).split('\n')
    expect(lines[1].split(',')[6]).toBe('')  // row 0: no milestone
    expect(lines[2].split(',')[6]).toBe('')  // row 1: no milestone
  })
})

// ── buildSummaryText ───────────────────────────────────────────────────────

describe('buildSummaryText — when not yet coasted', () => {
  it('contains the FIRE number formatted as GBP', () => {
    const text = buildSummaryText(baseResult, baseInputs)
    expect(text).toContain('£800,000')
  })

  it('contains the Coast FIRE number', () => {
    const text = buildSummaryText(baseResult, baseInputs)
    expect(text).toContain('£200,000')
  })

  it('contains the current total', () => {
    const text = buildSummaryText(baseResult, baseInputs)
    expect(text).toContain('£50,000')
  })

  it('contains the gap to coast', () => {
    const text = buildSummaryText(baseResult, baseInputs)
    expect(text).toContain('£150,000')
  })

  it('contains the projected coast age and year', () => {
    const text = buildSummaryText(baseResult, baseInputs)
    expect(text).toContain('37')
    expect(text).toContain('2028')
  })
})

describe('buildSummaryText — when already coasted', () => {
  const coastedResult: CoastFireResult = {
    ...baseResult,
    currentTotal: 400_000,
    hasCoasted: true,
    amountToCoast: 0,
    projectedCoastAge: 35,
    projectedCoastYear: 2026,
  }

  it('contains a "coasted" indicator', () => {
    const text = buildSummaryText(coastedResult, baseInputs)
    expect(text.toLowerCase()).toContain('coast')
  })

  it('does not show a gap to coast', () => {
    const text = buildSummaryText(coastedResult, baseInputs)
    expect(text.toLowerCase()).not.toContain('gap')
  })
})

describe('buildSummaryText — when coast not reached within projection', () => {
  const neverResult: CoastFireResult = {
    ...baseResult,
    projectedCoastAge: null,
    projectedCoastYear: null,
  }

  it('indicates coast is not reached', () => {
    const text = buildSummaryText(neverResult, baseInputs)
    expect(text.toLowerCase()).toMatch(/not reached|never/)
  })
})
