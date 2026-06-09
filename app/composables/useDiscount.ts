export function calcDiscountedPrice(basePrice: number, steps: number[]): number {
  if (!steps.length) return basePrice

  return steps.reduce((price, step) => price * (1 - step / 100), basePrice)
}

export function effectiveDiscountPct(steps: number[]): number {
  const discountedRatio = steps.reduce((ratio, step) => ratio * (1 - step / 100), 1)

  return (1 - discountedRatio) * 100
}

export function discountChainLabel(steps: number[]): string {
  return steps.length ? steps.join('-') : 'Tanpa diskon'
}
