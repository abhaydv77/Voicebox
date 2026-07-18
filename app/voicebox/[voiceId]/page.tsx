"use client"

import { use, useEffect, useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import type { Voice, Generation } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Settings, Loader2, Send, Trash2, Save } from "lucide-react"

interface ChatPageProps {
  params: Promise<{ voiceId: string }>
}

export default function ChatPage({ params }: ChatPageProps) {
  const resolvedParams = use(params)
  const { status } = useSession()
  const router = useRouter()
  const [voice, setVoice] = useState<Voice | null>(null)
  const [generations, setGenerations] = useState<Generation[]>([])
  const [dataLoaded, setDataLoaded] = useState(false)
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [editingName, setEditingName] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState("")
  const [error, setError] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [generations])

  async function loadHistory(vId: string) {
    const res = await fetch(`/api/voicebox/chat/${vId}`)
    if (!res.ok) return
    const data: Generation[] = await res.json()
    setGenerations(data)
  }

  useEffect(() => {
    if (status === "loading") return
    if (status !== "authenticated" || !resolvedParams.voiceId) return
    fetch(`/api/voicebox/voices/${resolvedParams.voiceId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Voice | null) => {
        if (data) {
          setVoice(data)
          loadHistory(resolvedParams.voiceId)
        }
        setDataLoaded(true)
      })
  }, [status, resolvedParams.voiceId])

  const handleSendMessage = async () => {
    if (!message.trim() || !voice || isSending) return

    const userMsg = message
    setMessage("")
    setError("")
    setIsSending(true)

    try {
      const res = await fetch(`/api/voicebox/chat/${voice.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || "Failed to send message")
      }

      const data = await res.json()
      setGenerations((prev) => [...prev, data.generation])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message")
    } finally {
      setIsSending(false)
    }
  }

  const handleSaveName = async () => {
    if (!editingName.trim() || !voice) return
    const res = await fetch(`/api/voicebox/voices/${voice.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editingName }),
    })
    if (res.ok) {
      setVoice({ ...voice, name: editingName })
      setShowSettings(false)
    }
  }

  const handleDeleteVoice = async () => {
    if (deleteConfirm !== voice?.name || !voice) return
    const res = await fetch(`/api/voicebox/voices/${voice.id}`, {
      method: "DELETE",
    })
    if (res.ok) {
      router.push("/voicebox")
    }
  }

  if (status === "loading" || (status === "authenticated" && !dataLoaded)) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="h-screen bg-background flex items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground">Please sign in to access this voice</p>
        <Link href="/voicebox">
          <Button>Go to Voices</Button>
        </Link>
      </div>
    )
  }

  if (!voice) {
    return (
      <div className="h-screen bg-background flex items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground">Voice not found</p>
        <Link href="/voicebox">
          <Button>Go to Voices</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border flex items-center justify-between px-6 py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4">
          <Link href="/voicebox">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">{voice.name}</h1>
        </div>

        <button
          onClick={() => {
            setEditingName(voice.name)
            setShowSettings(true)
          }}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <Settings className="h-5 w-5" />
        </button>
      </header>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {generations.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-sm">
              <h2 className="text-xl font-semibold mb-2">Start a conversation</h2>
              <p className="text-muted-foreground mb-4">
                Share your ideas and I&apos;ll draft responses in {voice.name}&apos;s voice.
              </p>
              <p className="text-sm text-muted-foreground bg-muted rounded-lg p-3 italic">
                &quot;What would be a good topic to explore in my next post?&quot;
              </p>
            </div>
          </div>
        ) : (
          <>
            {generations.map((gen) => (
              <div key={gen.id} className="space-y-2">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="max-w-sm bg-gray-200 dark:bg-gray-700 text-foreground px-4 py-2 rounded-lg">
                    <p className="text-sm">{gen.userMsg}</p>
                  </div>
                </div>

                {/* Assistant Message */}
                <div className="flex justify-start">
                  <div className="max-w-sm bg-card border border-border text-card-foreground px-4 py-2 rounded-lg">
                    <p className="text-sm">{gen.reply}</p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded px-4 py-2 text-red-600 text-sm">{error}</div>
        )}
      </div>

      {/* Input Bar */}
      <div className="border-t border-border p-4 bg-background">
        <div className="mx-auto max-w-4xl flex gap-2">
          <Input
            placeholder="Type your idea..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            disabled={isSending}
            maxLength={2000}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isSending || !message.trim()}
            size="icon"
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        {message.length > 1800 && (
          <p className="text-xs text-muted-foreground mt-2 text-right">
            {2000 - message.length} characters remaining
          </p>
        )}
      </div>

      {/* Settings Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Voice Settings</DialogTitle>
            <DialogDescription>Manage your voice profile</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Rename Section */}
            <div>
              <label className="text-sm font-medium mb-2 block">Voice Name</label>
              <Input
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                placeholder="Enter new name"
              />
              <Button onClick={handleSaveName} className="w-full mt-2">
                <Save className="h-4 w-4 mr-2" />
                Save Name
              </Button>
            </div>

            <Separator />

            {/* Delete Section */}
            <div>
              <h3 className="font-medium text-destructive mb-2 flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Voice
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                This action cannot be undone. Type the voice name to confirm deletion.
              </p>
              <Input
                placeholder={`Type "${voice.name}" to confirm`}
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
              />
              <Button
                onClick={handleDeleteVoice}
                disabled={deleteConfirm !== voice.name}
                variant="destructive"
                className="w-full mt-2"
              >
                Delete Voice
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
