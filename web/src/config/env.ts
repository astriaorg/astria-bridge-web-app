/**
 * Environment variables
 */
export const ENV = {
  REACT_APP_ENV: process.env.REACT_APP_ENV,
  REACT_APP_VERSION: process.env.REACT_APP_VERSION,
  // FIXME - should be renamed to REACT_APP_COSMOS_CHAINS,
  //  but requires updates to envars in Vercel. note for self to update.
  REACT_APP_IBC_CHAINS: process.env.REACT_APP_IBC_CHAINS,
  REACT_APP_EVM_CHAINS: process.env.REACT_APP_EVM_CHAINS,
  REACT_APP_BRAND_URL: process.env.REACT_APP_BRAND_URL,
  REACT_APP_BRIDGE_URL: process.env.REACT_APP_BRIDGE_URL,
  REACT_APP_SWAP_URL: process.env.REACT_APP_SWAP_URL,
  REACT_APP_POOL_URL: process.env.REACT_APP_POOL_URL,
  REACT_APP_FEEDBACK_FORM_URL: process.env.REACT_APP_FEEDBACK_FORM_URL,
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
