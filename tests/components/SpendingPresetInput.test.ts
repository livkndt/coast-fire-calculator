import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SpendingPresetInput from '@/components/SpendingPresetInput.vue'
import { SPENDING_PRESETS } from '@/core/spendingPresets'

describe('SpendingPresetInput', () => {
  it('renders a select with all preset options', () => {
    const wrapper = mount(SpendingPresetInput, { props: { modelValue: 0 } })
    const options = wrapper.findAll('select option')
    expect(options).toHaveLength(SPENDING_PRESETS.length)
  })

  it('renders a number input showing the current value', () => {
    const wrapper = mount(SpendingPresetInput, { props: { modelValue: 31300 } })
    const input = wrapper.find('input[type="number"]')
    expect(input.exists()).toBe(true)
    expect(Number((input.element as HTMLInputElement).value)).toBe(31300)
  })

  it('selecting a named preset emits the preset value', async () => {
    const wrapper = mount(SpendingPresetInput, { props: { modelValue: 0 } })
    await wrapper.find('select').setValue('moderate')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([31300])
  })

  it('selecting minimum emits 14400', async () => {
    const wrapper = mount(SpendingPresetInput, { props: { modelValue: 0 } })
    await wrapper.find('select').setValue('minimum')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([14400])
  })

  it('selecting comfortable emits 43100', async () => {
    const wrapper = mount(SpendingPresetInput, { props: { modelValue: 0 } })
    await wrapper.find('select').setValue('comfortable')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([43100])
  })

  it('typing in the number input emits the typed value', async () => {
    const wrapper = mount(SpendingPresetInput, { props: { modelValue: 31300 } })
    await wrapper.find('input[type="number"]').setValue('25000')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([25000])
  })

  it('typing in the number input switches the select to custom', async () => {
    const wrapper = mount(SpendingPresetInput, { props: { modelValue: 31300 } })
    await wrapper.find('input[type="number"]').setValue('25000')
    const select = wrapper.find('select').element as HTMLSelectElement
    expect(select.value).toBe('custom')
  })

  it('when modelValue matches a named preset, that preset is pre-selected', () => {
    const wrapper = mount(SpendingPresetInput, { props: { modelValue: 43100 } })
    const select = wrapper.find('select').element as HTMLSelectElement
    expect(select.value).toBe('comfortable')
  })

  it('when modelValue does not match any preset, custom is pre-selected', () => {
    const wrapper = mount(SpendingPresetInput, { props: { modelValue: 20000 } })
    const select = wrapper.find('select').element as HTMLSelectElement
    expect(select.value).toBe('custom')
  })

  it('when modelValue is 0, custom is pre-selected', () => {
    const wrapper = mount(SpendingPresetInput, { props: { modelValue: 0 } })
    const select = wrapper.find('select').element as HTMLSelectElement
    expect(select.value).toBe('custom')
  })
})
