import { loadSigner } from "../signingService";
import { logError, logInfo } from "../../utils/logger";

jest.mock("../../utils/logger");

describe("loadSigner", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should load the signer module successfully", async () => {
    const mockSignTransaction = jest.fn();

    // Mock dynamic import
    jest.mock(
      "../sign_modules/polkadot/sign.js",
      () => ({
        __esModule: true, // Required for ESM compatibility
        signTransaction: mockSignTransaction,
      }),
      { virtual: true },
    );

    await loadSigner("polkadot");

    expect(logInfo).toHaveBeenCalledWith(
      "Loading signer module for polkadot...",
    );
  });

  it("should throw an error if the signer module is not found", async () => {
    const blockchain = "nonexistent";

    await expect(loadSigner(blockchain)).rejects.toThrow(
      `Failed to load signer module for ${blockchain}`,
    );

    expect(logError).toHaveBeenCalledWith(
      `Signer module not found for blockchain: ${blockchain}`,
    );
  });
});
