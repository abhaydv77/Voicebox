# TODO

## Next up (SPEC-003 candidate)

- [ ] **Voice extraction pipeline** — turn raw samples (or a writer's
      name) into structured `VoiceProfileData` via Gemini
  - [ ] Own-writing path: `extractStyleFromSamples(samples: string[])`
  - [ ] Writer-based path: `extractStyleFromWriterName(name: string)` —
        must describe style abstractly, never reproduce the writer's
        actual text
  - [ ] Wire into `POST /api/voicebox/extract` (currently 501)
  - [ ] Force structured JSON output from Gemini (responseSchema) instead
        of parsing prose

## After that

- [ ] **Two-stage generation pipeline**
  - [ ] Stage 1: plain content draft (no style constraints)
  - [ ] Stage 2: rewrite through Voice's style profile, few-shot with real
        samples, actively avoid AI-writing tells (hedge phrases, uniform
        sentence length, over-clean parallel structure)
  - [ ] Wire into `POST /api/voicebox/generate` (currently 501)
- [ ] **Refine / feedback loop**
  - [ ] Track user edits to generated output
  - [ ] Feed edits back into refining the Voice's profile over time
  - [ ] Wire into `POST /api/voicebox/refine` (currently 501)
- [ ] **UI**
  - [ ] `/voicebox/new` — real form: own writing vs. writer-based Voice
        creation
  - [ ] `/voicebox/[voiceId]` — compose screen: write idea, get styled
        output, edit it
  - [ ] `hooks/useVoice.ts`, `hooks/useVoiceList.ts` — actually fetch data

## Before any real deployment

- [ ] **Migrate off SQLite** — switch Prisma provider to Postgres
      (Supabase/Neon/Vercel Postgres), since SQLite's file storage won't
      persist on serverless hosts
- [ ] Rate-limit / cost-guard Gemini calls (free tier RPM/RPD limits)
- [ ] Review NextAuth config for production (secrets, callback URLs)

## Not planned yet, just noted

- [ ] Feedback-loop-driven auto-refinement of style profiles (mentioned in
      vision, not yet speced)
- [ ] Decide if/when a vector store is ever actually needed (currently:
      no, samples fit directly in context)
