import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { toVoice } from "@/lib/voice"
import { callOpenRouter, callGemini } from "@/lib/cost-guard"
import {
  buildAnalyzeSamplesPrompt,
  buildStructureProfilePrompt,
} from "@/lib/prompts"
import type { VoiceProfileData } from "@/lib/types"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { voiceId } = await req.json()
  if (!voiceId || typeof voiceId !== "string") {
    return NextResponse.json({ error: "voiceId is required" }, { status: 400 })
  }

  const record = await prisma.voice.findUnique({ where: { id: voiceId } })
  if (!record || record.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const samples: string[] = JSON.parse(record.samples)
  const sourceType = record.sourceType as "own" | "writer"

  const analyzePrompt = buildAnalyzeSamplesPrompt({
    sourceType,
    samples,
    writerName: sourceType === "writer" ? record.name : undefined,
  })

  let openRouterResult: unknown
  try {
    openRouterResult = await callOpenRouter([
      { role: "user", content: analyzePrompt },
    ])
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    console.error("[extract] OpenRouter call failed:", message)
    return NextResponse.json(
      { error: `Analysis failed: ${message}` },
      { status: 502 },
    )
  }

  const openRouterBody = openRouterResult as {
    choices?: { message?: { content?: string } }[]
  }
  const rawAnalysis =
    openRouterBody?.choices?.[0]?.message?.content || ""

  if (!rawAnalysis) {
    return NextResponse.json(
      { error: "Analysis failed: no content in OpenRouter response" },
      { status: 502 },
    )
  }

  const structurePrompt = buildStructureProfilePrompt(rawAnalysis)

  let geminiResult: unknown
  try {
    geminiResult = await callGemini(structurePrompt)
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    console.error("[extract] Gemini call failed:", message)
    return NextResponse.json(
      { error: `Refinement failed: ${message}` },
      { status: 502 },
    )
  }

  const geminiResponse = geminiResult as {
    response: { text: () => string }
  }
  const geminiText = geminiResponse?.response?.text()

  if (!geminiText) {
    return NextResponse.json(
      { error: "Refinement failed: no content in Gemini response" },
      { status: 502 },
    )
  }

  let profile: VoiceProfileData
  try {
    profile = JSON.parse(geminiText) as VoiceProfileData
    if (
      typeof profile.sentenceRhythm !== "string" ||
      typeof profile.vocabularyTendencies !== "string" ||
      typeof profile.punctuationHabits !== "string" ||
      typeof profile.structuralHabits !== "string"
    ) {
      throw new Error("Parsed profile is missing required fields")
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid JSON"
    console.error("[extract] Failed to parse Gemini output:", geminiText)
    return NextResponse.json(
      { error: `Extraction failed: could not parse profile — ${message}` },
      { status: 502 },
    )
  }

  const updated = await prisma.voice.update({
    where: { id: voiceId },
    data: { profile: JSON.stringify(profile) },
  })

  return NextResponse.json(toVoice(updated))
}
