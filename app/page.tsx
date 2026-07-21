import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <main className="flex flex-col items-center gap-6 px-6 text-center max-w-lg">
        <h1 className="text-4xl font-bold tracking-tight text-balance">
          Write like you, even with AI&apos;s help
        </h1>
        <p className="text-lg text-muted-foreground text-pretty">
          VoiceBox learns your writing style and rewrites AI drafts so they sound like you — not like everyone else&apos;s AI-assisted posts.
        </p>
        <Link href="/voicebox">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
            Get Started
          </Button>
        </Link>
      </main>
    </div>
  )
}
