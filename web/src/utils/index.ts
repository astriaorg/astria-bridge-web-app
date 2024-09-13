/**
 * Format balance to 2 decimal places
 * @param rawBalance
 */
export const formatBalance = (rawBalance: string) => {
  return (Number.parseInt(rawBalance) / 1_000_000_000_000_000_000).toFixed(2);
};

export const formatChainAsNum = (chainIdHex: string) => {
  return Number.parseInt(chainIdHex);
};
