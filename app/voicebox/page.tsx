"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import type { Voice } from "@/lib/types"
import { AuthForm } from "@/components/auth-form"
import { AddVoiceModal } from "@/components/add-voice-modal"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, LogOut, User } from "lucide-react"

export default function VoiceBoxPage() {
  const { data: session, status } = useSession()
  const [voices, setVoices] = useState<Voice[]>([])
  const [voicesLoaded, setVoicesLoaded] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (status !== "authenticated") return
    fetch("/api/voicebox/voices")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setVoices(data as Voice[])
        setVoicesLoaded(true)
      })
  }, [status])

  const showLoading = status === "loading" || (status === "authenticated" && !voicesLoaded)

  if (showLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border">
          <div className="mx-auto max-w-6xl px-6 py-4">
            <h1 className="text-2xl font-bold tracking-tight">VoiceBox</h1>
          </div>
        </header>
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
          <AuthForm />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">VoiceBox</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{session?.user?.email}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => signOut()} className="text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-12">
        {voices.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-4 mb-6">
              <Plus className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No voices yet</h2>
            <p className="text-muted-foreground mb-8 max-w-sm">
              Create your first voice profile to start generating authentic social posts.
            </p>
            <Button onClick={() => setIsModalOpen(true)} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Create Voice Profile
            </Button>
          </div>
        ) : (
          <>
            {/* Voices Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {voices.map((voice) => (
                <Link key={voice.id} href={`/voicebox/${voice.id}`}>
                  <Card className="p-4 h-full cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                    <div className="flex flex-col h-full">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg mb-3">
                        {voice.name.charAt(0).toUpperCase()}
                      </div>

                      {/* Content */}
                      <h3 className="font-semibold truncate mb-2">{voice.name}</h3>

                      {/* Badge */}
                      <div className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded w-fit mb-auto">
                        {voice.sourceType === "own" ? "Own writing" : "Writer style"}
                      </div>

                      {/* Date */}
                      <p className="text-xs text-muted-foreground mt-3">
                        {new Date(voice.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}

              {/* Add Voice Card */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="border-2 border-dashed border-border rounded-lg p-4 h-full hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer flex flex-col items-center justify-center"
              >
                <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm font-medium">Add Voice</span>
              </button>
            </div>
          </>
        )}
      </main>

      {/* Modal */}
      <AddVoiceModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onVoiceAdded={(newVoice) => {
          setVoices([...voices, newVoice])
        }}
      />
    </div>
  )
}
