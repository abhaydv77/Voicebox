"use client"

import { useSession } from "next-auth/react"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import type { Voice, Generation } from "@/lib/types"

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: string
}

function SettingsModal({
  voice,
  onClose,
  onUpdated,
  onDeleted,
}: {
  voice: Voice
  onClose: () => void
  onUpdated: (name: string) => void
  onDeleted: () => void
}) {
  const [name, setName] = useState(voice.name)
  const [confirmDelete, setConfirmDelete] = useState("")
  const [error, setError] = useState("")

  async function handleRename() {
    setError("")
    const res = await fetch(`/api/voicebox/voices/${voice.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
    if (res.ok) {
      onUpdated(name)
    } else {
      const data = await res.json()
      setError(data.error || "Rename failed")
    }
  }

  async function handleDelete() {
    if (confirmDelete !== voice.name) return
    setError("")
    const res = await fetch(`/api/voicebox/voices/${voice.id}`, {
      method: "DELETE",
    })
    if (res.ok) {
      onDeleted()
    } else {
      const data = await res.json()
      setError(data.error || "Delete failed")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold">Settings</h2>
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div>
          <label className="block text-sm font-medium">Voice Name</label>
          <div className="flex gap-2 mt-1">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="border rounded px-2 py-1 flex-1" />
            <button onClick={handleRename} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Save</button>
          </div>
        </div>

        <div>
          <span className="text-sm font-medium">Source Type: </span>
          <span className="text-sm text-gray-600">{voice.sourceType === "own" ? "Own writing" : "Writer style"}</span>
        </div>

        <hr />

        <div>
          <label className="block text-sm font-medium text-red-600">Delete Voice</label>
          <p className="text-xs text-gray-500 mt-1">Type <strong>{voice.name}</strong> to confirm:</p>
          <input
            type="text"
            value={confirmDelete}
            onChange={(e) => setConfirmDelete(e.target.value)}
            placeholder={voice.name}
            className="border rounded px-2 py-1 w-full mt-1"
          />
          <button
            onClick={handleDelete}
            disabled={confirmDelete !== voice.name}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default function VoiceChatPage({
  params,
}: {
  params: Promise<{ voiceId: string }>
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [voice, setVoice] = useState<Voice | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const [voiceId, setVoiceId] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    params.then((p) => setVoiceId(p.voiceId))
  }, [params])

  useEffect(() => {
    if (!voiceId || status !== "authenticated") return
    fetch(`/api/voicebox/voices/${voiceId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Voice | null) => {
        if (data) {
          setVoice(data)
          loadHistory(voiceId)
        } else {
          setVoice(null)
        }
      })
  }, [voiceId, status])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function loadHistory(vId: string) {
    const res = await fetch(`/api/voicebox/chat/${vId}`)
    if (!res.ok) return
    const data: Generation[] = await res.json()
    const msgs: ChatMessage[] = []
    for (const g of data) {
      msgs.push({ id: `${g.id}-user`, role: "user", content: g.userMsg, createdAt: g.createdAt })
      msgs.push({ id: `${g.id}-assistant`, role: "assistant", content: g.reply, createdAt: g.createdAt })
    }
    setMessages(msgs)
  }

  async function handleSend() {
    if (!input.trim() || !voiceId || sending) return
    const userMsg = input.trim()
    setInput("")
    setError("")

    const optimistic: ChatMessage = {
      id: `opt-${Date.now()}`,
      role: "user",
      content: userMsg,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimistic])
    setSending(true)

    const res = await fetch(`/api/voicebox/chat/${voiceId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMsg }),
    })

    if (res.ok) {
      const data = await res.json()
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? { ...m, id: data.generation.id + "-user" } : m)),
      )
      setMessages((prev) => [
        ...prev,
        {
          id: data.generation.id + "-assistant",
          role: "assistant",
          content: data.reply,
          createdAt: data.generation.createdAt,
        },
      ])
    } else {
      const errData = await res.json()
      setError(errData.error || "Failed to send message")
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
    }

    setSending(false)
  }

  if (status === "loading") return <div className="p-8">Loading...</div>
  if (status === "unauthenticated") return <div className="p-8">Please sign in to view this page.</div>
  if (voice === null) return <div className="p-8 text-gray-500">Voice not found.</div>

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto">
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <h1 className="text-xl font-bold">{voice.name}</h1>
        <button onClick={() => setShowSettings(true)} className="text-gray-500 hover:text-gray-700 text-2xl" aria-label="Settings">
          ⚙
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 mt-12">Start a conversation with {voice.name}</p>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-xl px-4 py-2 ${
                msg.role === "user" ? "bg-gray-200 text-gray-900" : "bg-white border text-gray-900"
              }`}
            >
              <p className="text-xs text-gray-500 mb-1">{msg.role === "user" ? "You" : voice.name}</p>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded px-4 py-2 text-red-600 text-sm">{error}</div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t px-6 py-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700"
          >
            {sending ? "..." : "Send"}
          </button>
        </div>
      </div>

      {showSettings && (
        <SettingsModal
          voice={voice}
          onClose={() => setShowSettings(false)}
          onUpdated={(name) => {
            setVoice({ ...voice, name })
            setShowSettings(false)
          }}
          onDeleted={() => {
            router.push("/voicebox")
          }}
        />
      )}
    </div>
  )
}
