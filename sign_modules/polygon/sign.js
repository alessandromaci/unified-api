import { ethers } from "ethers";
import { getValidatedEnvVars } from "../../utils/envValidator.js";
import { logInfo, logError } from "../../utils/logger.js";

/**
 * Sign and broadcast a raw transaction for the Polygon blockchain.
 * @param {string} rawTransaction - The serialized raw transaction to be signed and broadcasted.
 * @returns {Promise<object>} The transaction response after broadcasting.
 */
export async function signTransaction(rawTransaction) {
  try {
    // Validate required environment variables
    const { privateKey, rpcURL, maxFeePerGas, maxPriorityFeePerGas } =
      getValidatedEnvVars([
        "SIGN_POLYGON_PRIVATE_KEY",
        "SIGN_POLYGON_RPC_URL",
        "SIGN_POLYGON_MAX_FEE_PER_GAS_IN_GWEI",
        "SIGN_POLYGON_MAX_PRIORITY_FEE_IN_GWEI",
      ]);

    logInfo("Initializing provider and wallet...");
    const provider = new ethers.JsonRpcProvider(rpcURL);
    const wallet = new ethers.Wallet(privateKey, provider);

    logInfo("Parsing raw transaction...");
    const tx = ethers.Transaction.from(rawTransaction);

    logInfo("Creating new transaction object...");
    const newTx = {
      to: tx.to,
      data: tx.data,
      chainId: tx.chainId,
      value: tx.value,
      gasLimit: tx.gasLimit,
      type: 2,
      nonce: await provider.getTransactionCount(wallet.address),
      maxFeePerGas: ethers.parseUnits(maxFeePerGas, "gwei"),
      maxPriorityFeePerGas: ethers.parseUnits(maxPriorityFeePerGas, "gwei"),
    };

    logInfo("Signing the transaction...");
    const signedTransaction = await wallet.signTransaction(newTx);

    logInfo("Broadcasting the signed transaction...");
    const transactionResponse =
      await provider.broadcastTransaction(signedTransaction);

    logInfo(
      `Transaction successfully broadcasted. Hash: ${transactionResponse.hash}`,
    );
    return transactionResponse;
  } catch (error) {
    logError(
      `Failed to sign or broadcast Polygon transaction: ${error.message}`,
    );
    throw error;
  }
}
