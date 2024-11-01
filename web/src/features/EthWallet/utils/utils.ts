/**
 * Formats a raw balance amount into a human-readable decimal number with 2 decimal places.
 * Converts from the smallest unit (e.g. wei, satoshi) to the standard unit (e.g. ETH, BTC)
 * by dividing by the appropriate power of 10 based on the `decimals` parameter.
 *
 * @param rawBalance - The raw balance amount as a string, represented in the smallest unit
 * @param [decimals=18] - Number of decimal places to shift by (defaults to 18 for ETH compatibility)
 */
export function formatBalance(rawBalance: string, decimals = 18): string {
  const denom = 10 ** decimals;
  return (Number.parseInt(rawBalance) / denom).toFixed(2);
}
