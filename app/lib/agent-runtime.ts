export type AgentMessage = {
  role: "user" | "assistant" | "system"
  content: string
}

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
  error?: {
    message?: string
  }
}

function getChatCompletionUrl(baseUrl: string) {
  const trimmed = baseUrl.replace(/\/+$/, "")
  return trimmed.endsWith("/v1") ? `${trimmed}/chat/completions` : `${trimmed}/v1/chat/completions`
}

export async function generateAssistantReply(messages: AgentMessage[]) {
  const apiKey = process.env.LLM_API_KEY
  const baseUrl = process.env.LLM_BASE_URL
  const model = process.env.LLM_MODEL_ID

  if (!apiKey || !baseUrl || !model) {
    throw new Error("LLM 配置不完整，请检查 LLM_API_KEY、LLM_BASE_URL、LLM_MODEL_ID")
  }

  const response = await fetch(getChatCompletionUrl(baseUrl), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "你是 MedLens 智能助手。回答应准确、简洁、结构清晰。涉及医疗健康内容时提醒用户不能替代专业医生诊断。",
        },
        ...messages,
      ],
      temperature: 0.7,
      stream: false,
    }),
  })

  const body = (await response.json().catch(() => null)) as ChatCompletionResponse | null

  if (!response.ok) {
    throw new Error(body?.error?.message ?? `模型服务请求失败：${response.status}`)
  }

  const content = body?.choices?.[0]?.message?.content?.trim()
  if (!content) {
    throw new Error("模型返回为空")
  }

  return {
    content,
    model,
  }
}
