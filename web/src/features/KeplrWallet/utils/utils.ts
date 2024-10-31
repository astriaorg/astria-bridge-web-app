/**
 * Pad decimal with 0 if it starts with a dot
 * @param str
 */
export function padDecimal(str: string) {
  return str.startsWith(".") ? `0${str}` : str;
}
