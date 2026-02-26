import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import InfoTooltip from '@/components/InfoTooltip.vue'

describe('InfoTooltip', () => {
  it('renders the tooltip text in the DOM', () => {
    const wrapper = mount(InfoTooltip, { props: { text: 'This is helpful context.' } })
    expect(wrapper.find('[role="tooltip"]').text()).toBe('This is helpful context.')
  })

  it('has a trigger button', () => {
    const wrapper = mount(InfoTooltip, { props: { text: 'test' } })
    expect(wrapper.find('button[type="button"]').exists()).toBe(true)
  })

  it('aria-describedby on the button matches the tooltip id', () => {
    const wrapper = mount(InfoTooltip, { props: { text: 'test' } })
    const btn = wrapper.find('button')
    const tip = wrapper.find('[role="tooltip"]')
    expect(btn.attributes('aria-describedby')).toBe(tip.attributes('id'))
    expect(btn.attributes('aria-describedby')).toBeTruthy()
  })

  it('the tooltip id is unique across two mounted instances', () => {
    const a = mount(InfoTooltip, { props: { text: 'a' } })
    const b = mount(InfoTooltip, { props: { text: 'b' } })
    const idA = a.find('[role="tooltip"]').attributes('id')
    const idB = b.find('[role="tooltip"]').attributes('id')
    expect(idA).not.toBe(idB)
  })

  it('the trigger button has a visible label for screen readers', () => {
    const wrapper = mount(InfoTooltip, { props: { text: 'test' } })
    const btn = wrapper.find('button')
    // Either aria-label or non-empty text content
    const hasAriaLabel = !!btn.attributes('aria-label')
    const hasText = btn.text().trim().length > 0
    expect(hasAriaLabel || hasText).toBe(true)
  })
})
