"use client"

import { use, useEffect, useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import type { Voice, Generation } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Settings, Loader2, Send, Trash2, Save, Copy, Check, Sparkles, MoonStar } from "lucide-react"

interface ChatPageProps {
  params: Promise<{ voiceId: string }>
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-purple-100 text-purple-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
]

function getAvatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
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
  const [showDraft, setShowDraft] = useState(false)
  const [tone, setTone] = useState<"casual" | "professional" | "witty">("casual")
  const [copiedId, setCopiedId] = useState<string | null>(null)
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
        body: JSON.stringify({ message: userMsg, tone }),
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

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
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
      <header className="shrink-0 backdrop-blur bg-background/95 border-b border-border">
        <div className="max-w-[1140px] flex mx-auto px-6 justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <Link href="/voicebox">
              <Button variant="ghost" size="icon" className="size-9 rounded-full">
                <ArrowLeft className="size-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <span className={`size-8 font-semibold rounded-full text-sm flex items-center justify-center ${getAvatarColor(voice.name)}`}>
                {voice.name.charAt(0).toUpperCase()}
              </span>
              <h1 className="truncate font-semibold text-base">{voice.name}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={showDraft ? "default" : "outline"}
              onClick={() => setShowDraft(!showDraft)}
            >
              <Sparkles className="size-4" />
              Show draft
            </Button>
            <Button size="sm" variant="outline">
              <MoonStar className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-9 rounded-full"
              onClick={() => { setEditingName(voice.name); setShowSettings(true) }}
            >
              <Settings className="size-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1140px] mx-auto px-6 py-8 h-full">
          <div className="max-w-3xl mx-auto flex flex-col gap-8 w-full h-full">
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
                  <div key={gen.id} className="space-y-3">
                    {/* User Message */}
                    <div className="flex justify-end">
                      <div className="max-w-[80%] flex flex-col items-end gap-1">
                        <div className="bg-muted text-foreground px-4 py-2.5 rounded-lg">
                          <p className="text-sm leading-6">{gen.userMsg}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(gen.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>

                    {/* Assistant Message */}
                    <div className="flex justify-start">
                      <div className="max-w-[85%] flex flex-col items-start gap-1">
                        <Card className="border-border shadow-none relative">
                          <button
                            onClick={() => handleCopy(gen.reply, gen.id)}
                            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {copiedId === gen.id ? (
                              <Check className="size-4 text-green-600" />
                            ) : (
                              <Copy className="size-4" />
                            )}
                          </button>
                          <CardContent className="pt-6 pr-12 pb-4 pl-4 gap-3">
                            <p className="text-sm leading-6">{gen.reply}</p>
                            {showDraft && gen.draft && (
                              <>
                                <Separator className="my-3" />
                                <p className="text-sm leading-6 text-muted-foreground">{gen.draft}</p>
                              </>
                            )}
                          </CardContent>
                        </Card>
                        <span className="text-xs text-muted-foreground">
                          {new Date(gen.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">{error}</div>
            )}
          </div>
        </div>
      </div>

      {/* Input Bar */}
      <div className="border-t border-border p-4 bg-background">
        <div className="max-w-3xl mx-auto flex flex-col gap-3 w-full">
          {/* Tone presets */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">Tone:</span>
            {(["casual", "professional", "witty"] as const).map((t) => (
              <Button
                key={t}
                size="sm"
                variant={tone === t ? "default" : "outline"}
                onClick={() => setTone(t)}
                className="capitalize"
              >
                {t}
              </Button>
            ))}
          </div>

          {/* Input row */}
          <div className="flex items-center gap-2">
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
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isSending || !message.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              {isSending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              Send
            </Button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Voice settings</DialogTitle>
            <DialogDescription>Rename or delete this voice profile.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <label className="font-medium text-sm">Voice name</label>
            <div className="flex items-center gap-2">
              <Input value={editingName} onChange={(e) => setEditingName(e.target.value)} />
              <Button onClick={handleSaveName} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <Save className="size-4" />
                Save
              </Button>
            </div>
          </div>
          <Separator />
          <div>
            <div className="flex flex-col gap-1 mb-3">
              <span className="font-medium text-destructive text-sm">Delete voice</span>
              <span className="text-xs text-muted-foreground">
                Type &quot;{voice.name}&quot; to confirm. This cannot be undone.
              </span>
            </div>
            <Input
              placeholder={voice.name}
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
            />
            <Button
              onClick={handleDeleteVoice}
              disabled={deleteConfirm !== voice.name}
              variant="destructive"
              className="w-full mt-2 gap-2"
            >
              <Trash2 className="size-4" />
              Delete voice
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
