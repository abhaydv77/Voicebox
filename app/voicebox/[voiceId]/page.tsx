"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import type { Voice } from "@/lib/types"

export default function VoiceDetailPage({
  params,
}: {
  params: Promise<{ voiceId: string }>
}) {
  const { data: session, status } = useSession()
  const [voice, setVoice] = useState<Voice | null>(null)
  const [loading, setLoading] = useState(true)
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState("")
  const [voiceId, setVoiceId] = useState<string | null>(null)

  useEffect(() => {
    params.then((p) => setVoiceId(p.voiceId))
  }, [params])

  useEffect(() => {
    if (!voiceId || status !== "authenticated") return
    fetch(`/api/voicebox/voices/${voiceId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setVoice(data))
      .finally(() => setLoading(false))
  }, [voiceId, status])

  async function handleExtract() {
    if (!voiceId) return
    setExtracting(true)
    setError("")

    const res = await fetch("/api/voicebox/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voiceId }),
    })

    if (res.ok) {
      const updated: Voice = await res.json()
      setVoice(updated)
    } else {
      const data = await res.json()
      setError(data.error || "Extraction failed")
    }

    setExtracting(false)
  }

  if (status === "loading" || loading) {
    return <div className="p-8">Loading...</div>
  }

  if (status === "unauthenticated") {
    return <div className="p-8">Please sign in to view this page.</div>
  }

  if (!voice) {
    return <div className="p-8 text-gray-500">Voice not found.</div>
  }

  const hasProfile = voice.profile.sentenceRhythm !== ""

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{voice.name}</h1>
        <span className="text-sm text-gray-500">{session?.user?.email}</span>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <p>
          <span className="font-medium">Type:</span>{" "}
          {voice.sourceType === "own" ? "Own writing" : "Writer style"}
        </p>
        <div>
          <span className="font-medium">Samples:</span>
          <ul className="list-disc list-inside mt-1">
            {voice.samples.map((s, i) => (
              <li key={i} className="text-gray-500 truncate">
                {s.slice(0, 100)}
                {s.length > 100 ? "..." : ""}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <hr />

      <div>
        <h2 className="text-xl font-semibold mb-3">Voice Profile</h2>

        {!hasProfile ? (
          <p className="text-gray-500 mb-4">
            Profile not yet extracted.
          </p>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-sm text-gray-700">
                Sentence Rhythm
              </h3>
              <p className="text-gray-600">{voice.profile.sentenceRhythm}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-700">
                Vocabulary Tendencies
              </h3>
              <p className="text-gray-600">
                {voice.profile.vocabularyTendencies}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-700">
                Punctuation Habits
              </h3>
              <p className="text-gray-600">
                {voice.profile.punctuationHabits}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-700">
                Structural Habits
              </h3>
              <p className="text-gray-600">
                {voice.profile.structuralHabits}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleExtract}
          disabled={extracting}
          className={`mt-6 px-4 py-2 rounded text-white ${
            extracting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {extracting
            ? "Extracting..."
            : hasProfile
              ? "Re-extract Voice Profile"
              : "Extract Voice Profile"}
        </button>

        {error && (
          <p className="mt-3 text-red-500 text-sm">{error}</p>
        )}
      </div>
    </div>
  )
}
