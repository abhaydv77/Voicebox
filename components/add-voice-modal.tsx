"use client"

import { useState } from "react"
import type { Voice } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ArrowRight, BookOpen, Loader2, PenLine, X } from "lucide-react"
import { toast } from "sonner"
import { ThemeToggle } from "@/components/theme-toggle"

interface AddVoiceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onVoiceAdded: (voice: Voice) => void
}

export function AddVoiceModal({ open, onOpenChange, onVoiceAdded }: AddVoiceModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [voiceName, setVoiceName] = useState("")
  const [sourceType, setSourceType] = useState<"own" | "writer">("own")
  const [samples, setSamples] = useState("")
  const [writerName, setWriterName] = useState("")
  const [isExtracting, setIsExtracting] = useState(false)
  const [error, setError] = useState("")

  const handleReset = () => {
    setStep(1)
    setVoiceName("")
    setSourceType("own")
    setSamples("")
    setWriterName("")
    setError("")
  }

  const handleNext = () => {
    if (step === 1) {
      if (!voiceName.trim()) {
        setError("Please enter a voice name")
        return
      }
      setError("")
      setStep(2)
    } else if (step === 2) {
      if (sourceType === "own" && !samples.trim()) {
        setError("Please enter your writing samples")
        return
      }
      if (sourceType === "writer" && !writerName.trim()) {
        setError("Please enter the writer name")
        return
      }
      setError("")
      handleCreate()
    }
  }

  const handleCreate = async () => {
    setIsExtracting(true)
    setError("")

    try {
      const sampleList = samples.split("\n").map((s) => s.trim()).filter(Boolean)
      const samplesToSend = sourceType === "writer" ? [writerName] : sampleList

      const res = await fetch("/api/voicebox/voices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: voiceName,
          sourceType,
          samples: samplesToSend,
          profile: { sentenceRhythm: "", vocabularyTendencies: "", punctuationHabits: "", structuralHabits: "" },
        }),
      })

      if (!res.ok) {
        let errorMsg = "Failed to create voice"
        try {
          const data = await res.json()
          errorMsg = data.error || errorMsg
        } catch {
          errorMsg = `${errorMsg} (${res.status})`
        }
        throw new Error(errorMsg)
      }

      const newVoice: Voice = await res.json()

      setStep(3)

      fetch("/api/voicebox/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voiceId: newVoice.id }),
      }).catch((err) => {
        console.error("Extraction failed:", err)
        toast.error("Voice extraction failed. You can retry from the voice settings.")
      })

      onVoiceAdded(newVoice)

      setTimeout(() => {
        onOpenChange(false)
        handleReset()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create voice profile")
      setStep(2)
    } finally {
      setIsExtracting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) handleReset()
      onOpenChange(newOpen)
    }}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden">
        <div className="p-8">
          {/* Step indicator */}
          <div className="flex mb-6 justify-between items-start">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className={`size-6 rounded-full flex items-center justify-center text-xs font-medium ${
                step >= 1 ? "bg-foreground text-background" : "bg-muted"
              }`}>1</span>
              <span className="text-muted-foreground">—</span>
              <span className={`size-6 rounded-full flex items-center justify-center text-xs font-medium ${
                step >= 2 ? "bg-foreground text-background" : "bg-muted"
              }`}>2</span>
              <span className="text-muted-foreground">—</span>
              <span className={`size-6 rounded-full flex items-center justify-center text-xs font-medium ${
                step >= 3 ? "bg-foreground text-background" : "bg-muted"
              }`}>3</span>
            </div>
            <button onClick={() => { onOpenChange(false); handleReset() }} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="size-4" />
            </button>
          </div>

          {step === 1 && (
            <div className="flex flex-col gap-6">
              <div className="flex w-full justify-between items-center gap-4">
                <div>
                  <h2 className="font-semibold text-xl">Name &amp; Source</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Give your voice a name and choose how to train it.
                  </p>
                </div>
                <ThemeToggle className="inline-flex transition-colors font-medium rounded-full text-sm leading-5 border border-border px-3 py-1.5 items-center gap-2 shrink-0" />
              </div>

              {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{error}</div>}

              <div className="flex flex-col gap-2">
                <label className="font-medium text-sm">Voice Name</label>
                <Input
                  placeholder="My LinkedIn Voice"
                  value={voiceName}
                  onChange={(e) => setVoiceName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSourceType("own")}
                  className={`text-left rounded-xl border p-4 transition-colors ${
                    sourceType === "own" ? "border-blue-600 bg-blue-50 dark:bg-blue-950/20" : "border-border hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <PenLine className="size-4 text-blue-600" />
                    <span className="font-medium text-sm">My writing</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Submit your own writing samples</span>
                </button>
                <button
                  onClick={() => setSourceType("writer")}
                  className={`text-left rounded-xl border p-4 transition-colors ${
                    sourceType === "writer" ? "border-blue-600 bg-blue-50 dark:bg-blue-950/20" : "border-border hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="size-4 text-blue-600" />
                    <span className="font-medium text-sm">A writer&apos;s style</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Emulate a known writer</span>
                </button>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                  Next
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="font-semibold text-xl">
                  {sourceType === "own" ? "Writing Samples" : "Writer Name"}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {sourceType === "own"
                    ? "Paste samples of your writing so VoiceBox can learn your style."
                    : "Which writer's style would you like to emulate?"}
                </p>
              </div>

              {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{error}</div>}

              {sourceType === "own" ? (
                <div>
                  <Textarea
                    placeholder="Paste your writing samples here. Separate multiple samples with line breaks."
                    value={samples}
                    onChange={(e) => setSamples(e.target.value)}
                    className="min-h-[200px]"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Add at least 2-3 samples (LinkedIn posts, emails, articles) to capture your voice.
                  </p>
                </div>
              ) : (
                <Input
                  placeholder="e.g., Paul Graham, Naval Ravikant"
                  value={writerName}
                  onChange={(e) => setWriterName(e.target.value)}
                  autoFocus
                />
              )}

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={handleNext} disabled={isExtracting} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {isExtracting ? "Creating..." : "Create"}
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center justify-center py-8">
              {isExtracting ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                  <p className="text-sm text-muted-foreground">Analyzing your writing samples...</p>
                </>
              ) : (
                <>
                  <div className="size-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-2xl mb-4">✓</div>
                  <p className="font-medium">Voice profile created successfully!</p>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
