/**
 * Smoke test — confirms Vitest is wired up correctly.
 * Real tests will live alongside the calculation modules they cover.
 */
describe('Test environment', () => {
  it('runs a basic assertion', () => {
    expect(1 + 1).toBe(2)
  })

  it('has access to global vitest helpers without imports', () => {
    const spy = vi.fn(() => 42)
    expect(spy()).toBe(42)
    expect(spy).toHaveBeenCalledOnce()
  })
})
