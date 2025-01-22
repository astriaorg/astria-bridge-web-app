/**
 * Environment variables
 */
export const ENV = {
  REACT_APP_ENV: process.env.REACT_APP_ENV,
  REACT_APP_VERSION: process.env.REACT_APP_VERSION,
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
