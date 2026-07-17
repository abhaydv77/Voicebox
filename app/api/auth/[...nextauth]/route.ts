// NextAuth handler — will be wired up in SPEC-002.
// Placeholder returning 501 for now.
import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json(
    { error: "Not implemented" },
    { status: 501 }
  )
}

export async function POST() {
  return NextResponse.json(
    { error: "Not implemented" },
    { status: 501 }
  )
}
