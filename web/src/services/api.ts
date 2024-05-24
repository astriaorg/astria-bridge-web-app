/**
 * Fetch JSON data from the server.
 *
 * @param url
 * @param init
 */
export const getJSON = async <T>(url: string, init?: RequestInit): Promise<T> => {
  let response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return await response.json() as Promise<T>;
}
