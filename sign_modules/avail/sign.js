import { readFileSync } from "fs";
import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";
import "@polkadot/api-augment";
import { getValidatedEnvVars } from "../../utils/envValidator.js";

/**
 * @param {string} rawTransaction
 * @returns {Promise<`0x${string}`>}
 */
export const signTransaction = async (rawTransaction) => {
  const { provider, secretFileName, password } = getValidatedEnvVars([
    "SIGN_AVAIL_PROVIDER",
    "SIGN_AVAIL_SECRET_FILE_NAME",
    "SIGN_AVAIL_PASSWORD",
  ]);

  // Connect to Avail node
  const wsProvider = new WsProvider(provider);
  const api = await ApiPromise.create({ provider: wsProvider });
  await api.isReady;

  // Load keyring file
  const keyring = new Keyring({ type: "sr25519" });
  const keyInfo = JSON.parse(readFileSync(secretFileName, "utf8"));
  const sender = keyring.addFromJson(keyInfo);
  sender.decodePkcs8(password);

  // Decode and sign the transaction
  const unsigned = api.tx(rawTransaction);
  const signedExtrinsic = await unsigned.signAsync(sender);

  await api.disconnect();
  return signedExtrinsic.toHex();
};
