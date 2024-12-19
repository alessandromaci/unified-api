/**
 * @param ms
 * @returns {Promise<unknown>}
 */
export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
