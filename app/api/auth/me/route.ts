import { NextResponse } from "next/server"

import { getUserFromRequest } from "@/app/lib/auth"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const user = getUserFromRequest(request)

  if (!user) {
    return NextResponse.json({ code: 401, message: "Unauthorized", data: null }, { status: 401 })
  }

  return NextResponse.json({ code: 200, message: "ok", data: { user } })
}
