import { createHmac, timingSafeEqual } from "crypto"

export const AUTH_COOKIE_NAME = "medlens_session"

export type AuthUser = {
  id: string
  name: string
  email: string
}

type SessionPayload = AuthUser & {
  iat: number
  exp: number
}

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

function getAuthSecret() {
  return process.env.AUTH_SECRET ?? "medlens-dev-auth-secret-change-me"
}

function base64UrlEncode(value: string | Buffer) {
  return Buffer.from(value).toString("base64url")
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8")
}

function sign(value: string) {
  return createHmac("sha256", getAuthSecret()).update(value).digest("base64url")
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}

export function getDemoUser(): AuthUser {
  return {
    id: "demo-user",
    name: process.env.DEMO_USER_NAME ?? "MedLens Demo",
    email: process.env.DEMO_USER_EMAIL ?? "demo@medlens.local",
  }
}

export function verifyDemoCredentials(email: string, password: string) {
  const expectedEmail = process.env.DEMO_USER_EMAIL ?? "demo@medlens.local"
  const expectedPassword = process.env.DEMO_USER_PASSWORD ?? "medlens123"

  return email.trim().toLowerCase() === expectedEmail.toLowerCase() && password === expectedPassword
}

export function createSessionToken(user: AuthUser) {
  const now = Math.floor(Date.now() / 1000)
  const payload: SessionPayload = {
    ...user,
    iat: now,
    exp: now + SESSION_MAX_AGE_SECONDS,
  }
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  return `${encodedPayload}.${sign(encodedPayload)}`
}

export function verifySessionToken(token: string | undefined) {
  if (!token) return null

  const [encodedPayload, signature] = token.split(".")
  if (!encodedPayload || !signature || !safeEqual(signature, sign(encodedPayload))) {
    return null
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as SessionPayload
    if (!payload.id || !payload.email || !payload.name || payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }
    return { id: payload.id, name: payload.name, email: payload.email } satisfies AuthUser
  } catch {
    return null
  }
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  }
}

function readCookie(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return undefined

  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1)
}

export function getUserFromRequest(request: Request) {
  return verifySessionToken(readCookie(request.headers.get("cookie"), AUTH_COOKIE_NAME))
}
