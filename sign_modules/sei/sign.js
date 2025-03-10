import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx.js";
import { stringToPath } from "@cosmjs/crypto";
import { getValidatedEnvVars } from "../../utils/envValidator.js";
import { logInfo, logError } from "../../utils/logger.js";

// Constants
const SEI_RPC_URL = "https://rpc.pacific-1.sei.io";
const SEI_PREFIX = "sei";
const SEI_HD_PATH = "m/44'/118'/0'/0/0";

/**
 * Sign a raw transaction for the Sei blockchain.
 * @param {Object} rawTransaction - The unsigned transaction data object.
 * @returns {Promise<string>} The signed transaction in hex format.
 */
export async function signTransaction(rawTransaction) {
  try {
    // Validate required environment variables
    const envVars = getValidatedEnvVars(["SIGN_SEI_MNEMONIC", "SIGN_SEI_STAKER_ADDRESS"]);
    const { SIGN_SEI_MNEMONIC: seiMnemonic, SIGN_SEI_STAKER_ADDRESS: stakerAddress } = envVars;

    logInfo("Initializing Sei wallet...");
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(seiMnemonic, {
      prefix: SEI_PREFIX,
      hdPaths: [stringToPath(SEI_HD_PATH)],
    });
    const client = await SigningCosmWasmClient.connectWithSigner(SEI_RPC_URL, wallet);

    logInfo("Signing transaction...");
    const signedTransaction = await client.sign(
      stakerAddress,
      rawTransaction.messages,
      rawTransaction.fee,
      rawTransaction.memo || ""
    );

    const signedTxHex = Buffer.from(TxRaw.encode(signedTransaction).finish()).toString("hex");
    logInfo("Signed transaction (Hex):", signedTxHex);

    return signedTxHex;
  } catch (error) {
    logError(`Failed to sign Sei transaction: ${error.message}`);
    throw error;
  }
}
