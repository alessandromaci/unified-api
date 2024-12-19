import {
  getAuthorizationHeaders,
  initiateStakeRequest,
  broadcastTransaction,
  initiateUnstakeRequest,
  initiateWithdrawRequest,
} from "./apiService.js";
import { loadSigner } from "./signingService.js";
import { logInfo, logError } from "../utils/logger.js";
import { format } from "util";

/**
 * Handle the staking flow.
 * @param {string} blockchain - The blockchain to handle.
 * @param {object} config - The configuration for staking.
 * @returns {Promise<string>} The transaction hash.
 */
export const handleStakingFlow = (blockchain, config) =>
  handleTransactionFlow("stake", blockchain, config, initiateStakeRequest);

/**
 * Handle the unstaking flow.
 * @param {string} blockchain - The blockchain to handle.
 * @param {object} config - The configuration for unstaking.
 * @returns {Promise<string>} The transaction hash.
 */
export const handleUnstakingFlow = (blockchain, config) =>
  handleTransactionFlow("unstake", blockchain, config, initiateUnstakeRequest);

/**
 * Handle the withdraw flow.
 * @param {string} blockchain - The blockchain to handle.
 * @param {object} config - The configuration for withdrawal.
 * @returns {Promise<string>} The transaction hash.
 */
export const handleWithdrawFlow = (blockchain, config) =>
  handleTransactionFlow(
    "withdraw",
    blockchain,
    config,
    initiateWithdrawRequest,
  );

/**
 * A generic function to handle transaction flows.
 * @param {string} action - The type of action ('stake', 'unstake', or 'withdraw').
 * @param {string} blockchain - The blockchain to handle.
 * @param {object} config - The configuration for the action.
 * @param {Function} initiateTransaction - The function to initiate the transaction.
 * @returns {Promise<string>} The transaction hash.
 */
async function handleTransactionFlow(
  action,
  blockchain,
  config,
  initiateTransaction,
) {
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
    logInfo(`Initiating ${action} request for ${blockchain}...`);
    const requestData = buildRequestData(
      action,
      blockchain,
      chain,
      network,
      walletAddress,
      minAmount,
      extraParams,
    );
    const unsignedTransaction = await initiateTransaction(
      `${url}/staking/${action}`,
      requestData,
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
      unsignedTransaction,
      extraParams,
    );

    const txHash = await broadcastTransaction(
      `${url}/transaction/broadcast`,
      requestBroadcastData,
      headers,
    );

    logInfo(`Transaction successfully broadcasted.`);
    if (txHash) {
      logInfo(`Hash: ${txHash}`);
    }
    const link = poolLink[blockchain]
      ? format(poolLink[blockchain], txHash)
      : null;
    if (link) {
      logInfo(`Check transaction link: ${link}`);
    }

    return txHash;
  } catch (error) {
    logError(
      `${action.charAt(0).toUpperCase() + action.slice(1)} flow failed for ${blockchain}: ${error.message}`,
    );
  }
}

/**
 * Builds request data for stake, unstake, or withdraw actions.
 * @param {string} action - The type of action ('stake', 'unstake', or 'withdraw').
 * @param {string} blockchain - The blockchain to handle.
 * @param {object} chain - The chain configuration.
 * @param {object} network - The network configuration.
 * @param {object} walletAddress - The wallet address for the blockchain.
 * @param {object} minAmount - The minimum amount for the blockchain.
 * @param {object} extraParams - Extra parameters for the blockchain.
 * @returns {object} The request data.
 */
function buildRequestData(
  action,
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

  const extra = extraParams?.[blockchain]?.[action];
  if (extra && Object.keys(extra).length > 0) {
    requestData.extra = extra;
  }

  return requestData;
}

/**
 * Builds broadcast request data.
 * @param {string} blockchain - The blockchain to handle.
 * @param {object} chain - The chain configuration.
 * @param {object} network - The network configuration.
 * @param {object} walletAddress - The wallet address for the blockchain.
 * @param {string} signedTransaction - The signed transaction data.
 * @param {string} unsignedTransaction - The unsigned transaction data.
 * @param {object} extraParams - Extra parameters for the blockchain.
 * @returns {object} The broadcast request data.
 */
function buildBroadcastRequestData(
  blockchain,
  chain,
  network,
  walletAddress,
  signedTransaction,
  unsignedTransaction,
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

  if (blockchain === "ton") {
    requestData.extra.unsignedTransaction = unsignedTransaction;
  }

  return requestData;
}
