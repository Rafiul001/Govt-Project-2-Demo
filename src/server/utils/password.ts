import { hash, verify } from "argon2";

/** Hashes a password using argon2id (the library default). */
export async function hashPassword(password: string): Promise<string> {
  return hash(password);
}

/** Verifies a password against an argon2 digest. */
export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  try {
    return await verify(stored, password);
  } catch {
    // verify throws on a malformed/unknown digest — treat as a failed match.
    return false;
  }
}
