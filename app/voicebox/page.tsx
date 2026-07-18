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
    if (result?.error) setError("Invalid email or password")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h2 className="text-lg font-semibold">Sign In</h2>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="border rounded px-2 py-1 w-full" />
      </div>
      <div>
        <label className="block text-sm font-medium">Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="border rounded px-2 py-1 w-full" />
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Sign In</button>
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
      setEmail(""); setPassword(""); setName("")
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
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="border rounded px-2 py-1 w-full" />
      </div>
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="border rounded px-2 py-1 w-full" />
      </div>
      <div>
        <label className="block text-sm font-medium">Password (min 8 characters)</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="border rounded px-2 py-1 w-full" />
      </div>
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Sign Up</button>
    </form>
  )
}

function AddVoiceModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: () => void
}) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState("")
  const [sourceType, setSourceType] = useState<"own" | "writer">("own")
  const [samples, setSamples] = useState("")
  const [writerName, setWriterName] = useState("")
  const [error, setError] = useState("")
  const [extracting, setExtracting] = useState(false)

  useEffect(() => {
    if (!open) {
      setStep(1); setName(""); setSourceType("own"); setSamples(""); setWriterName(""); setError(""); setExtracting(false)
    }
  }, [open])

  if (!open) return null

  async function handleCreate() {
    setExtracting(true)
    setError("")

    const sampleList = samples.split("\n").map((s) => s.trim()).filter(Boolean)
    const samplesToSend = sourceType === "writer" ? [writerName] : sampleList

    const res = await fetch("/api/voicebox/voices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        sourceType,
        samples: samplesToSend,
        profile: { sentenceRhythm: "", vocabularyTendencies: "", punctuationHabits: "", structuralHabits: "" },
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Failed to create voice")
      setExtracting(false)
      return
    }

    const voice: Voice = await res.json()

    const extractRes = await fetch("/api/voicebox/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voiceId: voice.id }),
    })

    if (!extractRes.ok) {
      setError("Profile extraction failed. You can retry from the voice page.")
      setExtracting(false)
      return
    }

    setExtracting(false)
    onClose()
    onCreated()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
        {step === 1 && (
          <>
            <h2 className="text-xl font-bold">Create Voice</h2>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div>
              <label className="block text-sm font-medium">Voice Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="border rounded px-2 py-1 w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium">Source</label>
              <select value={sourceType} onChange={(e) => setSourceType(e.target.value as "own" | "writer")} className="border rounded px-2 py-1 w-full">
                <option value="own">My writing</option>
                <option value="writer">A writer&apos;s style</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={() => setStep(2)} disabled={!name.trim()} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">Next</button>
            </div>
          </>
        )}

        {step === 2 && sourceType === "own" && (
          <>
            <h2 className="text-xl font-bold">Writing Samples</h2>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div>
              <label className="block text-sm font-medium">Paste your samples (one per line)</label>
              <textarea value={samples} onChange={(e) => setSamples(e.target.value)} rows={4} className="border rounded px-2 py-1 w-full" />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setStep(1)} className="px-4 py-2 border rounded">Back</button>
              <button onClick={handleCreate} disabled={extracting || !samples.trim()} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
                {extracting ? "Analyzing..." : "Next"}
              </button>
            </div>
          </>
        )}

        {step === 2 && sourceType === "writer" && (
          <>
            <h2 className="text-xl font-bold">Writer Name</h2>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div>
              <label className="block text-sm font-medium">Who is the writer?</label>
              <input type="text" value={writerName} onChange={(e) => setWriterName(e.target.value)} className="border rounded px-2 py-1 w-full" placeholder="e.g. Hunter S. Thompson" />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setStep(1)} className="px-4 py-2 border rounded">Back</button>
              <button onClick={handleCreate} disabled={extracting || !writerName.trim()} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
                {extracting ? "Analyzing..." : "Next"}
              </button>
            </div>
          </>
        )}

        {step === 3 && extracting && (
          <div className="text-center py-8 space-y-3">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
            <p className="text-gray-600">Analyzing your writing samples...</p>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        )}
      </div>
    </div>
  )
}

function VoiceCard({ voice }: { voice: Voice }) {
  const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-pink-500", "bg-teal-500"]
  const color = colors[voice.name.charCodeAt(0) % colors.length]

  return (
    <a href={`/voicebox/${voice.id}`} className="block border rounded-xl p-5 hover:shadow-md hover:border-blue-300 transition cursor-pointer">
      <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center text-white text-xl font-bold mb-3`}>
        {voice.name[0].toUpperCase()}
      </div>
      <div className="font-semibold">{voice.name}</div>
      <div className="text-sm text-gray-500">{voice.sourceType === "own" ? "Own writing" : "Writer style"}</div>
    </a>
  )
}

export default function VoiceBoxPage() {
  const { data: session, status } = useSession()
  const [voices, setVoices] = useState<Voice[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  async function loadVoices() {
    setLoading(true)
    const res = await fetch("/api/voicebox/voices")
    if (res.ok) setVoices(await res.json())
    setLoading(false)
  }

  useEffect(() => {
    if (status === "authenticated") loadVoices()
    else if (status === "unauthenticated") setLoading(false)
  }, [status])

  if (status === "loading") return <div className="p-8">Loading...</div>

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
    <div className="max-w-5xl mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">VoiceBox</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Welcome, {session?.user?.name || session?.user?.email}</span>
          <button onClick={() => signOut()} className="text-sm text-red-600 underline">Sign Out</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading ? (
          <p className="col-span-full text-gray-500">Loading...</p>
        ) : voices.length === 0 ? (
          <p className="col-span-full text-gray-500">No voices yet. Create one to get started.</p>
        ) : (
          voices.map((voice) => <VoiceCard key={voice.id} voice={voice} />)
        )}

        <button
          onClick={() => setShowModal(true)}
          className="border-2 border-dashed border-gray-300 rounded-xl p-5 flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50 transition cursor-pointer min-h-[140px]"
        >
          <span className="text-3xl text-gray-400">+</span>
          <span className="text-sm text-gray-500 font-medium">Add Voice</span>
        </button>
      </div>

      <AddVoiceModal open={showModal} onClose={() => setShowModal(false)} onCreated={loadVoices} />
    </div>
  )
}
