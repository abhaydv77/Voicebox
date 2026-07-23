"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import type { Voice } from "@/lib/types"
import { AuthForm } from "@/components/auth-form"
import { AddVoiceModal } from "@/components/add-voice-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Plus, LogOut, Sparkles, Sun, Moon, TriangleAlert, User } from "lucide-react"

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

export default function VoiceBoxPage() {
  const { data: session, status } = useSession()
  const [voices, setVoices] = useState<Voice[]>([])
  const [voicesLoaded, setVoicesLoaded] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status !== "authenticated") return
    fetch("/api/voicebox/voices")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch (${res.status})`)
        return res.json()
      })
      .then((data) => {
        setVoices(data as Voice[])
        setVoicesLoaded(true)
      })
      .catch((err) => {
        setError(err.message)
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <AuthForm />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border flex px-8 justify-between items-center h-16">
        <div className="flex items-center gap-2">
          <div className="size-8 shadow-sm rounded-lg bg-blue-600 text-white flex items-center justify-center">
            <Sparkles className="size-4" />
          </div>
          <span className="font-semibold text-lg">VoiceBox</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="inline-flex transition-colors font-medium rounded-full text-sm leading-5 border border-border px-3 py-1.5 items-center gap-2">
            <Sun className="size-4" />
            <Moon className="size-4" />
          </button>
          <div className="text-sm flex items-center gap-2 text-muted-foreground">
            <User className="size-4" />
            <span>{session?.user?.email}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => signOut()} className="gap-2">
            <LogOut className="size-4" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="p-8">
        <div className="flex mb-6 justify-between items-start gap-6">
          <div>
            <h1 className="font-semibold text-2xl mb-1">Your Voices</h1>
            <p className="text-sm text-muted-foreground">
              Manage and chat with your writing voice profiles
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-border mb-6 px-4 py-3 flex justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <TriangleAlert className="size-4 shrink-0 text-destructive" />
              <div>
                <div className="font-medium text-sm">Couldn&apos;t load your voices</div>
                <div className="text-sm text-muted-foreground">
                  {error}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        )}

        {voices.length === 0 && !error ? (
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {voices.map((voice) => (
              <Link key={voice.id} href={`/voicebox/${voice.id}`}>
                <Card className="shadow-sm p-6 gap-4 cursor-pointer hover:shadow-md transition-shadow h-full">
                  <CardHeader className="p-0 gap-2">
                    <div className={`size-12 font-semibold rounded-full flex items-center justify-center text-lg ${getAvatarColor(voice.name)}`}>
                      {voice.name.charAt(0).toUpperCase()}
                    </div>
                  </CardHeader>
                  <CardContent className="flex p-0 flex-col gap-2">
                    <span className="truncate font-medium">{voice.name}</span>
                    <span className="inline-flex rounded-full text-xs leading-4 px-2 py-0.5 w-fit bg-muted text-muted-foreground">
                      {voice.sourceType === "own" ? "Own writing" : "Writer style"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Created {new Date(voice.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}

            <button onClick={() => setIsModalOpen(true)} className="text-left">
              <Card className="shadow-sm border-dashed p-6 h-full flex flex-col items-center justify-center gap-4 hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors cursor-pointer">
                <Plus className="size-8 text-muted-foreground" />
                <span className="font-medium text-sm text-muted-foreground">Add Voice</span>
              </Card>
            </button>
          </div>
        )}
      </div>

      <AddVoiceModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onVoiceAdded={(newVoice) => {
          setVoices([...voices, newVoice])
          setError("")
        }}
      />
    </div>
  )
}
