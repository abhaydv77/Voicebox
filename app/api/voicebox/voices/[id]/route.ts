import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { Voice, VoiceProfileData } from "@/lib/types"

function toVoice(record: {
  id: string
  userId: string
  name: string
  sourceType: string
  samples: string
  profile: string
  createdAt: Date
  updatedAt: Date
}): Voice {
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

async function getOwnVoice(id: string, userId: string) {
  const record = await prisma.voice.findUnique({ where: { id } })
  if (!record || record.userId !== userId) return null
  return record
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const record = await getOwnVoice(id, session.user.id)
  if (!record) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(toVoice(record))
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const existing = await getOwnVoice(id, session.user.id)
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const body = await req.json()
  const data: Record<string, string> = {}

  if (body.name !== undefined) data.name = body.name
  if (body.sourceType !== undefined) {
    if (body.sourceType !== "own" && body.sourceType !== "writer") {
      return NextResponse.json(
        { error: "sourceType must be 'own' or 'writer'" },
        { status: 400 },
      )
    }
    data.sourceType = body.sourceType
  }
  if (body.samples !== undefined) {
    if (!Array.isArray(body.samples) || body.samples.length > 5) {
      return NextResponse.json(
        { error: "samples must be an array of at most 5 strings" },
        { status: 400 },
      )
    }
    data.samples = JSON.stringify(body.samples)
  }
  if (body.profile !== undefined) {
    data.profile = JSON.stringify(body.profile)
  }

  const updated = await prisma.voice.update({
    where: { id },
    data,
  })

  return NextResponse.json(toVoice(updated))
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const existing = await getOwnVoice(id, session.user.id)
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await prisma.voice.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
