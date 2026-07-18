import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { callOpenRouter } from "@/lib/cost-guard"
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
  try {
    const body = await req.json()
    message = body.message
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

  const draftModel = process.env.OPENROUTER_CHAT_DRAFT_MODEL
  const styleModel = process.env.OPENROUTER_CHAT_STYLE_MODEL

  if (!draftModel || !styleModel) {
    return NextResponse.json(
      { error: "Chat models not configured" },
      { status: 500 },
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
    draftResult = await callOpenRouter(
      [
        { role: "system", content: draftPrompt },
        ...conversationHistory,
        { role: "user", content: message },
      ],
      draftModel,
    )
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
    draft,
    userMessage: message,
    conversationHistory,
  })

  let styleResult: unknown
  try {
    styleResult = await callOpenRouter(
      [{ role: "system", content: stylePrompt }],
      styleModel,
    )
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

  const generation = await prisma.generation.create({
    data: {
      userId: session.user.id,
      voiceId,
      userMsg: message,
      draft,
      reply,
      draftModel,
      styleModel,
    },
  })

  const result: Generation = {
    id: generation.id,
    userId: generation.userId,
    voiceId: generation.voiceId,
    userMsg: generation.userMsg,
    draft: generation.draft,
    reply: generation.reply,
    draftModel: generation.draftModel,
    styleModel: generation.styleModel,
    createdAt: generation.createdAt.toISOString(),
  }

  return NextResponse.json({ reply, generation: result })
}
