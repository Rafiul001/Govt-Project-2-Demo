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
};

export default config;
