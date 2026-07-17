import { genAI } from "./gemini"

export type LLMProvider = "openrouter" | "gemini"

export function preCheck(provider: LLMProvider, model: string): void {
  if (!model) {
    throw new Error(`preCheck failed: model is empty for provider "${provider}"`)
  }

  if (provider === "openrouter") {
    if (!model.endsWith(":free")) {
      throw new Error(
        `preCheck failed: OpenRouter model "${model}" does not end with ":free". ` +
          `Only free-tier models (ending in ":free") are allowed.`,
      )
    }
  } else if (provider === "gemini") {
    const configuredModel = process.env.GEMINI_MODEL
    if (!configuredModel) {
      throw new Error(
        "preCheck failed: GEMINI_MODEL env var is not set. Cannot validate Gemini model.",
      )
    }
    if (model !== configuredModel) {
      if (!model.startsWith("gemini-")) {
        throw new Error(
          `preCheck failed: Gemini model "${model}" does not match GEMINI_MODEL="${configuredModel}" ` +
            `and is not a known gemini-* family model.`,
        )
      }
    }
  }
}

export function postCheck(provider: LLMProvider, responseData: unknown): void {
  if (!responseData) {
    throw new Error(
      `postCheck failed: empty response from ${provider}. No cost data to verify.`,
    )
  }

  if (provider === "openrouter") {
    const body = responseData as Record<string, unknown>
    const usage = body?.usage as Record<string, unknown> | undefined

    if (usage) {
      const costFields = ["total_cost", "cost", "totalCost"]
      for (const field of costFields) {
        const val = usage[field]
        if (typeof val === "number" && val > 0) {
          console.error(
            `[COST GUARD] NONZERO COST DETECTED — OpenRouter response has ${field}=${val}. ` +
              `Full response: ${JSON.stringify(responseData)}`,
          )
          throw new Error(
            `Cost guard violation: OpenRouter response has nonzero cost (${field}=${val}). ` +
              `Free tier violation — aborting.`,
          )
        }
      }
    }
  } else if (provider === "gemini") {
    const result = responseData as {
      response?: { candidates?: unknown[]; promptFeedback?: { blockReason?: string } }
    }
    const geminiResponse = result?.response
    if (!geminiResponse) {
      throw new Error(
        "postCheck failed: Gemini response missing 'response' field. Unexpected shape.",
      )
    }
    if (geminiResponse.promptFeedback?.blockReason) {
      console.error(
        `[COST GUARD] Gemini prompt was blocked: ${geminiResponse.promptFeedback.blockReason}. ` +
          `Full response: ${JSON.stringify(responseData)}`,
      )
      throw new Error(
        `Cost guard violation: Gemini prompt was blocked (${geminiResponse.promptFeedback.blockReason}).`,
      )
    }
    const candidates = geminiResponse.candidates
    if (!candidates || candidates.length === 0) {
      throw new Error(
        "postCheck failed: Gemini response has no candidates. No output generated.",
      )
    }
  }
}

export async function callOpenRouter(
  messages: { role: string; content: string }[],
): Promise<unknown> {
  const model = process.env.OPENROUTER_MODEL
  if (!model) {
    throw new Error(
      "callOpenRouter: OPENROUTER_MODEL env var is not set. Cannot make API call.",
    )
  }

  preCheck("openrouter", model)

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error(
      "callOpenRouter: OPENROUTER_API_KEY env var is not set.",
    )
  }

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, messages }),
  })

  if (!res.ok) {
    const errorBody = await res.text()
    throw new Error(
      `callOpenRouter: API returned ${res.status} — ${errorBody}`,
    )
  }

  const parsed: unknown = await res.json()

  postCheck("openrouter", parsed)

  return parsed
}

export async function callGemini(prompt: string): Promise<unknown> {
  const model = process.env.GEMINI_MODEL
  if (!model) {
    throw new Error(
      "callGemini: GEMINI_MODEL env var is not set. Cannot make API call.",
    )
  }

  preCheck("gemini", model)

  const genModel = genAI.getGenerativeModel({ model })
  const result = await genModel.generateContent(prompt)

  postCheck("gemini", result)

  return result
}
