import { describe, it, expect } from 'vitest'
import { SPENDING_PRESETS } from '@/core/spendingPresets'

describe('SPENDING_PRESETS', () => {
  it('contains exactly four entries', () => {
    expect(SPENDING_PRESETS).toHaveLength(4)
  })

  it('has entries for all preset keys', () => {
    const keys = SPENDING_PRESETS.map((p) => p.key)
    expect(keys).toContain('minimum')
    expect(keys).toContain('moderate')
    expect(keys).toContain('comfortable')
    expect(keys).toContain('custom')
  })

  it('uses PLSA 2024/25 values for named presets', () => {
    const byKey = Object.fromEntries(SPENDING_PRESETS.map((p) => [p.key, p]))
    expect(byKey['minimum'].value).toBe(14400)
    expect(byKey['moderate'].value).toBe(31300)
    expect(byKey['comfortable'].value).toBe(43100)
  })

  it('custom preset has null value', () => {
    const custom = SPENDING_PRESETS.find((p) => p.key === 'custom')
    expect(custom?.value).toBeNull()
  })

  it('each named preset has a non-empty label', () => {
    SPENDING_PRESETS.forEach((p) => {
      expect(typeof p.label).toBe('string')
      expect(p.label.length).toBeGreaterThan(0)
    })
  })
})
