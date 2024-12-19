import { readFileSync } from "fs";
import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";
import "@polkadot/api-augment";
import { getValidatedEnvVars } from "../../utils/envValidator.js";
import { logInfo } from "../../utils/logger.js";

/**
 * @param {string} rawTransaction
 * @returns {Promise<`0x${string}`>}
 */
export async function signTransaction(rawTransaction) {
  const {
    SIGN_POLKADOT_PROVIDER: provider,
    SIGN_POLKADOT_SECRET_FILE_NAME: secretFileName,
    SIGN_POLKADOT_PASSWORD: password,
  } = getValidatedEnvVars([
    "SIGN_POLKADOT_PROVIDER",
    "SIGN_POLKADOT_SECRET_FILE_NAME",
    "SIGN_POLKADOT_PASSWORD",
  ]);

  const wsProvider = new WsProvider(provider);
  const api = await ApiPromise.create({ provider: wsProvider });
  await api.isReady;

  const keyring = new Keyring({ type: "sr25519" });
  const fileContent = readFileSync(secretFileName, "utf8");
  const keyInfo = JSON.parse(fileContent);
  const sender = keyring.addFromJson(keyInfo);
  sender.decodePkcs8(password);

  const unsigned = api.tx(rawTransaction);

  const signedExtrinsic = await unsigned.signAsync(sender);
  logInfo("signedExtrinsic", signedExtrinsic.toHuman());

  const hexEx = signedExtrinsic.toHex();
  logInfo("signedExtrinsic toHex", hexEx);

  await api.disconnect();

  return hexEx;
}
