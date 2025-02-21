import { KeyPair } from "near-api-js";
import { getValidatedEnvVars } from "../../utils/envValidator.js";
import { logInfo, logError } from "../../utils/logger.js";
import {
  signTransaction as nearSignTransaction,
  Transaction,
} from "near-api-js/lib/transaction.js";
import * as sha256 from "js-sha256";

/**
 * Sign a raw transaction for the NEAR blockchain.
 * @param {string} rawTransaction - The raw transaction in base64 format.
 * @returns {Promise<string>} The signed transaction in base64 format.
 */
export async function signTransaction(rawTransaction) {
  try {
    // Validate required environment variables
    const envVars = getValidatedEnvVars(["SIGN_NEAR_PRIVATE_KEY"]);
    const { SIGN_NEAR_PRIVATE_KEY: privateKey } = envVars;

    const signer = createSigner(privateKey);

    // Decode transaction correctly from HEX
    const tx = Transaction.decode(Buffer.from(rawTransaction, "hex"));
    const [, signedTx] = await nearSignTransaction(tx, signer);

    logInfo("Signing transaction with the provided signer...");
    return Buffer.from(signedTx.encode()).toString("hex");
  } catch (error) {
    logError(`Failed to sign NEAR transaction: ${error.message}`);
    throw error;
  }
}

function createSigner(privateKey) {
  const keyPair = KeyPair.fromString(privateKey);
  return {
    async getPublicKey() {
      return keyPair.getPublicKey();
    },
    async signMessage(message) {
      const hash = new Uint8Array(sha256.sha256.array(message));
      const signature = keyPair.sign(hash);
      return {
        signature: signature.signature,
        publicKey: keyPair.getPublicKey(),
      };
    },
  };
}
