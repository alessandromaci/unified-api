import { Psbt, initEccLib, networks } from "bitcoinjs-lib";
import { signPsbtWithKeyPathAndScriptPath } from "@okxweb3/coin-bitcoin";
import { readFileSync } from "fs";
import * as tinysecp from "tiny-secp256k1";
import { getValidatedEnvVars } from "../../utils/envValidator.js";

initEccLib(tinysecp);
const config = JSON.parse(readFileSync("./config.json"));

/**
 * @param {string} rawTransaction
 * @returns {string}
 */
export function signTransaction(rawTransaction) {
  const { privateKey } = getValidatedEnvVars(["SIGN_BABYLON_PRIVATE_KEY"]);

  const network =
    config.network === "testnet" ? networks.testnet : networks.bitcoin;

  const psbtHex = signPsbtWithKeyPathAndScriptPath(
    rawTransaction,
    privateKey,
    network,
  );
  const psbt = Psbt.fromHex(psbtHex, { network });

  return psbt.extractTransaction().toHex();
}
