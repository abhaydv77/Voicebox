import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export default async function Home() {
  const session = await auth()
  if (session?.user) redirect("/voicebox")

  return (
    <div className="flex flex-1 items-center justify-center px-8 py-12">
      <div className="relative max-w-[720px] w-full shadow-[0_1px_0_rgba(0,0,0,0.02),0_24px_80px_rgba(0,0,0,0.06)] rounded-3xl border border-border overflow-hidden">
        <div className="absolute right-6 top-6">
          <ThemeToggle className="inline-flex transition-colors font-medium rounded-full text-sm leading-5 border border-border px-3 py-1.5 items-center gap-2" />
        </div>
        <div className="flex flex-col items-center gap-8 px-8 py-16 text-center">
          <div className="inline-flex shadow-sm rounded-full border border-border px-4 py-2 items-center gap-2">
            <div className="size-6 rounded-full bg-foreground text-background flex items-center justify-center">
              <Sparkles className="size-3.5" />
            </div>
            <span className="font-medium text-sm leading-5">VoiceBox</span>
          </div>
          <div className="max-w-[560px] flex flex-col gap-5">
            <h1 className="font-semibold text-5xl leading-[50px] tracking-tight text-balance">
              Write like you, even with AI&apos;s help
            </h1>
            <p className="text-muted-foreground text-lg leading-8 text-pretty">
              VoiceBox learns your unique writing style to help you craft authentic social posts that actually sound like you — not a robot.
            </p>
          </div>
          <Link href="/voicebox">
            <Button className="shadow-sm font-medium rounded-xl bg-foreground text-background text-base leading-6 p-6 hover:bg-foreground/90">
              Get Started
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
