const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "as", "is", "was", "are", "were", "be",
  "been", "being", "have", "has", "had", "do", "does", "did", "will",
  "would", "could", "should", "may", "might", "shall", "can", "need",
  "dare", "ought", "used", "this", "that", "these", "those", "it",
  "its", "they", "them", "their", "we", "us", "our", "you", "your",
  "he", "him", "his", "she", "her", "hers", "i", "me", "my", "mine",
  "not", "no", "nor", "neither", "so", "if", "then", "than", "too",
  "very", "just", "about", "also", "only", "more", "most", "some",
  "any", "each", "every", "all", "both", "few", "several", "much",
  "many", "such", "own", "same", "other", "another", "else", "what",
  "which", "who", "whom", "whose", "when", "where", "why", "how",
  "because", "since", "while", "after", "before", "until", "during",
  "through", "between", "under", "over", "above", "below", "up", "down",
  "out", "off", "into", "onto", "upon", "within", "without", "like",
  "as", "than", "though", "although", "even", "though", "well", "here",
  "there", "one", "two", "three", "first", "second", "last", "next",
  "get", "got", "gotten", "make", "made", "take", "took", "taken",
  "say", "said", "see", "saw", "seen", "know", "knew", "known",
  "think", "thought", "come", "came", "come", "give", "gave", "given",
  "find", "found", "tell", "told", "let", "put", "set", "new", "now",
])

function contentWords(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w))
  return new Set(words)
}

export interface ContentCheckResult {
  passed: boolean
  reason: string
  inputContentWords: number
  outputContentWords: number
  novelWords: string[]
  novelRatio: number
}

export function checkContentPreservation(
  inputText: string,
  outputText: string,
): ContentCheckResult {
  const inputWords = contentWords(inputText)
  const outputWords = contentWords(outputText)

  const novel: string[] = []
  for (const w of outputWords) {
    if (!inputWords.has(w)) {
      novel.push(w)
    }
  }

  const novelRatio = outputWords.size > 0 ? novel.length / outputWords.size : 0

  if (novelRatio > 0.35) {
    return {
      passed: false,
      reason: `${(novelRatio * 100).toFixed(0)}% of output content words are novel — likely added content`,
      inputContentWords: inputWords.size,
      outputContentWords: outputWords.size,
      novelWords: novel.slice(0, 20),
      novelRatio,
    }
  }

  return {
    passed: true,
    reason: "content words preserved",
    inputContentWords: inputWords.size,
    outputContentWords: outputWords.size,
    novelWords: [],
    novelRatio,
  }
}
