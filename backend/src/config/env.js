const PLACEHOLDER_SECRETS = new Set([
  'your_super_secret_jwt_key',
  'changeme',
  'secret',
  'jwt_secret'
]);

const MIN_JWT_SECRET_LENGTH = 32;

/**
 * Validate required environment variables. Throws on any problem so the
 * process fails fast instead of running with an insecure configuration.
 * @param {object} source - environment to validate (defaults to process.env)
 * @returns {object} validated, typed configuration
 */
export function validateEnv(source = process.env) {
  const missing = ['DATABASE_URL', 'JWT_SECRET'].filter((name) => !source[name]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variable(s): ${missing.join(', ')}`);
  }

  const secret = source.JWT_SECRET;
  if (secret.length < MIN_JWT_SECRET_LENGTH || PLACEHOLDER_SECRETS.has(secret.toLowerCase())) {
    throw new Error(
      `JWT_SECRET must be a random value of at least ${MIN_JWT_SECRET_LENGTH} characters ` +
        '(generate one with: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))")'
    );
  }

  return {
    DATABASE_URL: source.DATABASE_URL,
    JWT_SECRET: secret,
    PORT: Number(source.PORT) || 3000,
    NODE_ENV: source.NODE_ENV || 'development',
    stripeConfigured: Boolean(source.STRIPE_SECRET_KEY && source.STRIPE_WEBHOOK_SECRET)
  };
}

export const env = validateEnv();
