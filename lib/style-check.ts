function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

function sentenceLengths(text: string): number[] {
  return splitSentences(text).map((s) => s.split(/\s+/).length)
}

function mean(a: number[]): number {
  return a.reduce((s, v) => s + v, 0) / a.length
}

function stdDev(a: number[], m: number): number {
  return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / a.length)
}

export interface StyleCheckResult {
  passed: boolean
  reason: string
  inputSentences: number
  outputSentences: number
  inputMeanLength: number
  outputMeanLength: number
}

export function checkSentenceRestructuring(
  inputText: string,
  outputText: string,
): StyleCheckResult {
  const inputSentences = splitSentences(inputText)
  const outputSentences = splitSentences(outputText)

  const inLens = sentenceLengths(inputText)
  const outLens = sentenceLengths(outputText)

  const inMean = mean(inLens)
  const outMean = mean(outLens)

  const inCount = inputSentences.length
  const outCount = outputSentences.length

  if (inCount < 2 && outCount < 2) {
    return {
      passed: true,
      reason: "too few sentences to compare",
      inputSentences: inCount,
      outputSentences: outCount,
      inputMeanLength: inMean,
      outputMeanLength: outMean,
    }
  }

  if (inCount === outCount) {
    const closePairs = inputSentences.filter((s, i) => {
      const outWords = outputSentences[i]?.split(/\s+/).length ?? 0
      const inWords = s.split(/\s+/).length
      return Math.abs(inWords - outWords) <= 3
    }).length

    if (closePairs >= inCount * 0.8) {
      return {
        passed: false,
        reason: `same number of sentences (${inCount}) and ≥80% have near-identical word counts — sentence boundaries likely unchanged`,
        inputSentences: inCount,
        outputSentences: outCount,
        inputMeanLength: inMean,
        outputMeanLength: outMean,
      }
    }
  }

  const inStd = stdDev(inLens, inMean)
  const outStd = stdDev(outLens, outMean)
  const meanDelta = Math.abs(inMean - outMean)
  const stdDelta = Math.abs(inStd - outStd)

  if (meanDelta < 3 && stdDelta < 3 && inCount === outCount) {
    return {
      passed: false,
      reason: `sentence stats nearly identical (mean: ${inMean.toFixed(1)}→${outMean.toFixed(1)}, stddev: ${inStd.toFixed(1)}→${outStd.toFixed(1)}, count: ${inCount}→${outCount}) — no genuine restructuring`,
      inputSentences: inCount,
      outputSentences: outCount,
      inputMeanLength: inMean,
      outputMeanLength: outMean,
    }
  }

  return {
    passed: true,
    reason: "sentence structure sufficiently changed",
    inputSentences: inCount,
    outputSentences: outCount,
    inputMeanLength: inMean,
    outputMeanLength: outMean,
  }
}
