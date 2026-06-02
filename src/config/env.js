const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'PORT'];

// Validate that all required environment variables are set
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  PORT: process.env.PORT
};
