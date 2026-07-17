"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import type { Voice } from "@/lib/types"

function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("Invalid email or password")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h2 className="text-lg font-semibold">Sign In</h2>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border rounded px-2 py-1 w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border rounded px-2 py-1 w-full"
        />
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Sign In
      </button>
    </form>
  )
}

function SignupForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setMessage("")

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name: name || undefined }),
    })

    if (res.ok) {
      setMessage("Account created! You can now sign in.")
      setEmail("")
      setPassword("")
      setName("")
    } else {
      const data = await res.json()
      setError(data.error || "Something went wrong")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h2 className="text-lg font-semibold">Sign Up</h2>
      {message && <p className="text-green-500 text-sm">{message}</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div>
        <label className="block text-sm font-medium">Name (optional)</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded px-2 py-1 w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border rounded px-2 py-1 w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">
          Password (min 8 characters)
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="border rounded px-2 py-1 w-full"
        />
      </div>
      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Sign Up
      </button>
    </form>
  )
}

function CreateVoiceForm({
  onCreated,
}: {
  onCreated: () => void
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [sourceType, setSourceType] = useState<"own" | "writer">("own")
  const [samples, setSamples] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    const sampleList = samples
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)

    if (sampleList.length === 0) {
      setError("At least one sample is required")
      return
    }

    const res = await fetch("/api/voicebox/voices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        sourceType,
        samples: sampleList,
        profile: {
          sentenceRhythm: "",
          vocabularyTendencies: "",
          punctuationHabits: "",
          structuralHabits: "",
        },
      }),
    })

    if (res.ok) {
      setName("")
      setSourceType("own")
      setSamples("")
      setOpen(false)
      onCreated()
    } else {
      const data = await res.json()
      setError(data.error || "Failed to create voice")
    }
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {open ? "Cancel" : "Create Voice"}
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3 max-w-md">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div>
            <label className="block text-sm font-medium">Voice Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="border rounded px-2 py-1 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Source Type</label>
            <select
              value={sourceType}
              onChange={(e) =>
                setSourceType(e.target.value as "own" | "writer")
              }
              className="border rounded px-2 py-1 w-full"
            >
              <option value="own">Own writing</option>
              <option value="writer">Writer style</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">
              Samples (one per line)
            </label>
            <textarea
              value={samples}
              onChange={(e) => setSamples(e.target.value)}
              rows={4}
              className="border rounded px-2 py-1 w-full"
              placeholder="Paste your writing samples, one per line..."
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Save Voice
          </button>
        </form>
      )}
    </div>
  )
}

export default function VoiceBoxPage() {
  const { data: session, status } = useSession()
  const [voices, setVoices] = useState<Voice[]>([])
  const [loading, setLoading] = useState(true)

  async function loadVoices() {
    setLoading(true)
    const res = await fetch("/api/voicebox/voices")
    if (res.ok) {
      setVoices(await res.json())
    }
    setLoading(false)
  }

  useEffect(() => {
    if (status === "authenticated") {
      loadVoices()
    } else if (status === "unauthenticated") {
      setLoading(false)
    }
  }, [status])

  if (status === "loading") {
    return <div className="p-8">Loading...</div>
  }

  if (status === "unauthenticated") {
    return (
      <div className="max-w-lg mx-auto p-8 space-y-8">
        <h1 className="text-2xl font-bold">VoiceBox</h1>
        <LoginForm />
        <hr />
        <SignupForm />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">VoiceBox</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Welcome, {session?.user?.name || session?.user?.email}
          </span>
          <button
            onClick={() => signOut()}
            className="text-sm text-red-600 underline"
          >
            Sign Out
          </button>
        </div>
      </div>

      <CreateVoiceForm onCreated={loadVoices} />

      <div>
        <h2 className="text-xl font-semibold mb-4">Your Voices</h2>
        {loading ? (
          <p>Loading...</p>
        ) : voices.length === 0 ? (
          <p className="text-gray-500">
            No voices yet. Create one to get started.
          </p>
        ) : (
          <ul className="space-y-3">
            {voices.map((voice) => (
              <li key={voice.id}>
                <a
                  href={`/voicebox/${voice.id}`}
                  className="block border rounded p-4 hover:bg-gray-50"
                >
                  <div className="font-medium">{voice.name}</div>
                  <div className="text-sm text-gray-500">
                    {voice.sourceType === "own" ? "Own writing" : "Writer style"}{" "}
                    &middot;{" "}
                    {new Date(voice.createdAt).toLocaleDateString()}
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
