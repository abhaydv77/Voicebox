# VoiceBox — Current State

## What's built and working

### SPEC-001: Project Setup
- Next.js 16.2.10 + TypeScript + Tailwind CSS 4
- Prisma + SQLite, NextAuth v5 beta, Gemini SDK
- Folder skeleton with placeholder routes

### SPEC-002: Auth + Database + Voice CRUD
- `User` and `Voice` Prisma models (SQLite)
- `POST /api/auth/signup` — create account (201/400/409)
- `POST /api/auth/[...nextauth]` — credentials sign-in (session or 401)
- Voice CRUD: `GET/POST /api/voicebox/voices`, `GET/PATCH/DELETE /api/voicebox/voices/[id]`
- All voice routes auth-gated (401 if no session, 404 if not owner)
- Auth-gated UI on `/voicebox` with sign-in/signup forms and voice list

### SPEC-003: Cost-Guard Module (`lib/cost-guard.ts`)
- `preCheck(provider, model)` — OpenRouter: model must end with `:free`; Gemini: must match `GEMINI_MODEL` env or be `gemini-*`
- `postCheck(provider, responseData)` — OpenRouter: throws on nonzero `total_cost`/`cost`/`totalCost`; Gemini: validates candidates exist, not blocked
- `callOpenRouter(messages)` — pre-check → fetch → post-check → return parsed body (with `allow_fallbacks: false` to prevent paid fallback)
- `callGemini(prompt)` — pre-check → SDK call → post-check → return result
- All 9 unit tests pass

### SPEC-004: Voice Extraction Pipeline
- `lib/prompts.ts` — `buildAnalyzeSamplesPrompt` (free-form observations, no JSON) and `buildStructureProfilePrompt` (strict VoiceProfileData JSON)
- `lib/voice.ts` — shared `toVoice()` utility (extracted from CRUD routes)
- `POST /api/voicebox/extract` — two-call pipeline: OpenRouter analysis → Gemini structuring → save profile to DB
- Voice detail page at `/voicebox/[voiceId]` — shows profile, "Extract" button with loading/error states
- 502 errors propagated cleanly from both LLM calls

## What's still placeholder (501)
- `POST /api/voicebox/generate` — GENERATION pipeline (SPEC-005)
- `POST /api/voicebox/refine` — STYLE REFINE pipeline (SPEC-006)
- `/voicebox/new` page

## Env vars

| Var | Current value | Notes |
|-----|---------------|-------|
| `OPENROUTER_MODEL` | `tencent/hy3:free` | Was `gpt-oss-20b:free` (requires funded balance). Swap via env only. |
| `GEMINI_MODEL` | `gemini-2.0-flash` | Was `gemini-2.5-flash` (deprecated for new users). |
| `OPENROUTER_API_KEY` | set | Get at https://openrouter.ai/keys |
| `GEMINI_API_KEY` | set | Use https://aistudio.google.com/app/apikey (not Google Cloud console) |

## Known issues
- Gemini free tier API keys from Google Cloud console (`AQ.*` format) may have 0 daily quota. Use Google AI Studio (`AIza*` format) for 60 req/min free.
- OpenRouter free models are rate-limited on fresh keys — `tencent/hy3:free`, `poolside/laguna-xs-2.1:free`, and `cohere/north-mini-code:free` are currently working.
