"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sparkles, Loader2 } from "lucide-react"

export function AuthForm() {
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (mode === "login") {
        if (!email || !password) {
          setError("Please fill in all fields")
          return
        }
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        })
        if (result?.error) {
          setError("Invalid email or password")
        }
      } else {
        if (!email || !password) {
          setError("Please fill in all fields")
          return
        }
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name: name || undefined }),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || "Failed to create account")
        }
        await signIn("credentials", {
          email,
          password,
          redirect: false,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-[420px] w-full">
      <div className="shadow-sm rounded-3xl border border-border p-8 w-full">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-2xl flex items-center justify-center w-11 h-11">
              <Sparkles className="size-5" />
            </div>
            <div className="font-semibold text-xl tracking-tight">VoiceBox</div>
          </div>

          <div className="grid grid-cols-2 rounded-xl p-1 bg-muted">
            <button
              onClick={() => { setMode("login"); setError("") }}
              className={`rounded-lg text-sm font-medium leading-5 h-10 transition-colors ${
                mode === "login" ? "bg-background shadow-sm" : "text-muted-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode("signup"); setError("") }}
              className={`rounded-lg text-sm font-medium leading-5 h-10 transition-colors ${
                mode === "signup" ? "bg-background shadow-sm" : "text-muted-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{error}</div>
            )}

            {mode === "signup" && (
              <div className="flex flex-col gap-2">
                <label className="font-medium text-sm leading-5">Name</label>
                <Input
                  type="text"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  className="rounded-xl h-11"
                />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="font-medium text-sm leading-5">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="rounded-xl h-11"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-medium text-sm leading-5">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className="rounded-xl h-11"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-xl w-full h-11"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "login" ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            By continuing you agree to VoiceBox&apos;s Terms and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}
