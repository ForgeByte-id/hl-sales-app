export function calcBonusesAvailable(
  accumulatedLunasOmzet: number,
  threshold: number,
  alreadyGranted: number,
): number {
  if (threshold <= 0) return 0

  return Math.max(0, Math.floor(accumulatedLunasOmzet / threshold) - alreadyGranted)
}

export function bonusRemainder(
  accumulatedLunasOmzet: number,
  threshold: number,
  alreadyGranted: number,
): number {
  if (threshold <= 0) return 0

  const consumed = alreadyGranted * threshold

  return Math.max(0, accumulatedLunasOmzet - consumed)
}
