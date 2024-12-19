import { getValidatedEnvVars } from "../../utils/envValidator.js";
import { logError, logInfo } from "../../utils/logger.js";
import { mnemonicToPrivateKey, sign } from "@ton/crypto";
import { Cell } from "@ton/core";

/**
 * Sign a raw transaction for the Solana blockchain.
 * @param {string} rawTransaction - The raw transaction in base64 format.
 * @param {string} blockchain
 * @param config
 * @returns {Promise<string>} The signed transaction in base64 format.
 */
export async function signTransaction(rawTransaction, blockchain, config) {
  try {
    // Validate required environment variables
    const { TON_SIGN_MNEMONICS: mnemonics } = getValidatedEnvVars([
      "TON_SIGN_MNEMONICS",
    ]);

    logInfo("Parsing mnemonics...");
    const signers = mnemonics
      .split(",")
      .map(async (mnemonic) => await mnemonicToPrivateKey(mnemonic.split(" ")));

    logInfo("Parsing transaction...");
    const txCell = Cell.fromHex(rawTransaction);

    logInfo("Signing transaction with all provided signers...");
    const signatures = await Promise.all(
      signers.map(async (signerPromise) => {
        const signer = await signerPromise;
        return sign(txCell.hash(), signer.secretKey);
      }),
    );

    logInfo("Aggregating signatures...");
    const aggregatedSignature = Buffer.concat(signatures);

    logInfo("Transaction signed successfully.");
    return aggregatedSignature.toString("hex");
  } catch (error) {
    logError(`Failed to sign TON transaction: ${error.message}`);
    throw error;
  }
}
