/**
 * Returns now plus the given minutes, in nanoseconds
 */
export function nowPlusMinutesInNano(minutes: number): bigint {
  return BigInt(Date.now() + minutes * 60 * 1000) * BigInt(1_000_000);
}
