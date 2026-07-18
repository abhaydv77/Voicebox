import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Pen, MessageCircle, Sparkles } from 'lucide-react'

export const metadata = {
  title: 'VoiceBox - Write Like You',
  description: 'Create authentic social posts in your own voice with VoiceBox',
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <h1 className="text-2xl font-bold tracking-tight">VoiceBox</h1>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="text-center">
          <h2 className="text-balance text-5xl font-bold tracking-tight mb-6">Write like you. Not like a robot.</h2>
          <p className="text-pretty text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create a voice profile from your writing samples, then chat to get authentic social posts that sound like you.
          </p>
          <Link href="/voicebox">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              Get Started
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <Card className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3 mb-4">
                <Pen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Create Your Voice</h3>
              <p className="text-sm text-muted-foreground">
                Upload your writing samples and we&apos;ll extract your unique voice profile.
              </p>
            </div>
          </Card>

          {/* Feature 2 */}
          <Card className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3 mb-4">
                <MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Chat to Draft</h3>
              <p className="text-sm text-muted-foreground">
                Share your ideas and get styled replies that sound authentically like you.
              </p>
            </div>
          </Card>

          {/* Feature 3 */}
          <Card className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3 mb-4">
                <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Polish & Post</h3>
              <p className="text-sm text-muted-foreground">
                Fine-tune your drafts and share them directly to your favorite platforms.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-24">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <p className="text-center text-sm text-muted-foreground">
            © 2024 VoiceBox. Write authentic. Sound like you.
          </p>
        </div>
      </footer>
    </div>
  )
}
