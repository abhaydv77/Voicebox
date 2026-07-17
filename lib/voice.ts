import type { Voice, VoiceProfileData } from "./types"

export type VoiceRecord = {
  id: string
  userId: string
  name: string
  sourceType: string
  samples: string
  profile: string
  createdAt: Date
  updatedAt: Date
}

export function toVoice(record: VoiceRecord): Voice {
  return {
    id: record.id,
    userId: record.userId,
    name: record.name,
    sourceType: record.sourceType as "own" | "writer",
    samples: JSON.parse(record.samples) as string[],
    profile: JSON.parse(record.profile) as VoiceProfileData,
    createdAt: record.createdAt.toISOString(),
  }
}
