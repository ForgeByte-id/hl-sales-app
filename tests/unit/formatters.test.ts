import { describe, expect, it } from 'vitest'

import { formatRp, parseRpInput } from '../../app/utils/currency'
import { formatDate, monthLabel } from '../../app/utils/date'

describe('formatters', () => {
  it('formats IDR without decimals', () => {
    expect(formatRp(1250000)).toBe('Rp\u00a01.250.000')
    expect(formatRp(null)).toBe('Rp 0')
  })

  it('parses formatted rupiah input into an integer', () => {
    expect(parseRpInput('Rp 1.250.000')).toBe(1250000)
    expect(parseRpInput('')).toBe(0)
  })

  it('formats dates and month labels in Indonesian locale', () => {
    expect(formatDate('2026-06-09T00:00:00+08:00')).toBe('09/06/2026')
    expect(monthLabel(2026, 6)).toBe('Juni 2026')
  })
})
