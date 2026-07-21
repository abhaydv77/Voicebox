const ALLOWED_GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama3-70b-8192",
  "llama3-8b-8192",
  "mixtral-8x7b-32768",
  "gemma2-9b-it",
]

export async function callGroq(
  messages: { role: string; content: string }[],
): Promise<unknown> {
  const model = process.env.GROQ_MODEL
  if (!model) {
    throw new Error("callGroq: GROQ_MODEL env var is not set.")
  }

  if (!ALLOWED_GROQ_MODELS.includes(model)) {
    throw new Error(
      `callGroq: model "${model}" is not in the allowed list. ` +
        `Permitted: ${ALLOWED_GROQ_MODELS.join(", ")}`,
    )
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error("callGroq: GROQ_API_KEY env var is not set.")
  }

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, messages }),
  })

  if (!res.ok) {
    const errorBody = await res.text()
    throw new Error(`callGroq: API returned ${res.status} — ${errorBody}`)
  }

  const parsed: unknown = await res.json()

  const body = parsed as Record<string, unknown>
  const choices = body?.choices as { message?: { content?: string } }[] | undefined
  if (!choices || choices.length === 0 || !choices[0]?.message?.content) {
    throw new Error("callGroq: response has no valid choices or content")
  }

  return parsed
}
