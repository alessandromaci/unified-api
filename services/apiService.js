import axios from "axios";

export const getAuthorizationHeaders = (authToken) => ({
  accept: "application/json",
  authorization: authToken,
  "content-type": "application/json",
});

export const initiateStakeRequest = async (url, requestData, headers) => {
  try {
    const response = await axios.post(url, requestData, { headers });
    return response.data.result?.unsignedTransactionData || null;
  } catch (error) {
    throw new Error(
      `Stake request failed: ${error.response?.data?.error?.message || error.message}`,
    );
  }
};

export const broadcastTransaction = async (url, broadcastData, headers) => {
  try {
    const response = await axios.post(url, broadcastData, { headers });
    const result = response.data?.result || {};

    return (
      result?.transactionHash ||
      result?.extraData?.transactionHash ||
      result?.extraData?.transactionId
    );
  } catch (error) {
    throw new Error(
      `Transaction broadcast failed: ${error.response?.data?.message || error.message}`,
    );
  }
};
