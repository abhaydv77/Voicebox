'use client'

import { useState } from 'react'
import type { Voice } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'

interface AddVoiceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onVoiceAdded: (voice: Voice) => void
}

export function AddVoiceModal({
  open,
  onOpenChange,
  onVoiceAdded,
}: AddVoiceModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [voiceName, setVoiceName] = useState('')
  const [sourceType, setSourceType] = useState<'own' | 'writer'>('own')
  const [samples, setSamples] = useState('')
  const [writerName, setWriterName] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)
  const [error, setError] = useState('')

  const handleReset = () => {
    setStep(1)
    setVoiceName('')
    setSourceType('own')
    setSamples('')
    setWriterName('')
    setError('')
  }

  const handleNext = () => {
    if (step === 1) {
      if (!voiceName.trim()) {
        setError('Please enter a voice name')
        return
      }
      setError('')
      setStep(2)
    } else if (step === 2) {
      if (sourceType === 'own' && !samples.trim()) {
        setError('Please enter your writing samples')
        return
      }
      if (sourceType === 'writer' && !writerName.trim()) {
        setError('Please enter the writer name')
        return
      }
      setError('')
      handleCreate()
    }
  }

  const handleCreate = async () => {
    setIsExtracting(true)
    setError('')

    try {
      const sampleList = samples.split('\n').map((s) => s.trim()).filter(Boolean)
      const samplesToSend = sourceType === 'writer' ? [writerName] : sampleList

      const res = await fetch('/api/voicebox/voices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: voiceName,
          sourceType,
          samples: samplesToSend,
          profile: { sentenceRhythm: '', vocabularyTendencies: '', punctuationHabits: '', structuralHabits: '' },
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create voice')
      }

      const newVoice: Voice = await res.json()

      setStep(3)

      // Trigger extraction asynchronously
      fetch('/api/voicebox/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voiceId: newVoice.id }),
      }).catch(() => {
        // Extraction will be retried from the voice page
      })

      onVoiceAdded(newVoice)

      setTimeout(() => {
        onOpenChange(false)
        handleReset()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create voice profile')
    } finally {
      setIsExtracting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) {
        handleReset()
      }
      onOpenChange(newOpen)
    }}>
      <DialogContent className="sm:max-w-[500px]">
        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle>Create Voice Profile</DialogTitle>
              <DialogDescription>Step 1 of 3: Name your voice</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">{error}</div>}
              <div>
                <label className="text-sm font-medium mb-2 block">Voice Name</label>
                <Input
                  placeholder="e.g., My LinkedIn Voice"
                  value={voiceName}
                  onChange={(e) => setVoiceName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Source Type</label>
                <div className="space-y-2">
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                    style={{ backgroundColor: sourceType === 'own' ? 'var(--input)' : 'transparent' }}>
                    <input
                      type="radio"
                      name="source"
                      value="own"
                      checked={sourceType === 'own'}
                      onChange={(e) => setSourceType(e.target.value as 'own')}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">My writing</div>
                      <div className="text-xs text-muted-foreground">Use my own writing samples</div>
                    </div>
                  </label>

                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                    style={{ backgroundColor: sourceType === 'writer' ? 'var(--input)' : 'transparent' }}>
                    <input
                      type="radio"
                      name="source"
                      value="writer"
                      checked={sourceType === 'writer'}
                      onChange={(e) => setSourceType(e.target.value as 'writer')}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">A writer&apos;s style</div>
                      <div className="text-xs text-muted-foreground">Emulate another writer&apos;s style</div>
                    </div>
                  </label>
                </div>
              </div>

              <Button onClick={handleNext} className="w-full">
                Next
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <DialogHeader>
              <DialogTitle>Create Voice Profile</DialogTitle>
              <DialogDescription>Step 2 of 3: {sourceType === 'own' ? 'Add your writing samples' : 'Enter writer name'}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">{error}</div>}

              {sourceType === 'own' ? (
                <div>
                  <label className="text-sm font-medium mb-2 block">Writing Samples</label>
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
                <div>
                  <label className="text-sm font-medium mb-2 block">Writer Name</label>
                  <Input
                    placeholder="e.g., Paul Graham, Naval Ravikant"
                    value={writerName}
                    onChange={(e) => setWriterName(e.target.value)}
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Enter the name of the writer whose style you want to emulate.
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleNext} className="flex-1" disabled={isExtracting}>
                  {isExtracting ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <DialogHeader>
              <DialogTitle>Creating Voice Profile</DialogTitle>
              <DialogDescription>Step 3 of 3: Analyzing your writing samples...</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center py-8">
              {isExtracting ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                  <p className="text-sm text-muted-foreground">Analyzing your writing samples...</p>
                </>
              ) : (
                <>
                  <div className="text-green-600 text-3xl mb-2">✓</div>
                  <p className="text-sm font-medium">Voice profile created successfully!</p>
                </>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
