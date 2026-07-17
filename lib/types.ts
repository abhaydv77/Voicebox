export type Voice = {
  id: string
  userId: string
  name: string
  sourceType: "own" | "writer"
  samples: string[]
  profile: VoiceProfileData
  createdAt: string
}

export type VoiceProfileData = {
  sentenceRhythm: string
  vocabularyTendencies: string
  punctuationHabits: string
  structuralHabits: string
}

export type Generation = {
  id: string
  userId: string
  voiceId: string
  input: string
  draft: string
  output: string
  edited?: string
  createdAt: string
}
