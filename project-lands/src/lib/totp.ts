import crypto from "crypto";
import { siteConfig } from "@/config/site";

// TOTP (RFC 6238) as used by Google Authenticator: SHA-1, 6 digits, 30 s steps.
const PERIOD_SECONDS = 30;
const DIGITS = 6;
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Encode(bytes: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  return output;
}

function base32Decode(text: string): Buffer {
  let bits = 0;
  let value = 0;
  const output: number[] = [];
  for (const char of text.replace(/=+$/, "").toUpperCase()) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) throw new Error("Invalid base32 character");
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(output);
}

function hotp(key: Buffer, counter: number): string {
  const message = Buffer.alloc(8);
  message.writeBigUInt64BE(BigInt(counter));
  const hmac = crypto.createHmac("sha1", key).update(message).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary = hmac.readUInt32BE(offset) & 0x7fffffff;
  return String(binary % 10 ** DIGITS).padStart(DIGITS, "0");
}

export function generateTotpSecret(): string {
  return base32Encode(crypto.randomBytes(20));
}

export function totpUri(secret: string, account: string): string {
  const issuer = siteConfig.name;
  const label = encodeURIComponent(`${issuer}:${account}`);
  return `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=${DIGITS}&period=${PERIOD_SECONDS}`;
}

// Returns the matched time step, or null. Accepts ±1 step for clock drift and
// rejects steps at or before `lastStep`, so a code can't be reused.
export function verifyTotp(
  secret: string,
  code: string,
  lastStep: number | null = null,
  now = Date.now(),
): number | null {
  if (!new RegExp(`^\\d{${DIGITS}}$`).test(code)) return null;

  const key = base32Decode(secret);
  const current = Math.floor(now / 1000 / PERIOD_SECONDS);

  for (const step of [current - 1, current, current + 1]) {
    if (lastStep !== null && step <= lastStep) continue;
    if (crypto.timingSafeEqual(Buffer.from(hotp(key, step)), Buffer.from(code))) return step;
  }
  return null;
}

// The secret is stored encrypted (AES-256-GCM, key derived from AUTH_SECRET).
function encryptionKey(): Buffer {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return Buffer.from(crypto.hkdfSync("sha256", secret, "", "lands-totp-secret", 32));
}

export function encryptTotpSecret(secret: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const data = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((part) => part.toString("base64url")).join(".");
}

export function decryptTotpSecret(stored: string): string | null {
  try {
    const [iv, tag, data] = stored.split(".").map((part) => Buffer.from(part, "base64url"));
    const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  } catch {
    console.error("Could not decrypt the 2FA secret (was AUTH_SECRET changed?)");
    return null;
  }
}

export function verifyStoredTotp(stored: string, code: string, lastStep: number | null): number | null {
  const secret = decryptTotpSecret(stored);
  return secret ? verifyTotp(secret, code, lastStep) : null;
}

export function normalizeCode(value: unknown): string {
  return typeof value === "string" ? value.replace(/\s+/g, "") : "";
}
