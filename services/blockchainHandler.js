import {
  broadcastTransaction,
  getAuthorizationHeaders,
  initiateStakeRequest,
} from "./apiService.js";
import { loadSigner } from "./signingService.js";
import { logError, logInfo } from "../utils/logger.js";

export const handleStakingFlow = async (blockchain, config) => {
  const { chain, network, walletAddress, minAmount, url, token } = config;
  const headers = getAuthorizationHeaders(token);

  try {
    logInfo(`Initiating stake request for ${blockchain}...`);
    const stakeUrl = `${url}/staking/stake`;
    const stakeRequestData = buildStakeRequestData(blockchain, config);

    const { unsignedTransactionData: unsignedTransaction, extraData } =
      await initiateStakeRequest(stakeUrl, stakeRequestData, headers);
    if (!unsignedTransaction) throw new Error("No unsigned transaction found");

    logInfo("Unsigned transaction retrieved. Loading signer...");
    const signTransaction = await loadSigner(blockchain);

    logInfo("Signing transaction...");
    const signedTransaction = await signTransaction(unsignedTransaction);

    logInfo("Broadcasting signed transaction...");
    const broadcastUrl = `${url}/transaction/broadcast`;
    const broadcastRequestData = buildBroadcastRequestData(
      blockchain,
      config,
      signedTransaction,
      extraData,
    );

    const txHash = await broadcastTransaction(
      broadcastUrl,
      broadcastRequestData,
      headers,
    );
    logInfo(`Transaction successfully broadcasted. Hash: ${txHash}`);
    return txHash;
  } catch (error) {
    logError(`Staking flow failed for ${blockchain}: ${error.message}`);
    throw error;
  }
};

const buildStakeRequestData = (blockchain, config) => {
  const { chain, network, walletAddress, minAmount } = config;
  return {
    chain: chain[blockchain],
    network: network[blockchain],
    stakerAddress: walletAddress[blockchain],
    amount: minAmount[blockchain],
  };
};

const buildBroadcastRequestData = (
  blockchain,
  config,
  signedTransaction,
  extraData,
) => {
  const { chain, network, walletAddress, minAmount } = config;
  const broadcastData = {
    chain: chain[blockchain],
    network: network[blockchain],
    signedTransaction,
    stakerAddress: walletAddress[blockchain],
  };

  if (extraData?.transactionId && chain[blockchain] === "near") {
    broadcastData.extra = {};
    broadcastData.extra.transactionId = extraData?.transactionId;
  }

  return broadcastData;
};
