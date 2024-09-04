/**
 * Get environment variable
 *
 * @param {string} name - name of environment variable
 * @returns {string} value of environment variable
 * @throws {Error} if environment variable is not set
 */
export function getEnvVariable(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} not set`);
  }
  return value;
}

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
