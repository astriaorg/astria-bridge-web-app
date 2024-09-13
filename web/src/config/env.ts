/**
 * Environment variables
 */
export const ENV = {
  REACT_APP_ENV: process.env.REACT_APP_ENV,
  REACT_APP_VERSION: process.env.REACT_APP_VERSION,
  REACT_APP_SEQUENCER_BRIDGE_ACCOUNT:
    process.env.REACT_APP_SEQUENCER_BRIDGE_ACCOUNT,
  REACT_APP_EVM_WITHDRAWER_CONTRACT_ADDRESS:
    process.env.REACT_APP_EVM_WITHDRAWER_CONTRACT_ADDRESS,
  REACT_APP_IBC_CHAINS: process.env.REACT_APP_IBC_CHAINS,
};

/**
 * Get environment variable
 *
 * @param {string} key - key of environment variable
 * @returns {string} value of environment variable
 * @throws {Error} if environment variable is not set
 */
export const getEnvVariable = (key: keyof typeof ENV): string => {
  const value = ENV[key];
  if (value === undefined) {
    throw new Error(`${key} not set`);
  }
  return value;
};
