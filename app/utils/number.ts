export function toNumber(value: number | string | null | undefined): number {
  return Number(value ?? 0)
}

export function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10)
}

export function currentMonthValue(): string {
  return new Date().toISOString().slice(0, 7)
}

export function splitMonthValue(value: string): { year: number; month: number } {
  const [year, month] = value.split('-').map(Number)

  return { year, month }
}
