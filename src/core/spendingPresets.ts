export type SpendingPreset = 'minimum' | 'moderate' | 'comfortable' | 'custom'

export interface SpendingPresetOption {
  key: SpendingPreset
  label: string
  value: number | null
}

export const SPENDING_PRESETS: SpendingPresetOption[] = [
  { key: 'minimum', label: 'Minimum – £14,400/yr', value: 14400 },
  { key: 'moderate', label: 'Moderate – £31,300/yr', value: 31300 },
  { key: 'comfortable', label: 'Comfortable – £43,100/yr', value: 43100 },
  { key: 'custom', label: 'Custom', value: null },
]
