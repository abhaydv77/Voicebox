import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { callGroq } from "@/lib/cost-guard"
import { checkSentenceRestructuring } from "@/lib/style-check"
import { checkContentPreservation } from "@/lib/content-check"
import {
  buildChatDraftPrompt,
  buildChatStylePrompt,
} from "@/lib/prompts"
import type { Generation } from "@/lib/types"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ voiceId: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { voiceId } = await params

  const voiceRecord = await prisma.voice.findUnique({ where: { id: voiceId } })
  if (!voiceRecord || voiceRecord.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const generations = await prisma.generation.findMany({
    where: { voiceId },
    orderBy: { createdAt: "asc" },
  })

  const result: Generation[] = generations.map((g) => ({
    id: g.id,
    userId: g.userId,
    voiceId: g.voiceId,
    userMsg: g.userMsg,
    draft: g.draft,
    reply: g.reply,
    draftModel: g.draftModel,
    styleModel: g.styleModel,
    createdAt: g.createdAt.toISOString(),
  }))

  return NextResponse.json(result)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ voiceId: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { voiceId } = await params

  let message: string
  let tone: string | undefined
  try {
    const body = await req.json()
    message = body.message
    tone = body.tone
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 },
    )
  }

  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "message is required" }, { status: 400 })
  }

  if (message.length > 2000) {
    return NextResponse.json(
      { error: "Message must be 2000 characters or fewer" },
      { status: 400 },
    )
  }

  const voiceRecord = await prisma.voice.findUnique({ where: { id: voiceId } })
  if (!voiceRecord || voiceRecord.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const profile = voiceRecord.profile as {
    sentenceRhythm: string
    vocabularyTendencies: string
    punctuationHabits: string
    structuralHabits: string
  }

  const samples = voiceRecord.samples as string[]

  if (
    !profile.sentenceRhythm &&
    !profile.vocabularyTendencies &&
    !profile.punctuationHabits &&
    !profile.structuralHabits
  ) {
    return NextResponse.json(
      { error: "Voice profile not yet extracted." },
      { status: 400 },
    )
  }

  const generations = await prisma.generation.findMany({
    where: { voiceId },
    orderBy: { createdAt: "asc" },
  })

  const conversationHistory: { role: "user" | "assistant"; content: string }[] =
    generations.flatMap((g) => [
      { role: "user" as const, content: g.userMsg },
      { role: "assistant" as const, content: g.reply },
    ])

  const draftPrompt = buildChatDraftPrompt({
    conversationHistory,
    userMessage: message,
  })

  let draftResult: unknown
  try {
    draftResult = await callGroq([
      { role: "system", content: draftPrompt },
      ...conversationHistory,
      { role: "user", content: message },
    ])
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : "Unknown error"
    return NextResponse.json(
      { error: `Draft generation failed: ${errMsg}` },
      { status: 502 },
    )
  }

  const draftBody = draftResult as {
    choices?: { message?: { content?: string } }[]
  }
  const draft = draftBody?.choices?.[0]?.message?.content || ""

  if (!draft) {
    return NextResponse.json(
      { error: "Draft generation failed: no content in response" },
      { status: 502 },
    )
  }

  const stylePrompt = buildChatStylePrompt({
    profile,
    samples,
    draft,
    tone,
    userMessage: message,
    conversationHistory,
  })

  let styleResult: unknown
  try {
    styleResult = await callGroq([
      { role: "system", content: stylePrompt },
    ])
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : "Unknown error"
    return NextResponse.json(
      { error: `Style rewrite failed: ${errMsg}` },
      { status: 502 },
    )
  }

  const styleBody = styleResult as {
    choices?: { message?: { content?: string } }[]
  }
  const reply = styleBody?.choices?.[0]?.message?.content || ""

  if (!reply) {
    return NextResponse.json(
      { error: "Style rewrite failed: no content in response" },
      { status: 502 },
    )
  }

  const structureCheck = checkSentenceRestructuring(draft, reply)
  if (!structureCheck.passed) {
    console.error("[style-check] restructuring FAILED", JSON.stringify(structureCheck))
    return NextResponse.json(
      {
        error: "style_transfer_failed",
        message:
          "The rewrite didn't sufficiently change sentence structure. Please try again.",
      },
      { status: 422 },
    )
  }

  const contentCheck = checkContentPreservation(draft, reply)
  if (!contentCheck.passed) {
    console.error("[style-check] content FAILED", JSON.stringify(contentCheck))
    return NextResponse.json(
      {
        error: "content_leakage_detected",
        message:
          "The rewrite added content not present in the original. Please try again.",
      },
      { status: 422 },
    )
  }

  const model = process.env.GROQ_MODEL || ""

  const generation = await prisma.generation.create({
    data: {
      userId: session.user.id,
      voiceId,
      userMsg: message,
      draft,
      reply,
      draftModel: model,
      styleModel: model,
    },
  })

  const result: Generation = {
    id: generation.id,
    userId: generation.userId,
    voiceId: generation.voiceId,
    userMsg: generation.userMsg,
    draft: generation.draft,
    reply: generation.reply,
    draftModel: model,
    styleModel: model,
    createdAt: generation.createdAt.toISOString(),
  }

  return NextResponse.json({ reply, generation: result })
}
