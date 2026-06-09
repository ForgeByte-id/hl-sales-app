export function createTempId(prefix = 'tmp'): string {
  return `${prefix}_${crypto.randomUUID()}`
}
