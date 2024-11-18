//import { generateKeys } from "../babylon/public-key.js";
//import { signTX } from "./babylon/sign.js";
import axios from "axios";
import { readFileSync } from "fs";

// Constants
const config = JSON.parse(readFileSync("./config.json", "utf-8"));
const API_BASE_URL = config.url;
const AUTH_TOKEN = config.token;
const NETWORK = config.network;
const CHAIN = config.chain;
const ADDRESS = config.walletAddress;
const MIN_AMOUNT = config.minAmount;

const currency = {
  solana: "lamports", //1 SOL = 1000000000 lamports //minimum amount 1.00228288 SOL
};

// Authorization headers helper
function getAuthorizationHeaders() {
  return {
    accept: "application/json",
    authorization: AUTH_TOKEN,
    "content-type": "application/json",
  };
}

// step 1: initiate the stake request
async function initiateRequest() {
  const url = `${API_BASE_URL}/staking/stake`;
  const data = {
    chain: CHAIN.solana,
    network: NETWORK,
    stakerAddress: ADDRESS.solana,
    amount: MIN_AMOUNT.solana,
  };

  try {
    console.log(data);
    const response = await axios.post(url, data, {
      headers: getAuthorizationHeaders(),
    });
    console.log("Stake Response:", response.data);
    return response.data.result;
  } catch (error) {
    console.error(
      "Error initiating staking request:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
}

async function broadcastTx(txHex) {
  const url = `${API_BASE_URL}/transaction/broadcast`;
  const data = {
    chain: CHAIN.solana,
    network: NETWORK,
    signedTransaction: txHex,
    stakerAddress: "",
  };

  try {
    const response = await axios.post(url, data, {
      headers: getAuthorizationHeaders(),
    });
    console.log("Tx Hash:", response.data.result.transactionHash);
    return response.data.result.transactionHash;
  } catch (error) {
    console.error(
      "Error broadcasting transaction:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
}

// Main function to handle request, signing, and broadcasting
(async function main() {
  try {
    // step 2: Create Stake Transaction
    const txHex = await initiateRequest();

    // step 3: Sign and Broadcast Transaction
    if (txHex && txHex.stakeTransactionHex) {
      //const signedTx = signTX(txHex.stakeTransactionHex);
      console.log("UnSigned Transaction:", signedTx);

      // if (signedTx) {
      //   const txHash = await broadcastTx(signedTx); // Await broadcastTx
      //   console.log("Broadcasted Transaction Hash:", txHash);
      // }
    } else {
      console.error("Error: stakeTransactionHex not found in response");
    }
  } catch (error) {
    console.error(
      "Failed to initiate, sign, and broadcast transaction:",
      error.message
    );
  }
})();
