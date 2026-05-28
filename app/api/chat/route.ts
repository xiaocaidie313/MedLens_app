import { NextResponse } from "next/server"

import { generateAssistantReply, type AgentMessage } from "@/app/lib/agent-runtime"
import { getUserFromRequest } from "@/app/lib/auth"

export const runtime = "nodejs"

type ChatRequestBody = {
  messages?: AgentMessage[]
}

function isAgentMessage(value: unknown): value is AgentMessage {
  if (!value || typeof value !== "object") return false

  const message = value as Partial<AgentMessage>
  return (
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string" &&
    message.content.trim().length > 0
  )
}

export async function POST(request: Request) {
  const user = getUserFromRequest(request)

  if (!user) {
    return NextResponse.json({ code: 401, message: "Unauthorized", data: null }, { status: 401 })
  }

  let body: ChatRequestBody

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ code: 400, message: "Invalid JSON body", data: null }, { status: 400 })
  }

  const messages = Array.isArray(body.messages) ? body.messages.filter(isAgentMessage).slice(-20) : []

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ code: 400, message: "请发送有效的用户消息", data: null }, { status: 400 })
  }

  try {
    const reply = await generateAssistantReply(messages)
    return NextResponse.json({
      code: 200,
      message: "ok",
      data: {
        message: {
          id: crypto.randomUUID(),
          role: "assistant",
          content: reply.content,
        },
        model: reply.model,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "模型服务暂时不可用"
    return NextResponse.json({ code: 502, message, data: null }, { status: 502 })
  }
}
