import { NextResponse } from "next/server"

import type { ResponseType } from "@/app/utils/http"

type HelloPayload = { message: string; time: string }

/** GET /api/hello */
export async function GET() {
  const body: ResponseType<HelloPayload> = {
    code: 200,
    message: "ok",
    data: {
      message: "Hello from Next.js Route Handler",
      time: new Date().toISOString(),
    },
  }
  return NextResponse.json(body)
}

/** POST /api/hello — body: JSON 任意字段 */
export async function POST(request: Request) {
  let received: unknown = null
  try {
    received = await request.json()
  } catch {
    return NextResponse.json(
      { code: 400, message: "Invalid JSON body", data: null },
      { status: 400 },
    )
  }

  const body: ResponseType<{ ok: true; received: unknown }> = {
    code: 200,
    message: "ok",
    data: { ok: true, received },
  }
  return NextResponse.json(body)
}
