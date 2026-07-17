# Current State

Last updated: SPEC-002 complete, dev log reviewed.

## Working

### Auth
- `POST /api/auth/signup` — creates user, email + bcrypt-hashed password.
  Returns 201 / 400 / 409
- `GET/POST /api/auth/[...nextauth]` — NextAuth v5, Credentials provider.
  Returns session or 401

### Voice CRUD (all auth-gated, ownership-checked)
- `GET /api/voicebox/voices` — list authenticated user's voices
- `POST /api/voicebox/voices` — create a voice (name, sourceType,
  samples[], profile)
- `GET /api/voicebox/voices/[id]` — get one voice (404 if not owned)
- `PATCH /api/voicebox/voices/[id]` — update voice fields
- `DELETE /api/voicebox/voices/[id]` — delete voice

### Database
- Prisma + **SQLite** (dev only — see "Known issues" below)
- `User` — id, email (unique), name?, password?, timestamps
- `Voice` — id, userId (FK→User), name, sourceType, samples (JSON string),
  profile (JSON string), timestamps

### Frontend
- `/voicebox` — unauthenticated: inline sign in / sign up forms.
  Authenticated: greeting, sign out, "Create Voice" form, list of
  existing voices linking to `/voicebox/[id]`

## Not built yet (stubs only)

- `POST /api/voicebox/extract` → returns 501
- `POST /api/voicebox/generate` → returns 501
- `POST /api/voicebox/refine` → returns 501
- `/voicebox/[voiceId]` → placeholder page
- `/voicebox/new` → placeholder page
- `lib/gemini.ts` — client initialized, not yet called anywhere
- `lib/prompts.ts` — empty
- `hooks/useVoice.ts`, `hooks/useVoiceList.ts` — empty stubs

## Known issues / things to fix before shipping

- **SQLite won't survive serverless deploys** (e.g. Vercel) — filesystem
  is ephemeral there. Need to migrate Prisma's provider to Postgres
  (Supabase/Neon/Vercel Postgres) before any real deployment. Not urgent
  for local dev.

## Spec history

See `.voicebox/specs/` for the full instruction trail:
- `specs-001-project-setup.md` — DONE — project skeleton, deps, folder
  structure, core types
- `spec-002.md` — DONE — auth, DB, Voice CRUD, minimal UI
