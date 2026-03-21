import bcrypt from "bcrypt";

/**
 * Hash a password using bcrypt
 *
 * bcrypt is used for the SERVER-SIDE hash layer
 * This is the second hash (client sends Argon2 hash, we hash it again)
 *
 * @param password - The password to hash (already Argon2 hashed from client)
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRound = 12;
  return bcrypt.hash(password, saltRound);
}

/**
 * Verify a password against a hash
 *
 * @param password - Plain password to verify
 * @param hash - Stored hash to compare against
 * @returns True if password matches
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
