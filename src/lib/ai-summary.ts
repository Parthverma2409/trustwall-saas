/**
 * Generates a short highlight summary from testimonial text.
 * Uses extractive summarization (picks the best sentence) — no external API needed.
 * Falls back to truncation if the text is a single sentence.
 */
export function generateSummary(text: string): string {
  // Split into sentences
  const sentences = text
    .replace(/([.!?])\s+/g, '$1|')
    .split('|')
    .map(s => s.trim())
    .filter(s => s.length > 10)

  if (sentences.length === 0) {
    return text.substring(0, 80) + (text.length > 80 ? '...' : '')
  }

  if (sentences.length === 1) {
    const s = sentences[0]
    return s.length > 100 ? s.substring(0, 97) + '...' : s
  }

  // Score sentences by impact signals
  const impactWords = [
    'best', 'amazing', 'excellent', 'incredible', 'outstanding', 'fantastic',
    'love', 'loved', 'perfect', 'recommend', 'recommended', 'changed',
    'transformed', 'game-changer', 'must-have', 'exceeded', 'impressed',
    'essential', 'invaluable', 'brilliant', 'exceptional', 'remarkable',
    'helped', 'saved', 'improved', 'boosted', 'increased', 'doubled',
    'tripled', 'grew', 'reduced', 'solved', 'fixed',
  ]

  const scored = sentences.map(sentence => {
    const lower = sentence.toLowerCase()
    let score = 0

    // Impact word matches
    for (const word of impactWords) {
      if (lower.includes(word)) score += 2
    }

    // Contains numbers/metrics (more specific = more compelling)
    if (/\d+%|\d+x|\$\d+/.test(sentence)) score += 3

    // Moderate length preferred (not too short, not too long)
    if (sentence.length > 30 && sentence.length < 120) score += 1

    // Starts with strong subject
    if (/^(this|their|the team|they|it|we)/i.test(sentence)) score += 1

    // Exclamation mark = enthusiasm
    if (sentence.includes('!')) score += 1

    return { sentence, score }
  })

  // Pick highest-scored sentence
  scored.sort((a, b) => b.score - a.score)
  const best = scored[0].sentence

  return best.length > 120 ? best.substring(0, 117) + '...' : best
}
