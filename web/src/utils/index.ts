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

export const formatBalance = (rawBalance: string) => {
  const balance = (Number.parseInt(rawBalance) / 1000000000000000000).toFixed(
    2,
  );
  return balance;
};

export const formatChainAsNum = (chainIdHex: string) => {
  const chainIdNum = Number.parseInt(chainIdHex);
  return chainIdNum;
};

export const capitalize = (str: string): string => {
  const lowered = str.toLowerCase();
  return lowered.charAt(0).toUpperCase() + lowered.slice(1);
};
