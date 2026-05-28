"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"

import { post, unwarpResponse, type ResponseType } from "@/app/utils/http"

type LoginData = {
  user: {
    id: string
    name: string
    email: string
  }
}

const DEMO_EMAIL = "demo@medlens.local"
const DEMO_PASSWORD = "medlens123"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState(DEMO_EMAIL)
  const [password, setPassword] = useState(DEMO_PASSWORD)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      const response = await post<ResponseType<LoginData>>("/api/auth/login", { email, password }, { skipAuth: true })
      unwarpResponse(response)
      router.replace("/")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败，请稍后重试")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[var(--chat-main)] px-4 py-10 text-[var(--chat-text)]">
      <section className="w-full max-w-md rounded-2xl border border-[var(--chat-border)] bg-[var(--chat-surface)] p-7 shadow-[var(--chat-shadow-card)]">
        <div className="mb-7 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
            ML
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">登录 MedLens</h1>
            <p className="mt-1 text-sm text-[var(--chat-muted)]">进入 AI 对话工作台</p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">邮箱</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              autoComplete="email"
              className="w-full rounded-xl border border-[var(--chat-border)] bg-[var(--chat-input-bg)] px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400"
              placeholder={DEMO_EMAIL}
              required
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">密码</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              autoComplete="current-password"
              className="w-full rounded-xl border border-[var(--chat-border)] bg-[var(--chat-input-bg)] px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400"
              placeholder={DEMO_PASSWORD}
              required
            />
          </label>

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="coze-primary-btn flex w-full items-center justify-center rounded-xl py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "登录中..." : "登录"}
          </button>
        </form>

        <div className="mt-5 rounded-xl bg-[var(--chat-input-well)] px-3 py-2.5 text-xs leading-6 text-[var(--chat-muted)]">
          <p>演示账号：{DEMO_EMAIL}</p>
          <p>演示密码：{DEMO_PASSWORD}</p>
        </div>
      </section>
    </main>
  )
}
