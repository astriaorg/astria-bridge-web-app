/**
 * Format balance to 2 decimal places
 * @param rawBalance
 * @param decimals - number of decimal places this
 */
export const formatBalance = (rawBalance: string, decimals: number = 18) => {
  const denom = Math.pow(10, decimals);
  return (Number.parseInt(rawBalance) / denom).toFixed(2);
};

/**
 * Format chain id as a number
 * @param chainIdHex
 */
export const formatChainAsNum = (chainIdHex: string) => {
  return Number.parseInt(chainIdHex);
};
