import { readFileSync } from "fs";
import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";
import "@polkadot/api-augment";

export async function signPolkadot(rawTransaction) {
  const provider = "wss://westend-rpc-tn.dwellir.com";
  const secretFileName = process.env.SECRET_FILE_NAME;
  const password = process.env.PASSWORD;

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
  console.log("signedExtrinsic", signedExtrinsic.toHuman());

  const hexEx = signedExtrinsic.toHex();
  console.log("signedExtrinsic toHex", hexEx);

  await api.disconnect();

  return hexEx;
}
