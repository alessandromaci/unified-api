const { handleStakingFlow } = require("../blockchainHandler");
const {
  initiateStakeRequest,
  broadcastTransaction,
  getAuthorizationHeaders,
} = require("../apiService");
const { loadSigner } = require("../signingService");

jest.mock("../apiService");
jest.mock("../signingService");

describe("blockchainHandler", () => {
  const config = {
    chain: { polkadot: "polkadot" },
    network: { polkadot: "testnet" },
    walletAddress: { polkadot: "address" },
    minAmount: { polkadot: 1 },
    url: "https://api.url",
    token: "Bearer token",
  };

  const headers = { authorization: "Bearer token" };

  beforeEach(() => {
    getAuthorizationHeaders.mockReturnValue(headers);
  });

  it("should handle the staking flow successfully", async () => {
    // Mock API service methods
    initiateStakeRequest.mockResolvedValue("unsignedTx");
    loadSigner.mockResolvedValue(async () => "signedTx");
    broadcastTransaction.mockResolvedValue("txHash");

    const result = await handleStakingFlow("polkadot", config);

    expect(initiateStakeRequest).toHaveBeenCalledWith(
      "https://api.url/staking/stake",
      {
        chain: "polkadot",
        network: "testnet",
        stakerAddress: "address",
        amount: 1,
      },
      headers, // Correctly mocked headers
    );
    expect(loadSigner).toHaveBeenCalledWith("polkadot");
    expect(broadcastTransaction).toHaveBeenCalledWith(
      "https://api.url/transaction/broadcast",
      {
        chain: "polkadot",
        network: "testnet",
        signedTransaction: "signedTx",
        stakerAddress: "address",
      },
      headers,
    );
    expect(result).toBe("txHash");
  });

  it("should throw an error if the staking flow fails", async () => {
    initiateStakeRequest.mockRejectedValue(new Error("Stake request failed"));

    await expect(handleStakingFlow("polkadot", config)).rejects.toThrow(
      "Stake request failed",
    );
  });
});
