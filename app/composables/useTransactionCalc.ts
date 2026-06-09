import { calcDiscountedPrice } from './useDiscount'

export type ProductType = 'LM' | 'BR'
export type TransactionStatus = 'piutang' | 'lunas'

export type DiscountMap = Record<ProductType, number[]>

export interface TransactionProductInput {
  id: string
  tipe: ProductType
  harga_modal: number
  harga_base: number
}

export interface TransactionLineInput {
  product: TransactionProductInput
  qty: number
}

export interface CalculatedTransactionLine {
  product_id: string
  product_type: ProductType
  harga_modal_snap: number
  harga_base_snap: number
  discounted_price: number
  qty: number
  line_omzet: number
  line_laba_hl: number
}

export interface CalculatedTransactionTotals {
  omzet: number
  labaHl: number
  tagihan: number
  totalPiutang: number
  totalSudahDibayar: number
}

export interface CalculatedTransaction {
  lines: CalculatedTransactionLine[]
  totals: CalculatedTransactionTotals
}

function roundCurrency(value: number): number {
  return Math.round(value)
}

export function calculateTransaction(
  lines: TransactionLineInput[],
  discounts: DiscountMap,
  ongkir: number,
  status: TransactionStatus,
  isBonus = false,
): CalculatedTransaction {
  const calculatedLines = lines.map(({ product, qty }) => {
    const safeQty = Math.max(1, Math.floor(qty || 1))
    const discountedPrice = isBonus ? 0 : roundCurrency(calcDiscountedPrice(product.harga_base, discounts[product.tipe] || []))
    const lineOmzet = roundCurrency(discountedPrice * safeQty)
    const lineLabaHl = isBonus ? 0 : roundCurrency((discountedPrice - product.harga_modal) * safeQty)

    return {
      product_id: product.id,
      product_type: product.tipe,
      harga_modal_snap: product.harga_modal,
      harga_base_snap: product.harga_base,
      discounted_price: discountedPrice,
      qty: safeQty,
      line_omzet: lineOmzet,
      line_laba_hl: lineLabaHl,
    }
  })

  const omzet = calculatedLines.reduce((total, line) => total + line.line_omzet, 0)
  const labaHl = calculatedLines.reduce((total, line) => total + line.line_laba_hl, 0)
  const safeOngkir = Math.max(0, roundCurrency(ongkir || 0))
  const tagihan = omzet + safeOngkir

  return {
    lines: calculatedLines,
    totals: {
      omzet,
      labaHl,
      tagihan,
      totalPiutang: status === 'piutang' ? tagihan : 0,
      totalSudahDibayar: status === 'lunas' ? tagihan : 0,
    },
  }
}
