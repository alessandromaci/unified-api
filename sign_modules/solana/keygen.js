import { Keypair } from "@solana/web3.js";
import * as bip39 from "bip39";
import { derivePath } from "ed25519-hd-key";
import bs58 from "bs58";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

/**
 * Generate a private key and public key from a seed phrase.
 * @param {string} seedPhrase - The seed phrase for the wallet.
 * @param {string} derivationPath - The derivation path (default: "m/44'/501'/0'/0'").
 * @returns {Promise<{ publicKey: string, privateKey: string }>} The generated keys.
 */
async function getPrivateKeyFromSeedPhrase(
  seedPhrase,
  derivationPath = "m/44'/501'/0'/0'",
) {
  try {
    // Convert the seed phrase to a seed
    const seed = await bip39.mnemonicToSeed(seedPhrase);

    // Derive the private key from the seed using the derivation path
    const { key } = derivePath(derivationPath, seed.toString("hex"));

    // Generate the keypair from the private key
    const keypair = Keypair.fromSeed(key);

    return {
      publicKey: keypair.publicKey.toString(),
      privateKey: bs58.encode(keypair.secretKey), // Encode the private key as Base58
    };
  } catch (error) {
    throw new Error(`Failed to generate keys: ${error.message}`);
  }
}

// Parse command-line arguments
const argv = yargs(hideBin(process.argv))
  .option("seed", {
    alias: "s",
    type: "string",
    description: "Seed phrase for the wallet",
    demandOption: true,
  })
  .option("path", {
    alias: "p",
    type: "string",
    description: "Derivation path (default: m/44'/501'/0'/0')",
    default: "m/44'/501'/0'/0'",
  })
  .help()
  .alias("help", "h").argv;

(async () => {
  try {
    const keys = await getPrivateKeyFromSeedPhrase(argv.seed, argv.path);
    console.log("Public Key:", keys.publicKey);
    console.log("Private Key:", keys.privateKey); // Output the private key in Base58 format
  } catch (error) {
    console.error("Error:", error.message);
  }
})();
``;
