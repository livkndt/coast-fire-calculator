import { describe, it, expect } from 'vitest'
import { buildChartData } from '@/composables/useChartData'
import type { ProjectionRow } from '@/core/projection'

// ── Helpers ────────────────────────────────────────────────────────────────

function row(overrides: Partial<ProjectionRow> = {}): ProjectionRow {
  return {
    year: 2026,
    age: 35,
    sippValue: 0,
    otherValue: 0,
    totalValue: 0,
    coastReached: false,
    isRetirementYear: false,
    isStatePensionYear: false,
    ...overrides,
  }
}

const COAST = 100_000
const FIRE  = 600_000

// Five rows: coasts at index 2, retires at index 4
const rows: ProjectionRow[] = [
  row({ age: 35, year: 2026, totalValue:  50_000 }),
  row({ age: 36, year: 2027, totalValue:  80_000 }),
  row({ age: 37, year: 2028, totalValue: 120_000, coastReached: true }),
  row({ age: 38, year: 2029, totalValue: 160_000, coastReached: true }),
  row({ age: 39, year: 2030, totalValue: 200_000, coastReached: true, isRetirementYear: true }),
]

// ── Tests ──────────────────────────────────────────────────────────────────

describe('buildChartData — empty input', () => {
  it('returns empty labels and datasets for an empty rows array', () => {
    const result = buildChartData([], COAST, FIRE)
    expect(result.labels).toHaveLength(0)
    expect(result.datasets).toHaveLength(0)
  })
})

describe('buildChartData — labels', () => {
  it('produces one label per row', () => {
    const result = buildChartData(rows, COAST, FIRE)
    expect(result.labels).toHaveLength(rows.length)
  })

  it('labels are formatted as "Age <n>"', () => {
    const result = buildChartData(rows, COAST, FIRE)
    expect(result.labels[0]).toBe('Age 35')
    expect(result.labels[4]).toBe('Age 39')
  })
})

describe('buildChartData — portfolio dataset (index 0)', () => {
  it('exists with the label "Portfolio value"', () => {
    const result = buildChartData(rows, COAST, FIRE)
    expect(result.datasets[0].label).toBe('Portfolio value')
  })

  it('data matches totalValue from each row', () => {
    const result = buildChartData(rows, COAST, FIRE)
    expect(result.datasets[0].data).toEqual([50_000, 80_000, 120_000, 160_000, 200_000])
  })
})

describe('buildChartData — coast target dataset (index 1)', () => {
  it('exists with the label "Coast FIRE number"', () => {
    const result = buildChartData(rows, COAST, FIRE)
    expect(result.datasets[1].label).toBe('Coast FIRE number')
  })

  it('data is flat at coastFireNumber for every row', () => {
    const result = buildChartData(rows, COAST, FIRE)
    const data = result.datasets[1].data as number[]
    expect(data).toHaveLength(rows.length)
    data.forEach(v => expect(v).toBe(COAST))
  })

  it('has no visible points (pointRadius 0)', () => {
    const result = buildChartData(rows, COAST, FIRE)
    expect(result.datasets[1].pointRadius).toBe(0)
  })
})

describe('buildChartData — FIRE target dataset (index 2)', () => {
  it('exists with the label "FIRE number"', () => {
    const result = buildChartData(rows, COAST, FIRE)
    expect(result.datasets[2].label).toBe('FIRE number')
  })

  it('data is flat at fireNumber for every row', () => {
    const result = buildChartData(rows, COAST, FIRE)
    const data = result.datasets[2].data as number[]
    expect(data).toHaveLength(rows.length)
    data.forEach(v => expect(v).toBe(FIRE))
  })
})

describe('buildChartData — point highlights', () => {
  it('non-key rows have pointRadius 0 in the portfolio dataset', () => {
    const result = buildChartData(rows, COAST, FIRE)
    const radii = result.datasets[0].pointRadius as number[]
    expect(radii[0]).toBe(0)  // not coasted, not retirement
    expect(radii[1]).toBe(0)  // not coasted, not retirement
    expect(radii[3]).toBe(0)  // coasted but not first, not retirement
  })

  it('first coasted row (index 2) has a larger pointRadius', () => {
    const result = buildChartData(rows, COAST, FIRE)
    const radii = result.datasets[0].pointRadius as number[]
    expect(radii[2]).toBeGreaterThan(0)
  })

  it('retirement row (index 4) has a larger pointRadius', () => {
    const result = buildChartData(rows, COAST, FIRE)
    const radii = result.datasets[0].pointRadius as number[]
    expect(radii[4]).toBeGreaterThan(0)
  })

  it('works correctly when no row has coastReached true', () => {
    const noCoast = rows.map(r => ({ ...r, coastReached: false }))
    const result = buildChartData(noCoast, COAST, FIRE)
    const radii = result.datasets[0].pointRadius as number[]
    // All zero except retirement year
    radii.forEach((r, i) => {
      if (!noCoast[i].isRetirementYear) expect(r).toBe(0)
    })
  })

  it('works correctly when no row is marked isRetirementYear', () => {
    const noRetire = rows.map(r => ({ ...r, isRetirementYear: false }))
    const result = buildChartData(noRetire, COAST, FIRE)
    const radii = result.datasets[0].pointRadius as number[]
    // Only the first coast row should be highlighted
    expect(radii[2]).toBeGreaterThan(0)
    expect(radii[4]).toBe(0)
  })
})
