/**
 * Password hashing for the browser-only account system.
 * SHA-256 (WebCrypto) over `salt:password`; the plain password is never stored.
 * Note: this protects against casual reading of localStorage, not a determined attacker;
 * a real store would hash server-side with a slow KDF (Argon2/bcrypt).
 */
export const MIN_PASSWORD = 8;

const subtle = (): SubtleCrypto => {
  const c = globalThis.crypto;
  if (!c?.subtle) throw new Error('WebCrypto is not available in this browser.');
  return c.subtle;
};

const toHex = (buf: ArrayBuffer): string =>
  Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');

/** 16 random bytes as hex. */
export function randomSalt(): string {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  return toHex(await subtle().digest('SHA-256', data));
}

export async function verifyPassword(password: string, salt: string, hash: string): Promise<boolean> {
  return (await hashPassword(password, salt)) === hash;
}

/** Returns an error message, or null when the password is acceptable. */
export function passwordProblem(pw: string): string | null {
  if (pw.length < MIN_PASSWORD) return `Use at least ${MIN_PASSWORD} characters.`;
  return null;
}
