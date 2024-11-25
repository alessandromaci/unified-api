import { readFileSync } from "fs";
import { handleStakingFlow } from "./services/blockchainHandler.js";
import { logError, logInfo } from "./utils/logger.js";
import dotenv from "dotenv";

dotenv.config();

// Load configuration
const config = JSON.parse(readFileSync("./config.json", "utf-8"));
const { chain } = config;

(async function main() {
  try {
    // Ensure blockchain parameter is provided
    if (process.argv.length < 3) {
      throw new Error(
        "Missing required blockchain parameter. Usage: node stake.js <blockchain>",
      );
    }

    // Normalize input to lowercase
    const blockchain = process.argv[2].toLowerCase();

    // Validate blockchain
    if (!chain[blockchain]) {
      throw new Error(
        `Unsupported blockchain: ${blockchain}. Supported blockchains are: ${Object.keys(chain).join(", ")}`,
      );
    }

    // Start staking flow
    logInfo(
      `Starting staking flow for blockchain: ${blockchain.toUpperCase()}`,
    );
    await handleStakingFlow(blockchain, config);
  } catch (error) {
    logError(`Error: ${error.message}`);
    process.exit(1);
  }
})();
