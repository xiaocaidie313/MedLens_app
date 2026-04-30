"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react"

export type ChatMessage = { id: string; role: "user" | "assistant"; content: string }

export type ChatSession = {
  id: string
  title: string
  updatedAt: number
  messages: ChatMessage[]
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function IconPlus({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function IconSend({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  )
}

function IconBot() {
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-[11px] font-bold text-white shadow-sm"
      aria-hidden
    >
      AI
    </div>
  )
}

const SUGGESTIONS = [
  "总结一份产品需求要点",
  "把这段文字改得更专业",
  "列出登录流程的边界情况",
]

export function ChatApp() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => [
    {
      id: "seed-1",
      title: "新项目规划",
      updatedAt: Date.now(),
      messages: [
        {
          id: "m1",
          role: "user",
          content: "帮我把本周要交付的功能列成清单。",
        },
        {
          id: "m2",
          role: "assistant",
          content:
            "可以。请补充：目标用户、截止时间、以及是否已有接口文档？我先按常见迭代结构给你一个草稿清单。",
        },
      ],
    },
  ])
  const [activeId, setActiveId] = useState("seed-1")
  const [draft, setDraft] = useState("")
  const [isSending, setIsSending] = useState(false)
  const listEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const active = useMemo(
    () => sessions.find((s) => s.id === activeId) ?? null,
    [sessions, activeId],
  )

  const scrollToBottom = useCallback(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [active?.messages, scrollToBottom])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [draft])

  const newChat = useCallback(() => {
    const id = uid()
    const session: ChatSession = {
      id,
      title: "新对话",
      updatedAt: Date.now(),
      messages: [],
    }
    setSessions((prev) => [session, ...prev])
    setActiveId(id)
    setDraft("")
    requestAnimationFrame(() => textareaRef.current?.focus())
  }, [])

  const send = useCallback(async () => {
    const text = draft.trim()
    const sessionId = active?.id
    if (!text || !sessionId || isSending) return

    setIsSending(true)
    setDraft("")
    const userMsg: ChatMessage = { id: uid(), role: "user", content: text }

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s
        const nextTitle =
          s.title === "新对话" && s.messages.length === 0
            ? text.slice(0, 28)
            : s.title
        return {
          ...s,
          title: nextTitle,
          messages: [...s.messages, userMsg],
          updatedAt: Date.now(),
        }
      }),
    )

    await new Promise((r) => window.setTimeout(r, 480))

    const reply: ChatMessage = {
      id: uid(),
      role: "assistant",
      content:
        "我已收到你的消息。接入真实模型时，把流式输出写回本条助手消息即可。",
    }

    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              messages: [...s.messages, reply],
              updatedAt: Date.now(),
            }
          : s,
      ),
    )

    setIsSending(false)
    requestAnimationFrame(() => textareaRef.current?.focus())
  }, [active?.id, draft, isSending])

  const sortedSidebar = useMemo(
    () => [...sessions].sort((a, b) => b.updatedAt - a.updatedAt),
    [sessions],
  )

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void send()
    }
  }

  const applySuggestion = (t: string) => {
    setDraft(t)
    requestAnimationFrame(() => textareaRef.current?.focus())
  }

  const empty = !active?.messages.length

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-[var(--chat-bg)] text-[var(--chat-text)]">
      {/* 侧栏：Coze 式白底 + 左条选中 */}
      <aside className="flex w-[260px] shrink-0 flex-col border-r border-[var(--chat-sidebar-edge)] bg-[var(--chat-sidebar)] shadow-[1px_0_0_rgba(0,0,0,0.02)]">
        <div className="flex h-[52px] items-center gap-2 px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-[10px] font-bold text-white">
            ML
          </div>
          <div className="min-w-0">
            <div className="truncate text-[14px] font-semibold tracking-tight text-[var(--chat-text)]">
              MedLens
            </div>
            <div className="truncate text-[11px] text-[var(--chat-faint)]">智能助手</div>
          </div>
        </div>

        <div className="px-3 pb-3">
          <button
            type="button"
            onClick={newChat}
            className="coze-primary-btn flex w-full items-center justify-center gap-2 rounded-[10px] py-2.5 text-[13px] font-medium"
          >
            <IconPlus className="text-white/95" />
            新建对话
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
          <p className="px-3 pb-2 text-[12px] font-medium text-[var(--chat-faint)]">对话历史</p>
          <ul className="flex flex-col gap-0.5">
            {sortedSidebar.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveId(s.id)
                    requestAnimationFrame(() => textareaRef.current?.focus())
                  }}
                  className={`relative flex w-full items-start rounded-lg py-2.5 pl-3 pr-2 text-left transition-colors before:absolute before:left-0 before:top-1/2 before:h-[60%] before:w-[3px] before:-translate-y-1/2 before:rounded-full before:transition-colors ${
                    s.id === activeId
                      ? "bg-[var(--chat-sidebar-active)] before:bg-[var(--chat-sidebar-active-bar)]"
                      : "before:bg-transparent hover:bg-[var(--chat-hover)]"
                  }`}
                >
                  <span
                    className={`line-clamp-2 pl-1.5 text-[13px] leading-snug ${
                      s.id === activeId
                        ? "font-medium text-[var(--chat-text)]"
                        : "text-[var(--chat-muted)]"
                    }`}
                  >
                    {s.title}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* 主区 */}
      <main className="flex min-w-0 flex-1 flex-col bg-[var(--chat-main)]">
        <header className="flex h-[52px] shrink-0 items-center border-b border-[var(--chat-border)] bg-[var(--chat-surface)] px-5">
          <h1 className="truncate text-[15px] font-semibold text-[var(--chat-text)]">
            {active?.title ?? "对话"}
          </h1>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {empty ? (
            <div className="mx-auto flex min-h-[min(560px,70vh)] max-w-lg flex-col items-center justify-center px-6 py-12">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/90 to-violet-600 text-lg font-bold text-white shadow-[var(--chat-shadow-card)]">
                ✦
              </div>
              <h2 className="text-center text-xl font-semibold tracking-tight text-[var(--chat-text)]">
                我是 MedLens 助手
              </h2>
              <p className="mt-2 text-center text-[14px] leading-relaxed text-[var(--chat-muted)]">
                参考 Coze 式布局：冷灰工作台 + 白卡片。选一条快捷指令或直接输入。
              </p>
              <div className="mt-8 flex w-full max-w-md flex-col gap-2">
                {SUGGESTIONS.map((line) => (
                  <button
                    key={line}
                    type="button"
                    onClick={() => applySuggestion(line)}
                    className="coze-chip rounded-xl px-4 py-3 text-left text-[13px] leading-snug shadow-[var(--chat-shadow-card)] transition"
                  >
                    {line}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl px-4 pb-40 pt-6">
              {active?.messages.map((m) =>
                m.role === "assistant" ? (
                  <div key={m.id} className="mb-6 flex gap-3">
                    <IconBot />
                    <div
                      className="min-w-0 flex-1 rounded-xl border border-[var(--chat-assistant-border)] bg-[var(--chat-assistant-bg)] px-4 py-3 shadow-[var(--chat-shadow-card)]"
                    >
                      <p className="whitespace-pre-wrap text-[14px] leading-7 text-[var(--chat-text)] [overflow-wrap:anywhere]">
                        {m.content}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className="mb-6 flex justify-end gap-3">
                    <div
                      className="max-w-[85%] rounded-xl px-4 py-3 text-[14px] leading-7 text-white shadow-[var(--chat-shadow-card)]"
                      style={{ background: "var(--chat-user-bg)" }}
                    >
                      <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">{m.content}</p>
                    </div>
                  </div>
                ),
              )}
              <div ref={listEndRef} />
            </div>
          )}
        </div>

        {/* 底部输入：白底工具条 + 灰槽 */}
        <div className="shrink-0 border-t border-[var(--chat-border)] bg-[var(--chat-surface)] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-xl bg-[var(--chat-input-well)] p-1.5 shadow-[var(--chat-shadow-input)]">
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder="输入消息，Enter 发送"
              className="max-h-52 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 text-[14px] leading-6 text-[var(--chat-text)] outline-none placeholder:text-[var(--chat-faint)]"
            />
            <button
              type="button"
              onClick={() => void send()}
              disabled={!draft.trim() || isSending}
              className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white transition enabled:hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-35"
              style={{ background: "var(--chat-accent)" }}
              aria-label="发送"
            >
              <IconSend className="opacity-95" />
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-[var(--chat-faint)]">
            Shift+Enter 换行 · 内容由 AI 生成，请甄别
          </p>
        </div>
      </main>
    </div>
  )
}
