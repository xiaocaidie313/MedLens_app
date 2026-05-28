import { NextResponse } from "next/server"

import {
  createSessionToken,
  getDemoUser,
  getSessionCookieOptions,
  AUTH_COOKIE_NAME,
  verifyDemoCredentials,
} from "@/app/lib/auth"

export const runtime = "nodejs"

type LoginBody = {
  email?: string
  password?: string
}

export async function POST(request: Request) {
  let body: LoginBody

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ code: 400, message: "Invalid JSON body", data: null }, { status: 400 })
  }

  const email = body.email ?? ""
  const password = body.password ?? ""

  if (!verifyDemoCredentials(email, password)) {
    return NextResponse.json({ code: 401, message: "邮箱或密码不正确", data: null }, { status: 401 })
  }

  const user = getDemoUser()
  const response = NextResponse.json({ code: 200, message: "ok", data: { user } })
  response.cookies.set(AUTH_COOKIE_NAME, createSessionToken(user), getSessionCookieOptions())
  return response
}
