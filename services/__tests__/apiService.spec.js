const {
  initiateStakeRequest,
  broadcastTransaction,
} = require("../apiService.js");
const axios = require("axios");

jest.mock("axios");

describe("apiService", () => {
  const headers = { authorization: "Bearer token" };

  it("should initiate a stake request successfully", async () => {
    const requestData = {
      chain: "polkadot",
      network: "testnet",
      stakerAddress: "addr",
      amount: 1,
    };
    const responseData = { result: { unsignedTransactionData: "unsignedTx" } };
    axios.post.mockResolvedValue({ data: responseData });

    const result = await initiateStakeRequest(
      "https://api.url/stake",
      requestData,
      headers,
    );
    expect(axios.post).toHaveBeenCalledWith(
      "https://api.url/stake",
      requestData,
      { headers },
    );
    expect(result).toBe("unsignedTx");
  });

  it("should throw an error if stake request fails", async () => {
    axios.post.mockRejectedValue(new Error("Request failed"));

    await expect(
      initiateStakeRequest("https://api.url/stake", {}, headers),
    ).rejects.toThrow("Stake request failed: Request failed");
  });

  it("should broadcast a transaction successfully", async () => {
    const broadcastData = { chain: "polkadot", signedTransaction: "signedTx" };
    const responseData = { result: { transactionHash: "txHash" } };
    axios.post.mockResolvedValue({ data: responseData });

    const result = await broadcastTransaction(
      "https://api.url/broadcast",
      broadcastData,
      headers,
    );
    expect(axios.post).toHaveBeenCalledWith(
      "https://api.url/broadcast",
      broadcastData,
      { headers },
    );
    expect(result).toBe("txHash");
  });

  it("should throw an error if broadcasting fails", async () => {
    axios.post.mockRejectedValue(new Error("Broadcast failed"));

    await expect(
      broadcastTransaction("https://api.url/broadcast", {}, headers),
    ).rejects.toThrow("Transaction broadcast failed: Broadcast failed");
  });
});
