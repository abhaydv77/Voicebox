'use client'

import { Voice, Generation, User } from './types'
import { mockUser, mockVoices, mockGenerations } from './mock-data'

const STORAGE_PREFIX = 'voicebox_'
const CURRENT_USER_KEY = `${STORAGE_PREFIX}current_user`
const VOICES_KEY = `${STORAGE_PREFIX}voices`
const GENERATIONS_KEY = `${STORAGE_PREFIX}generations`

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(CURRENT_USER_KEY)
  return stored ? JSON.parse(stored) : mockUser
}

export function setCurrentUser(user: User | null) {
  if (typeof window === 'undefined') return
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(CURRENT_USER_KEY)
  }
}

export function getVoices(userId: string): Voice[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(VOICES_KEY)
  if (stored) {
    const all = JSON.parse(stored) as Voice[]
    return all.filter((v) => v.userId === userId)
  }
  // Initialize with mock voices
  localStorage.setItem(VOICES_KEY, JSON.stringify(mockVoices))
  return mockVoices
}

export function saveVoice(voice: Voice) {
  if (typeof window === 'undefined') return
  const stored = localStorage.getItem(VOICES_KEY)
  const voices = stored ? JSON.parse(stored) : mockVoices
  const existing = voices.findIndex((v: Voice) => v.id === voice.id)
  if (existing >= 0) {
    voices[existing] = voice
  } else {
    voices.push(voice)
  }
  localStorage.setItem(VOICES_KEY, JSON.stringify(voices))
}

export function deleteVoice(voiceId: string) {
  if (typeof window === 'undefined') return
  const stored = localStorage.getItem(VOICES_KEY)
  if (!stored) return
  const voices = JSON.parse(stored) as Voice[]
  const filtered = voices.filter((v) => v.id !== voiceId)
  localStorage.setItem(VOICES_KEY, JSON.stringify(filtered))
  // Also delete generations for this voice
  deleteGenerations(voiceId)
}

export function getGenerations(voiceId: string): Generation[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(GENERATIONS_KEY)
  if (stored) {
    const all = JSON.parse(stored) as Record<string, Generation[]>
    return all[voiceId] || []
  }
  // Initialize with mock generations
  localStorage.setItem(GENERATIONS_KEY, JSON.stringify(mockGenerations))
  return mockGenerations[voiceId] || []
}

export function addGeneration(voiceId: string, generation: Generation) {
  if (typeof window === 'undefined') return
  const stored = localStorage.getItem(GENERATIONS_KEY)
  const all = stored ? JSON.parse(stored) : mockGenerations
  if (!all[voiceId]) {
    all[voiceId] = []
  }
  all[voiceId].push(generation)
  localStorage.setItem(GENERATIONS_KEY, JSON.stringify(all))
}

export function deleteGenerations(voiceId: string) {
  if (typeof window === 'undefined') return
  const stored = localStorage.getItem(GENERATIONS_KEY)
  if (!stored) return
  const all = JSON.parse(stored) as Record<string, Generation[]>
  delete all[voiceId]
  localStorage.setItem(GENERATIONS_KEY, JSON.stringify(all))
}
