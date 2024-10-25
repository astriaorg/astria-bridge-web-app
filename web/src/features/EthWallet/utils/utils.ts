/**
 * Format balance to 2 decimal places
 * @param rawBalance
 * @param decimals - number of decimal places this
 */
export const formatBalance = (rawBalance: string, decimals = 18) => {
  const denom = 10 ** decimals;
  return (Number.parseInt(rawBalance) / denom).toFixed(2);
};