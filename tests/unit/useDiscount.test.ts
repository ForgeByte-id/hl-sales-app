import { describe, expect, it } from 'vitest'

import { calcDiscountedPrice, discountChainLabel, effectiveDiscountPct } from '../../app/composables/useDiscount'

describe('discount calculation', () => {
  it('applies discount steps sequentially, not as a summed percentage', () => {
    expect(calcDiscountedPrice(100, [20, 20, 10])).toBeCloseTo(57.6)
  })

  it('keeps the base price when no discount steps exist', () => {
    expect(calcDiscountedPrice(125000, [])).toBe(125000)
    expect(discountChainLabel([])).toBe('Tanpa diskon')
  })

  it('returns the effective percentage for a cascading discount chain', () => {
    expect(effectiveDiscountPct([20, 20, 10])).toBeCloseTo(42.4)
    expect(discountChainLabel([20, 20, 10])).toBe('20-20-10')
  })
})
