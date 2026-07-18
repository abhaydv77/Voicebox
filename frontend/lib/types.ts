export interface VoiceProfile {
  sentenceRhythm: string
  vocabularyTendencies: string
  punctuationHabits: string
  structuralHabits: string
}

export interface Voice {
  id: string
  userId: string
  name: string
  sourceType: 'own' | 'writer'
  samples: string[]
  profile: VoiceProfile
  createdAt: string
}

export interface Generation {
  id: string
  userMsg: string
  reply: string
  draft: string
  createdAt: string
}

export interface User {
  id: string
  email: string
  name?: string
}
