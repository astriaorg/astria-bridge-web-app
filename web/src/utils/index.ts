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
