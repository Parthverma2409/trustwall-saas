/**
 * Lightweight language detection based on Unicode script ranges and common words.
 * Returns ISO 639-1 code and display name.
 * No external API needed.
 */

const LANGUAGE_PATTERNS: { code: string; name: string; regex: RegExp }[] = [
  { code: 'zh', name: 'Chinese', regex: /[\u4e00-\u9fff]/ },
  { code: 'ja', name: 'Japanese', regex: /[\u3040-\u30ff\u31f0-\u31ff]/ },
  { code: 'ko', name: 'Korean', regex: /[\uac00-\ud7af\u1100-\u11ff]/ },
  { code: 'ar', name: 'Arabic', regex: /[\u0600-\u06ff\u0750-\u077f]/ },
  { code: 'hi', name: 'Hindi', regex: /[\u0900-\u097f]/ },
  { code: 'th', name: 'Thai', regex: /[\u0e00-\u0e7f]/ },
  { code: 'ru', name: 'Russian', regex: /[\u0400-\u04ff]/ },
  { code: 'el', name: 'Greek', regex: /[\u0370-\u03ff]/ },
  { code: 'he', name: 'Hebrew', regex: /[\u0590-\u05ff]/ },
  { code: 'ta', name: 'Tamil', regex: /[\u0b80-\u0bff]/ },
  { code: 'te', name: 'Telugu', regex: /[\u0c00-\u0c7f]/ },
  { code: 'bn', name: 'Bengali', regex: /[\u0980-\u09ff]/ },
]

// Common word patterns for Latin-script languages
const LATIN_PATTERNS: { code: string; name: string; words: string[] }[] = [
  { code: 'es', name: 'Spanish', words: ['el', 'la', 'los', 'las', 'es', 'muy', 'este', 'esta', 'por', 'como', 'para', 'con', 'pero', 'más', 'también'] },
  { code: 'fr', name: 'French', words: ['le', 'la', 'les', 'est', 'très', 'avec', 'pour', 'dans', 'cette', 'nous', 'mais', 'aussi', 'leur'] },
  { code: 'de', name: 'German', words: ['der', 'die', 'das', 'ist', 'und', 'ein', 'eine', 'für', 'mit', 'sehr', 'auch', 'nicht', 'sind'] },
  { code: 'pt', name: 'Portuguese', words: ['é', 'não', 'muito', 'para', 'com', 'mais', 'uma', 'este', 'esta', 'também', 'foi'] },
  { code: 'it', name: 'Italian', words: ['è', 'il', 'la', 'gli', 'molto', 'questo', 'questa', 'anche', 'con', 'per', 'sono'] },
  { code: 'nl', name: 'Dutch', words: ['het', 'een', 'van', 'voor', 'met', 'niet', 'ook', 'maar', 'zijn', 'deze', 'zeer'] },
  { code: 'tr', name: 'Turkish', words: ['bir', 'için', 'çok', 'ile', 'olan', 'bu', 've', 'ama', 'ben', 'biz'] },
  { code: 'pl', name: 'Polish', words: ['jest', 'nie', 'się', 'dla', 'bardzo', 'też', 'ale', 'ten', 'jak'] },
  { code: 'id', name: 'Indonesian', words: ['yang', 'dan', 'ini', 'itu', 'untuk', 'dengan', 'sangat', 'saya', 'mereka'] },
]

export function detectLanguage(text: string): { code: string; name: string } {
  // Check non-Latin scripts first
  for (const pattern of LANGUAGE_PATTERNS) {
    const matches = text.match(new RegExp(pattern.regex.source, 'g'))
    if (matches && matches.length >= 3) {
      return { code: pattern.code, name: pattern.name }
    }
  }

  // Check Latin-script languages by common word frequency
  const words = text.toLowerCase().split(/\s+/)

  let bestMatch = { code: 'en', name: 'English', score: 0 }

  for (const lang of LATIN_PATTERNS) {
    let score = 0
    for (const word of words) {
      if (lang.words.includes(word)) score++
    }
    // Normalize by text length
    const normalized = score / Math.max(words.length, 1)
    if (normalized > 0.08 && score > bestMatch.score) {
      bestMatch = { code: lang.code, name: lang.name, score }
    }
  }

  if (bestMatch.score > 0) {
    return { code: bestMatch.code, name: bestMatch.name }
  }

  // Default to English
  return { code: 'en', name: 'English' }
}
