import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { toVoice } from "@/lib/voice"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const records = await prisma.voice.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(records.map(toVoice))
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, sourceType, samples, profile } = body

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    if (sourceType !== "own" && sourceType !== "writer") {
      return NextResponse.json(
        { error: "sourceType must be 'own' or 'writer'" },
        { status: 400 },
      )
    }

    if (!Array.isArray(samples) || samples.length === 0 || samples.length > 5) {
      return NextResponse.json(
        { error: "samples must be an array of 1-5 strings" },
        { status: 400 },
      )
    }

    for (const s of samples) {
      if (typeof s !== "string" || s.length > 5000) {
        return NextResponse.json(
          { error: "Each sample must be a string of at most 5000 characters" },
          { status: 400 },
        )
      }
    }

    if (!profile || typeof profile !== "object") {
      return NextResponse.json(
        { error: "profile is required" },
        { status: 400 },
      )
    }

    const record = await prisma.voice.create({
      data: {
        userId: session.user.id,
        name,
        sourceType,
        samples,
        profile,
      },
    })

    return NextResponse.json(toVoice(record), { status: 201 })
  } catch (err) {
    console.error("POST /api/voicebox/voices error:", err)
    const message = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
