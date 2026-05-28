import { NextRequest, NextResponse } from "next/server"

const AUTH_COOKIE_NAME = "medlens_session"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSession = Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value)

  if (pathname === "/" && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/"],
}
