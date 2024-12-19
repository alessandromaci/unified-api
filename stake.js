import { readFileSync } from "fs";
import { handleStakingFlow } from "./services/blockchainHandler.js";
import { logError, logInfo } from "./utils/logger.js";
import dotenv from "dotenv";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

dotenv.config();

const config = JSON.parse(readFileSync("./config.json", "utf-8"));
const { chain } = config;

const argv = yargs(hideBin(process.argv))
  .option("network", {
    type: "string",
    description: "Network to perform staking",
    demandOption: true,
  })
  .help()
  .alias("help", "h").argv;

(async function main() {
  try {
    const blockchain = argv.network.toLowerCase();

    if (!chain[blockchain]) {
      throw new Error(
        `Unsupported network: ${blockchain}. Supported blockchains are: ${Object.keys(chain).join(", ")}`,
      );
    }

    logInfo(
      `Starting staking flow for blockchain: ${blockchain.toUpperCase()}`,
    );
    await handleStakingFlow(blockchain, config);
  } catch (error) {
    logError(`Error: ${error.message}`);
    process.exit(1);
  }
})();
