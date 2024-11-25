import { Keypair, Transaction } from "@solana/web3.js";
import bs58 from "bs58";
import { getValidatedEnvVars } from "../../utils/envValidator.js";
import { logInfo, logError } from "../../utils/logger.js";

/**
 * Sign a raw transaction for the Solana blockchain.
 * @param {string} rawTransaction - The raw transaction in base64 format.
 * @returns {Promise<string>} The signed transaction in base64 format.
 */
export async function signTransaction(rawTransaction) {
  try {
    // Validate required environment variables
    const envVars = getValidatedEnvVars(["SIGN_SOLANA_PRIVATE_KEYS"]);
    const { SIGN_SOLANA_PRIVATE_KEYS: privateKeys } = envVars;

    logInfo("Parsing private keys...");
    const signers = privateKeys
      .split(",")
      .map((key) => Keypair.fromSecretKey(bs58.decode(key)));

    logInfo("Deserializing transaction...");
    const tx = Transaction.from(Buffer.from(rawTransaction, "base64"));

    logInfo("Signing transaction with all provided signers...");
    signers.forEach((signer) => tx.sign(signer));

    const signedTransaction = tx.serialize().toString("base64");
    logInfo("Signed transaction (Base64):", signedTransaction);

    return signedTransaction;
  } catch (error) {
    logError(`Failed to sign Solana transaction: ${error.message}`);
    throw error;
  }
}
