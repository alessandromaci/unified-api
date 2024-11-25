import { logError, logInfo } from "../utils/logger.js";

export const loadSigner = async (blockchain) => {
  try {
    logInfo(`Loading signer module for ${blockchain}...`);
    const { signTransaction } = await import(
      `../sign_modules/${blockchain}/sign.js`
    );
    return signTransaction;
  } catch (error) {
    logError(`Signer module not found for blockchain: ${blockchain}`);
    throw new Error(`Failed to load signer module for ${blockchain}`);
  }
};
