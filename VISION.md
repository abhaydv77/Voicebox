# Vision

## The problem

AI-assisted writing is everywhere now, and it's become recognizable.
Overly balanced sentence structure, generic hedge phrases ("it's important
to note," "in today's world"), suspiciously perfect grammar, predictable
paragraph rhythm — readers can spot it, and on platforms like LinkedIn and
X, that recognition carries a quiet cost: the post reads as less
authentic, less "you," even when the ideas inside it are genuinely yours.

People don't want to stop using AI to help them write. They want the
output to actually sound like them.

## What we're building

VoiceBox is a tool that captures how a specific person (or a specific
writer's style) actually writes, and uses that as a hard constraint on
generation — not a vibe, a structured profile: sentence rhythm,
vocabulary tendencies, punctuation habits, structural habits.

A user builds a library of named **Voices**:
- Their own voice, learned from samples of their real past writing
- Voices modeled on well-known writers, learned from a *description* of
  that writer's stylistic traits (never their actual copyrighted text)

Generation is two-stage on purpose: draft the content first, then rewrite
it through the Voice. Trying to do both at once (content + style) in a
single AI call reliably produces worse results — the model lets style
slip the moment the content gets complex. Splitting the jobs is what makes
this actually work.

## What "done" looks like for v1

A user can:
1. Sign up and log in
2. Create a Voice from pasted writing samples
3. Write a rough idea
4. Get back a rewritten post in their Voice that doesn't read as
   generic AI output
5. Edit the result, and have that edit inform the Voice over time

## What we're deliberately not doing (yet)

- Not building a vector-search/RAG system — a user's samples are small
  enough to fit directly in context every time, no retrieval needed
- Not letting Voices reproduce another writer's actual text — style
  description only, to stay clear of copyright issues
- Not over-engineering auth — Credentials provider is enough until there's
  a real reason to add OAuth providers
- Not optimizing for scale before the core loop (create Voice → generate
  → get a genuinely better result than plain AI) is proven to work well
