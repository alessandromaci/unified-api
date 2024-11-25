import {
  getAuthorizationHeaders,
  initiateStakeRequest,
  broadcastTransaction,
} from "./apiService.js";
import { loadSigner } from "./signingService.js";
import { logInfo, logError } from "../utils/logger.js";

export const handleStakingFlow = async (blockchain, config) => {
  const { chain, network, walletAddress, minAmount, url, token } = config;
  const headers = getAuthorizationHeaders(token);

  try {
    logInfo(`Initiating stake request for ${blockchain}...`);
    const stakeUrl = `${url}/staking/stake`;
    const requestData = {
      chain: chain[blockchain],
      network: network[blockchain],
      stakerAddress: walletAddress[blockchain],
      amount: minAmount[blockchain],
    };

    const unsignedTransaction = await initiateStakeRequest(
      stakeUrl,
      requestData,
      headers,
    );
    if (!unsignedTransaction) throw new Error("No unsigned transaction found");

    logInfo("Unsigned transaction retrieved. Loading signer...");
    const signTransaction = await loadSigner(blockchain);

    logInfo("Signing transaction...");
    const signedTransaction = await signTransaction(unsignedTransaction);

    logInfo("Broadcasting signed transaction...");
    const broadcastUrl = `${url}/transaction/broadcast`;
    const broadcastData = {
      chain: chain[blockchain],
      network: network[blockchain],
      signedTransaction,
      stakerAddress: walletAddress[blockchain],
    };

    const txHash = await broadcastTransaction(
      broadcastUrl,
      broadcastData,
      headers,
    );
    logInfo(`Transaction successfully broadcasted. Hash: ${txHash}`);
    return txHash;
  } catch (error) {
    logError(`Staking flow failed for ${blockchain}: ${error.message}`);
    throw error;
  }
};
