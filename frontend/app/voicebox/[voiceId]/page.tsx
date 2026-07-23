'use client'

import { use, useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { getVoices, getGenerations, addGeneration } from '@/lib/storage'
import { Voice, Generation } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Settings, Loader2, Send, Trash2, Save } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

interface ChatPageProps {
  params: Promise<{ voiceId: string }>
}

// Mock reply generation
function generateReply(userMsg: string, voiceProfile: Voice['profile']): { draft: string; reply: string } {
  const drafts = [
    'This is a great point. We should definitely explore this further and consider the implications.',
    'I completely agree. The key insight here is understanding the broader context.',
    'This resonates with me. I think we can implement this in phases.',
    'Absolutely. The challenge is balancing this with our current priorities.',
  ]

  const styled = [
    `That's brilliant. What strikes me is how this connects to the bigger picture—it's not just about execution, it's about philosophy. Have you considered the downstream effects?`,
    `I've been thinking about this too. The real insight is that this forces us to reconsider our assumptions. What would it look like if we committed fully?`,
    `This is exactly the kind of thinking we need. It challenges the status quo in a meaningful way. Let's dig deeper into this.`,
    `You've hit on something important here. The tension is real, but I think that's where the opportunity lives. What if we leaned into it?`,
  ]

  const randomIndex = Math.floor(Math.random() * drafts.length)
  return {
    draft: drafts[randomIndex],
    reply: styled[randomIndex],
  }
}

export default function ChatPage({ params }: ChatPageProps) {
  const resolvedParams = use(params)
  const { user, isLoading: authLoading } = useAuth()
  const [voice, setVoice] = useState<Voice | null>(null)
  const [generations, setGenerations] = useState<Generation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [editingName, setEditingName] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [generations])

  useEffect(() => {
    if (!authLoading && user) {
      const voices = getVoices(user.id)
      const found = voices.find((v) => v.id === resolvedParams.voiceId)
      setVoice(found || null)

      if (found) {
        const gens = getGenerations(found.id)
        setGenerations(gens)
      }
      setIsLoading(false)
    }
  }, [user, authLoading, resolvedParams.voiceId])

  const handleSendMessage = async () => {
    if (!message.trim() || !voice || isSending) return

    const userMsg = message
    setMessage('')
    setIsSending(true)

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 800))

      const { draft, reply } = generateReply(userMsg, voice.profile)

      const generation: Generation = {
        id: `gen-${uuidv4()}`,
        userMsg,
        draft,
        reply,
        createdAt: new Date().toISOString(),
      }

      addGeneration(voice.id, generation)
      setGenerations([...generations, generation])
    } finally {
      setIsSending(false)
    }
  }

  const handleSaveName = () => {
    if (!editingName.trim() || !voice) return
    // In a real app, this would call an API
    setEditingName('')
    setShowSettings(false)
  }

  const handleDeleteVoice = () => {
    if (deleteConfirm !== voice?.name) return
    // In a real app, this would call an API and redirect
    window.location.href = '/voicebox'
  }

  if (authLoading || isLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !voice) {
    return (
      <div className="h-screen bg-background flex items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground">Please sign in to access this voice</p>
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
      </div>

      {/* Input Bar */}
      <div className="border-t border-border p-4 bg-background">
        <div className="mx-auto max-w-4xl flex gap-2">
          <Input
            placeholder="Type your idea..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
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
