import { Psbt, initEccLib, networks } from "bitcoinjs-lib";
import { signPsbtWithKeyPathAndScriptPath } from "@okxweb3/coin-bitcoin";
import * as tinysecp from "tiny-secp256k1";
import { getValidatedEnvVars } from "../../utils/envValidator.js";

initEccLib(tinysecp);

/**
 * @param {string} rawTransaction
 * @param {string} blockchain
 * @param config
 * @returns {string}
 */
export function signTransaction(rawTransaction, blockchain, config) {
  const { SIGN_BABYLON_PRIVATE_KEY: privateKey } = getValidatedEnvVars([
    "SIGN_BABYLON_PRIVATE_KEY",
  ]);

  const network =
    config.network[blockchain] === "testnet"
      ? networks.testnet
      : networks.bitcoin;

  const psbtHex = signPsbtWithKeyPathAndScriptPath(
    rawTransaction,
    privateKey,
    network,
  );
  const psbt = Psbt.fromHex(psbtHex, { network });

  return psbt.extractTransaction().toHex();
}
