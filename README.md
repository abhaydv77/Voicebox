# VoiceBox

AI writing has a "tell" — overly balanced sentences, generic hedge phrases,
uniform rhythm. VoiceBox exists to fix that for people who use AI to help
draft social posts (LinkedIn, X, etc.) but don't want the output to sound
like everyone else's AI-assisted post.

You create named **Voices** — style profiles built either from your own
past writing samples, or from a well-known writer's stylistic traits
(described abstractly, never reproducing their actual text). When you
write something new, VoiceBox rewrites it through that Voice, so the
output sounds like you — not like generic AI.

## How it works

1. Create a Voice from your own writing samples (or a writer's style)
2. Write a rough idea/draft of what you want to say
3. VoiceBox drafts the content, then rewrites it through your Voice's
   style profile — actively avoiding common AI-writing tells

## Tech stack

- Next.js (App Router) + TypeScript
- NextAuth v5 (Credentials provider)
- Prisma + SQLite (dev) — migrating to Postgres before production
- Gemini API (Flash model, free tier)

## Getting started

```bash
npm install
cp .env.local.example .env.local   # fill in GEMINI_API_KEY, NEXTAUTH_SECRET, etc.
npx prisma migrate dev
npm run dev
```

Visit `http://localhost:3000/voicebox`.

## Project docs

This repo is built spec-by-spec, CEO-instructs-developer style. See:

- [`VISION.md`](./VISION.md) — what we're building and why
- [`CURRENTSTATE.md`](./CURRENTSTATE.md) — what's actually built right now
- [`TODO.md`](./TODO.md) — what's next
- [`.voicebox/README.md`](./.voicebox/README.md) — how specs work
- [`.voicebox/specs/`](./.voicebox/specs/) — the actual instruction history
