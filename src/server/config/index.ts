function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function requireEnvNumber(name: string): number {
  const value = Number(requireEnv(name));
  if (Number.isNaN(value)) {
    throw new Error(`Environment variable ${name} must be a number`);
  }
  return value;
}

const DURATION_MULTIPLIERS = { s: 1, m: 60, h: 3600, d: 86400 } as const;

/** Parses a duration like `30s`, `15m`, `2h`, `7d` into seconds. */
function parseDuration(name: string, value: string): number {
  const match = /^(\d+)([smhd])$/.exec(value.trim());
  if (!match) {
    throw new Error(
      `Environment variable ${name} must be a duration like 30s, 15m, 2h or 7d`,
    );
  }
  const amount = Number(match[1]);
  const unit = match[2] as keyof typeof DURATION_MULTIPLIERS;
  return amount * DURATION_MULTIPLIERS[unit];
}

/** Reads a duration env var, returning seconds. Falls back when unset. */
function optionalEnvDuration(name: string, fallback: string): number {
  const raw = process.env[name];
  return parseDuration(name, raw === undefined || raw === "" ? fallback : raw);
}

function requireEnvEnum<const T extends readonly string[]>(
  name: string,
  allowed: T,
): T[number] {
  const value = requireEnv(name);
  if (!allowed.includes(value)) {
    throw new Error(
      `Environment variable ${name} must be one of: ${allowed.join(", ")}`,
    );
  }
  return value as T[number];
}

const config = {
  NODE_ENV: requireEnvEnum("NODE_ENV", [
    "development",
    "production",
    "test",
  ] as const),
  PORT: requireEnvNumber("PORT"),
  LOG_LEVEL: requireEnvEnum("LOG_LEVEL", [
    "fatal",
    "error",
    "warn",
    "info",
    "debug",
    "trace",
  ] as const),
  DATABASE_URL: requireEnv("DATABASE_URL"),
  ACCESS_TOKEN_SECRET: requireEnv("ACCESS_TOKEN_SECRET"),
  REFRESH_TOKEN_SECRET: requireEnv("REFRESH_TOKEN_SECRET"),
  ACCESS_TOKEN_EXPIRES_IN: optionalEnvDuration(
    "ACCESS_TOKEN_EXPIRES_IN",
    "15m",
  ),
  REFRESH_TOKEN_EXPIRES_IN: optionalEnvDuration(
    "REFRESH_TOKEN_EXPIRES_IN",
    "7d",
  ),
};

export default config;
