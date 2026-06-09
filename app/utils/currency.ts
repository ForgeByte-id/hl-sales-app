export function formatRp(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(amount)) return 'Rp 0'

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function parseRpInput(value: string): number {
  return Number.parseInt(value.replace(/\D/g, ''), 10) || 0
}
