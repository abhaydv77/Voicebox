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
      "Be specific and reference evidence from the samples. Describe concrete patterns rather than making vague statements.",
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
    "You are a helpful writing assistant. The user has sent you a message in an ongoing conversation.",
    "Write a natural, helpful reply to the user's message.",
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
  draft: string
  userMessage: string
  conversationHistory: { role: "user" | "assistant"; content: string }[]
}): string {
  const profile = params.profile
  const lines = [
    'You are a style-rewriting engine. Your task is to rewrite a draft so it sounds like it was written by the voice described below.',
    '',
    '--- VOICE PROFILE ---',
    `Sentence rhythm: ${profile.sentenceRhythm}`,
    `Vocabulary tendencies: ${profile.vocabularyTendencies}`,
    `Punctuation habits: ${profile.punctuationHabits}`,
    `Structural habits: ${profile.structuralHabits}`,
    '--- END PROFILE ---',
    '',
    'Rules:',
    '- Preserve the meaning, facts, and structure of the draft — only change the style, tone, and wording',
    '- Avoid all AI-writing tells: no em dashes used excessively, no hedging language, no formulaic transition phrases',
    '- Output only the rewritten text — no meta-commentary, no markdown',
  ]

  if (params.conversationHistory.length > 0) {
    lines.push('')
    lines.push('The user is responding to the ongoing conversation. Apply their feedback (e.g. making it more casual, more professional, shorter) while also matching the voice profile.')
    lines.push('')
    lines.push('Conversation history:')
    for (const msg of params.conversationHistory) {
      const label = msg.role === "user" ? "User" : "Assistant"
      lines.push(`${label}: ${msg.content}`)
    }
  }

  lines.push('')
  lines.push(`User message: ${params.userMessage}`)
  lines.push('')
  lines.push(`Draft to rewrite: ${params.draft}`)
  lines.push('')
  lines.push('Rewritten:')

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
    "- Output valid JSON only — no markdown fences, no explanatory text, no trailing punctuation.",
    "",
    `Expected JSON shape: ${schema}`,
    "",
    "Raw analysis:",
    rawAnalysis,
  ].join("\n")
}
