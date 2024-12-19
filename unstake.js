import { readFileSync } from "fs";
import {
  handleUnstakingFlow,
  handleWithdrawFlow,
} from "./services/blockchainHandler.js";
import { logError, logInfo } from "./utils/logger.js";
import { hideBin } from "yargs/helpers";
import dotenv from "dotenv";
import yargs from "yargs";
import { sleep } from "./utils/common.js";

dotenv.config();

const config = JSON.parse(readFileSync("./config.json", "utf-8"));
const { chain } = config;

const argv = yargs(hideBin(process.argv))
  .option("network", {
    type: "string",
    description: "Network to perform unstaking",
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
      `Starting unstaking flow for blockchain: ${blockchain.toUpperCase()}`,
    );
    await handleUnstakingFlow(blockchain, config);
    logInfo(
      `Wait for 10 seconds to start withdraw process for blockchain: ${blockchain.toUpperCase()}`,
    );
    await sleep(10);
    await handleWithdrawFlow(blockchain, config);
  } catch (error) {
    logError(`Error: ${error.message}`);
    process.exit(1);
  }
})();
