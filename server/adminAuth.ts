import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
const SCRYPT_OPTIONS = { N: 16_384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const MAX_FAILURES = 5;
const LOCK_WINDOW_MS = 15 * 60 * 1000;
const attempts = new Map<string, { failures: number; firstFailureAt: number; lockedUntil: number }>();

function derivePasswordKey(password: string, salt: string) {
  return new Promise<Buffer>((resolve, reject) => {
    scryptCallback(password, salt, 64, SCRYPT_OPTIONS, (error, derived) => {
      if (error) reject(error);
      else resolve(derived);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = await derivePasswordKey(password, salt);
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, encoded: string | null): Promise<boolean> {
  if (!encoded) return false;
  const [scheme, salt, hash] = encoded.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const derived = await derivePasswordKey(password, salt);
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

export function assertCredentialAttemptAllowed(identifier: string, now = Date.now()) {
  const entry = attempts.get(identifier.toLowerCase());
  if (entry && entry.lockedUntil > now) {
    throw new Error("Too many attempts. Please wait 15 minutes and try again.");
  }
  if (entry && now - entry.firstFailureAt > LOCK_WINDOW_MS) attempts.delete(identifier.toLowerCase());
}

export function recordCredentialFailure(identifier: string, now = Date.now()) {
  const key = identifier.toLowerCase();
  const entry = attempts.get(key);
  if (!entry || now - entry.firstFailureAt > LOCK_WINDOW_MS) {
    attempts.set(key, { failures: 1, firstFailureAt: now, lockedUntil: 0 });
    return;
  }
  entry.failures += 1;
  if (entry.failures >= MAX_FAILURES) entry.lockedUntil = now + LOCK_WINDOW_MS;
}

export function clearCredentialFailures(identifier: string) {
  attempts.delete(identifier.toLowerCase());
}

export function resetCredentialAttemptStateForTests() {
  attempts.clear();
}
