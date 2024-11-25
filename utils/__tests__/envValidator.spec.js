import { validateEnvVariables, getValidatedEnvVars } from "../envValidator";

describe("validateEnvVariables", () => {
  it("should throw an error if required variables are missing", () => {
    delete process.env.TEST_VAR_1; // Properly remove the variables
    delete process.env.TEST_VAR_2;

    expect(() => validateEnvVariables(["TEST_VAR_1", "TEST_VAR_2"])).toThrow(
      "Missing required environment variables: TEST_VAR_1, TEST_VAR_2",
    );
  });

  it("should not throw an error if all required variables are present", () => {
    process.env.TEST_VAR_1 = "value1";
    process.env.TEST_VAR_2 = "value2";

    expect(() =>
      validateEnvVariables(["TEST_VAR_1", "TEST_VAR_2"]),
    ).not.toThrow();
  });
});

describe("getValidatedEnvVars", () => {
  it("should return validated environment variables as an object", () => {
    process.env.TEST_VAR_1 = "value1";
    process.env.TEST_VAR_2 = "value2";

    const result = getValidatedEnvVars(["TEST_VAR_1", "TEST_VAR_2"]);
    expect(result).toEqual({
      TEST_VAR_1: "value1",
      TEST_VAR_2: "value2",
    });
  });

  it("should throw an error if any required variable is missing", () => {
    delete process.env.TEST_VAR_1; // Properly remove the variable
    process.env.TEST_VAR_2 = "value2";

    expect(() => getValidatedEnvVars(["TEST_VAR_1", "TEST_VAR_2"])).toThrow(
      "Missing required environment variables: TEST_VAR_1",
    );
  });
});
