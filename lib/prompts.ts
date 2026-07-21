export function buildAnalyzeSamplesPrompt(params: {
  sourceType: "own" | "writer"
  samples: string[]
  writerName?: string
}): string {
  if (params.sourceType === "own") {
    const sampleText = params.samples.join("\n\n---\n\n")
    return [
      "Analyze the following writing samples and describe the author's stylistic patterns.",
      "",
      "Focus on these four categories:",
      "- Sentence rhythm: Are sentences short or long? Varied or uniform? Do they start the same way?",
      "- Vocabulary tendencies: Is the word choice formal or casual? Simple or sophisticated? Any recurring favorite words or phrases?",
      "- Punctuation habits: Are dashes, semicolons, commas, or periods used in a distinctive way?",
      "- Structural habits: How are paragraphs or arguments organized? Any recurring structural patterns?",
      "",
      "Describe abstract stylistic patterns only — sentence structure, word choice, punctuation, and paragraph organization. Do not quote or paraphrase the sample content, and do not mention specific names, facts, or stories found in the samples.",
      "",
      "Output your observations as free-form text (paragraphs or bullet points). Do NOT output JSON.",
      "",
      "Writing samples:",
      sampleText,
    ].join("\n")
  }

  const writerName = params.writerName || params.samples[0] || "this writer"
  return [
    `Describe the stylistic traits of ${writerName}'s writing.`,
    "",
    "Focus on these four categories:",
    "- Sentence rhythm: Are sentences short or long? Varied or uniform? Any signature patterns?",
    "- Vocabulary tendencies: Is the word choice formal or casual? Any distinctive word preferences?",
    "- Punctuation habits: Is punctuation used in a distinctive or unconventional way?",
    "- Structural habits: How are ideas organized? Any recurring structural patterns?",
    "",
    "Describe abstract patterns and tendencies only. Do NOT reproduce any copyrighted text or quote the writer's work.",
    "",
    "Output your observations as free-form text (paragraphs or bullet points). Do NOT output JSON.",
  ].join("\n")
}

export function buildChatDraftPrompt(params: {
  conversationHistory: { role: "user" | "assistant"; content: string }[]
  userMessage: string
}): string {
  const lines = [
    "You are a style-transfer pre-processor. Restate the user's input in a clean, neutral form.",
    "Add nothing, remove nothing, and change nothing beyond obvious typos or structural errors.",
    "The meaning and all specific content must remain identical to the original.",
    "",
    "Do NOT apply any specific voice or style — write in a neutral, clear tone.",
    "Output only the reply text. Do not include meta-commentary or markdown.",
    "",
    "Conversation history:",
  ]

  for (const msg of params.conversationHistory) {
    const label = msg.role === "user" ? "User" : "Assistant"
    lines.push(`${label}: ${msg.content}`)
  }

  lines.push("")
  lines.push(`User: ${params.userMessage}`)
  lines.push("")
  lines.push("Assistant:")

  return lines.join("\n")
}

export function buildChatStylePrompt(params: {
  profile: import("./types").VoiceProfileData
  samples: string[]
  draft: string
  userMessage: string
  conversationHistory: { role: "user" | "assistant"; content: string }[]
}): string {
  const profile = params.profile
  const sampleText = params.samples.join("\n\n---\n\n")
  const lines = [
    "You are an expert ghostwriter and voice-cloning assistant. Your objective is to write new content that perfectly matches the user's personal writing style.",
    "",
    "### Inputs Provided:",
    "",
    "1. **Extracted Voice Profile:**",
    `Sentence rhythm: ${profile.sentenceRhythm}`,
    `Vocabulary tendencies: ${profile.vocabularyTendencies}`,
    `Punctuation habits: ${profile.punctuationHabits}`,
    `Structural habits: ${profile.structuralHabits}`,
    "",
    "2. **Raw Reference Writing Samples (FEW-SHOT EXAMPLES):**",
    sampleText,
    "",
    "3. **Topic / Target Prompt for New Content:**",
    params.draft,
    "",
    "### STRICT STYLE MATCHING RULES:",
    "1. **Rhythm & Structure (REPLICATE THIS):**",
    "   Match sentence lengths, clause structures, punctuation patterns (e.g., dashes, ellipses), paragraph cadence, and overall flow from the Raw Reference Writing Samples.",
    "",
    "2. **Tone & Voice Parameters (REPLICATE THIS):**",
    "   Match the overall formality, energy level, and perspective described in the Extracted Voice Profile.",
    "",
    "3. **CRITICAL ANTI-LEAKAGE CONSTRAINTS (STRICT ISOLATION):**",
    "   - **No Vocabulary/Metaphor Bleed:** Do NOT use any specific nouns, adjectives, idioms, or metaphors present in the Raw Reference Writing Samples (e.g., words like \"sanctuary\", \"battlefield\", specific product names, or unique domain terminology).",
    "   - **No Topic Leakage:** Do NOT borrow facts, opinions, stories, or themes from the samples.",
    "   - **Vocabulary Generation:** Generate entirely NEW vocabulary suited for the Topic / Target Prompt while adhering only to the structural and rhythmic framework of the samples.",
    "",
    "4. **Output:** Generate the content directly based on the Topic / Target Prompt, using the style and rhythm derived from the raw reference samples. Output only the generated text — no meta-commentary, no markdown. Avoid all AI-writing tells: no em dashes used excessively, no hedging language, no formulaic transition phrases.",
  ]

  if (params.conversationHistory.length > 0) {
    lines.push('')
    lines.push('### Conversation History:')
    for (const msg of params.conversationHistory) {
      const label = msg.role === "user" ? "User" : "Assistant"
      lines.push(`${label}: ${msg.content}`)
    }
    lines.push('')
    lines.push('When the user provides feedback (e.g. "make it more casual"), apply that feedback while maintaining the voice style from the samples and profile.')
  }

  lines.push('')
  lines.push(`User message: ${params.userMessage}`)
  lines.push('')
  lines.push('Generated:')

  return lines.join("\n")
}

export function buildStructureProfilePrompt(rawAnalysis: string): string {
  const schema = JSON.stringify(
    {
      sentenceRhythm: "string",
      vocabularyTendencies: "string",
      punctuationHabits: "string",
      structuralHabits: "string",
    },
    null,
    2,
  )

  return [
    "Below is a raw analysis of a writer's stylistic patterns.",
    "",
    "Refine it into a structured voice profile. Follow these rules:",
    "- Make each field specific and concrete. Avoid generic statements like 'uses varied sentence structure'.",
    "- Instead, describe precise patterns, e.g. 'Prefers short declarative sentences under 15 words, occasionally uses a compound sentence for emphasis.'",
    "- Each field must be 1-3 sentences of specific description.",
    "- Do not include any specific names, facts, stories, or examples from the analysis in the profile fields. Describe only abstract stylistic patterns.",
    "- Output valid JSON only — no markdown fences, no explanatory text, no trailing punctuation.",
    "",
    `Expected JSON shape: ${schema}`,
    "",
    "Raw analysis:",
    rawAnalysis,
  ].join("\n")
}
