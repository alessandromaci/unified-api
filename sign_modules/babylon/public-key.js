import { ECPairFactory, networks } from "ecpair";
import * as tinysecp from "tiny-secp256k1";
import { readFileSync } from "fs";

const ECPair = ECPairFactory(tinysecp);
const config = JSON.parse(readFileSync("./config.json", "utf-8"));

const network =
  config.network === "testnet" ? networks.testnet : networks.bitcoin;

export function generateKeys() {
  return Buffer.from(
    ECPair.fromWIF(config.privateKey, network).publicKey
  ).toString("hex");
}
