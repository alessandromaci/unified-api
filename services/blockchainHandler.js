import {
  getAuthorizationHeaders,
  initiateStakeRequest,
  broadcastTransaction,
} from "./apiService.js";
import { loadSigner } from "./signingService.js";
import { logInfo, logError } from "../utils/logger.js";
import { format } from "util";

export const handleStakingFlow = async (blockchain, config) => {
  const {
    chain,
    network,
    poolLink,
    walletAddress,
    minAmount,
    url,
    token,
    extraParams,
  } = config;
  const headers = getAuthorizationHeaders(token);

  try {
    logInfo(`Initiating stake request for ${blockchain}...`);
    const requestStakeData = buildStakeRequestData(
      blockchain,
      chain,
      network,
      walletAddress,
      minAmount,
      extraParams,
    );
    const unsignedTransaction = await initiateStakeRequest(
      `${url}/staking/stake`,
      requestStakeData,
      headers,
    );

    if (!unsignedTransaction) {
      throw new Error("No unsigned transaction found");
    }

    logInfo("Unsigned transaction retrieved. Loading signer...");
    const signTransaction = await loadSigner(blockchain);

    logInfo("Signing transaction...");
    const signedTransaction = await signTransaction(
      unsignedTransaction,
      blockchain,
      config,
    );

    logInfo("Broadcasting signed transaction...");
    const requestBroadcastData = buildBroadcastRequestData(
      blockchain,
      chain,
      network,
      walletAddress,
      signedTransaction,
      extraParams,
    );
    const txHash = await broadcastTransaction(
      `${url}/transaction/broadcast`,
      requestBroadcastData,
      headers,
    );

    logInfo(`Transaction successfully broadcasted. Hash: ${txHash}`);
    const link = poolLink[blockchain]
      ? format(poolLink[blockchain], txHash)
      : null;
    if (!!link) {
      logInfo(`Check transaction link: ${link}`);
    }

    return txHash;
  } catch (error) {
    logError(`Staking flow failed for ${blockchain}: ${error.message}`);
    throw error;
  }
};

function buildStakeRequestData(
  blockchain,
  chain,
  network,
  walletAddress,
  minAmount,
  extraParams,
) {
  const requestData = {
    chain: chain[blockchain],
    network: network[blockchain],
    stakerAddress: walletAddress[blockchain],
    amount: minAmount[blockchain],
  };

  const extra = extraParams?.[blockchain]?.["stake"];
  if (extra && Object.keys(extra).length > 0) {
    requestData.extra = extra;
  }

  return requestData;
}

function buildBroadcastRequestData(
  blockchain,
  chain,
  network,
  walletAddress,
  signedTransaction,
  extraParams,
) {
  const requestData = {
    chain: chain[blockchain],
    network: network[blockchain],
    signedTransaction,
    stakerAddress: walletAddress[blockchain],
  };

  const extra = extraParams?.[blockchain]?.["broadcast"];
  if (extra && Object.keys(extra).length > 0) {
    requestData.extra = extra;
  }

  return requestData;
}
