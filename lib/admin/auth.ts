import { SignJWT, jwtVerify } from 'jose';

const COOKIE_NAME = 'admin_token';
const EXPIRY = '7d';

export type AdminPayload = {
  username: string;
  iat?: number;
  exp?: number;
};

function getSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    throw new Error('ADMIN_JWT_SECRET is not set');
  }
  return new TextEncoder().encode(secret);
}

export async function signToken(payload: AdminPayload): Promise<string> {
  const secret = getSecret();
  return new SignJWT({ username: payload.username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(secret);
}

export async function verifyToken(token: string): Promise<AdminPayload | null> {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as AdminPayload;
  } catch {
    return null;
  }
}

// Vergelijking in constante tijd zodat timing-analyse geen karakters kan raden
function timingSafeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  let diff = aBytes.length ^ bBytes.length;
  const len = Math.max(aBytes.length, bBytes.length);
  for (let i = 0; i < len; i++) {
    diff |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0);
  }
  return diff === 0;
}

export function validateCredentials(
  username: string,
  password: string
): boolean {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminUsername || !adminPassword) {
    return false;
  }
  const userOk = timingSafeEqual(username, adminUsername);
  const passOk = timingSafeEqual(password, adminPassword);
  return userOk && passOk;
}

export { COOKIE_NAME };
