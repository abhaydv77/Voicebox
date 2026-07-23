"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sparkles, Loader2 } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

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
    <div className="max-w-[420px] w-full flex flex-col items-center gap-6">
      <ThemeToggle className="transition-colors font-medium rounded-full text-sm leading-5 border border-border flex px-4 items-center gap-2 h-10" />
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

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="rounded-xl w-full h-11 gap-2"
            onClick={() => signIn("google", { redirect: false })}
          >
            <svg className="size-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or with email</span>
            </div>
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
