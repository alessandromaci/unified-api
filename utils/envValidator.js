export const validateEnvVariables = (requiredVariables) => {
  const missingVariables = requiredVariables.filter((key) => !process.env[key]);

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVariables.join(", ")}`,
    );
  }
};
export const getValidatedEnvVars = (keys) => {
  validateEnvVariables(keys);
  return keys.reduce((envVars, key) => {
    envVars[key] = process.env[key];
    return envVars;
  }, {});
};
