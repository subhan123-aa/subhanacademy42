import crypto from "crypto";
import type { Role, User } from "@/lib/types";

const SESSION_COOKIE = "subhan_session";
const ITERATIONS = 120000;

export function cleanToken(token?: string | null): string | null {
  if (!token) return null;
  let cleaned = token.trim();
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned || null;
}

function getSessionSecret() {
  const raw = process.env.SESSION_SECRET?.trim();
  if (raw) {
    const unquoted = raw.replace(/^["']|["']$/g, "").trim();
    if (unquoted) return unquoted;
  }
  // A deterministic fallback is acceptable only for a local development
  // server.  Production must never sign or accept sessions with a secret that
  // is present in the source code.
  if (process.env.NODE_ENV !== "production") {
    return "subhan-academy-local-development-session-secret";
  }
  throw new Error("SESSION_SECRET is not configured.");
}

function base64Url(input: Buffer | string) {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(padded, "base64");
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, 64, "sha256").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored?: string | null) {
  if (!stored) return false;
  const parts = stored.split(":");
  if (parts.length === 2) {
    const [salt, hash] = parts;
    if (salt && hash) {
      try {
        const candidate = crypto.pbkdf2Sync(password, salt, ITERATIONS, 64, "sha256").toString("hex");
        if (candidate.length === hash.length && crypto.timingSafeEqual(Buffer.from(candidate, "hex"), Buffer.from(hash, "hex"))) {
          return true;
        }
      } catch {
        // Fallback below
      }
    }
  }

  // Fallback for raw SHA-256 hash
  try {
    const sha256Hash = crypto.createHash("sha256").update(password).digest("hex");
    if (sha256Hash.toLowerCase() === stored.toLowerCase()) {
      return true;
    }
  } catch {
    // ignore
  }

  return false;
}

export function signSession(user: Pick<User, "id" | "email" | "role" | "name">) {
  const SESSION_SECRET = getSessionSecret();
  const payload = base64Url(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7
    })
  );
  const signature = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifySession(rawToken?: string | null) {
  const token = cleanToken(rawToken);
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  try {
    const secret = getSessionSecret();
    const expected = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
    if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return null;
    }

    const parsed = JSON.parse(fromBase64Url(payload).toString("utf8")) as {
      sub: string;
      email: string;
      role: Role;
      name: string;
      exp: number;
    };
    if (!parsed || typeof parsed.exp !== "number" || parsed.exp < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function authCookieName() {
  return SESSION_COOKIE;
}
