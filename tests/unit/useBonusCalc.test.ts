import { describe, expect, it } from 'vitest'

import { bonusRemainder, calcBonusesAvailable } from '../../app/composables/useBonusCalc'

describe('bonus calculation', () => {
  it('counts available bonuses from paid omzet and already granted bonuses', () => {
    expect(calcBonusesAvailable(25000000, 10000000, 0)).toBe(2)
    expect(calcBonusesAvailable(25000000, 10000000, 2)).toBe(0)
  })

  it('keeps the remaining accumulator after granted bonuses', () => {
    expect(bonusRemainder(25000000, 10000000, 2)).toBe(5000000)
  })

  it('disables bonus logic when the customer has no threshold', () => {
    expect(calcBonusesAvailable(25000000, 0, 0)).toBe(0)
    expect(bonusRemainder(25000000, 0, 0)).toBe(0)
  })
})
