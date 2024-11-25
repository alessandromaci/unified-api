import { logInfo, logError } from "../logger";

describe("Logger", () => {
  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(() => {}); // Mock console.log
    jest.spyOn(console, "error").mockImplementation(() => {}); // Mock console.error
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restore original console methods
  });

  it("should log info messages with the correct format", () => {
    logInfo("This is a test message");
    expect(console.log).toHaveBeenCalledWith("[INFO] This is a test message");
  });

  it("should log error messages with the correct format", () => {
    logError("This is an error message");
    expect(console.error).toHaveBeenCalledWith(
      "[ERROR] This is an error message",
    );
  });
});
