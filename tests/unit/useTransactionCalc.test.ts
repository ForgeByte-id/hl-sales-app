import { describe, expect, it } from 'vitest'

import { calculateTransaction } from '../../app/composables/useTransactionCalc'

const lmProduct = {
  id: 'product-lm',
  tipe: 'LM' as const,
  harga_modal: 40000,
  harga_base: 100000,
}

const brProduct = {
  id: 'product-br',
  tipe: 'BR' as const,
  harga_modal: 25000,
  harga_base: 50000,
}

describe('transaction calculation', () => {
  it('calculates line omzet, profit, and receivable totals for a piutang Bon', () => {
    const result = calculateTransaction(
      [
        { product: lmProduct, qty: 2 },
        { product: brProduct, qty: 1 },
      ],
      {
        LM: [20, 20, 10],
        BR: [10],
      },
      15000,
      'piutang',
    )

    expect(result.lines).toEqual([
      {
        product_id: 'product-lm',
        product_type: 'LM',
        harga_modal_snap: 40000,
        harga_base_snap: 100000,
        discounted_price: 57600,
        qty: 2,
        line_omzet: 115200,
        line_laba_hl: 35200,
      },
      {
        product_id: 'product-br',
        product_type: 'BR',
        harga_modal_snap: 25000,
        harga_base_snap: 50000,
        discounted_price: 45000,
        qty: 1,
        line_omzet: 45000,
        line_laba_hl: 20000,
      },
    ])

    expect(result.totals).toEqual({
      omzet: 160200,
      labaHl: 55200,
      tagihan: 175200,
      totalPiutang: 175200,
      totalSudahDibayar: 0,
    })
  })

  it('moves the amount owed into paid totals when status is lunas', () => {
    const result = calculateTransaction([{ product: lmProduct, qty: 1 }], { LM: [], BR: [] }, 5000, 'lunas')

    expect(result.totals).toEqual({
      omzet: 100000,
      labaHl: 60000,
      tagihan: 105000,
      totalPiutang: 0,
      totalSudahDibayar: 105000,
    })
  })

  it('keeps bonus Bon lines free and excludes them from omzet and profit', () => {
    const result = calculateTransaction([{ product: lmProduct, qty: 3 }], { LM: [20], BR: [] }, 0, 'lunas', true)

    expect(result.lines[0]).toMatchObject({
      discounted_price: 0,
      line_omzet: 0,
      line_laba_hl: 0,
    })
    expect(result.totals).toEqual({
      omzet: 0,
      labaHl: 0,
      tagihan: 0,
      totalPiutang: 0,
      totalSudahDibayar: 0,
    })
  })
})
