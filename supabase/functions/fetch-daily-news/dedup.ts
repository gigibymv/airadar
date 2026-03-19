// ── Deduplication utilities ───────────────────────────────────────────
//
// Used by fetch-daily-news to prevent duplicate content from entering
// the database. All functions are pure and side-effect-free.

const STOPWORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "has",
  "have", "had", "will", "can", "not", "no", "in", "on", "at", "to",
  "for", "of", "and", "or", "but", "with", "by", "from", "that", "this",
  "it", "its", "how", "why", "what", "who", "when", "where", "which",
  "as", "do", "did", "does", "up", "out", "so", "if", "about", "new",
]);

// Canonical AI acronym normalisations (source → canonical).
const ACRONYM_MAP: Record<string, string> = {
  llms: "llm",
  gpts: "gpt",
  ais: "ai",
  mls: "ml",
};

/**
 * Normalises a raw title string for similarity comparison:
 * 1. Lowercase + trim
 * 2. Strip punctuation
 * 3. Remove common English stopwords
 * 4. Normalise AI acronym variants
 * 5. Collapse whitespace
 */
export function normalizeTitle(raw: string): string {
  if (!raw) return "";
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, " ")   // strip punctuation → space
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .map((w) => ACRONYM_MAP[w] ?? w)
    .filter((w) => !STOPWORDS.has(w))
    .join(" ");
}

/**
 * Returns the set of word bigrams for a normalised title string.
 * Falls back to unigrams when the title is a single word.
 */
export function titleBigrams(normalized: string): Set<string> {
  // Keep all tokens — stopwords were already stripped by normalizeTitle,
  // so single chars here are meaningful (version digits, acronyms).
  const words = normalized.split(/\s+/).filter((w) => w.length > 0);
  const bigrams = new Set<string>();
  if (words.length === 0) return bigrams;
  if (words.length === 1) {
    bigrams.add(words[0]);
    return bigrams;
  }
  for (let i = 0; i < words.length - 1; i++) {
    bigrams.add(`${words[i]} ${words[i + 1]}`);
  }
  return bigrams;
}

/**
 * Dice coefficient over two bigram sets.
 * Score range: 0.0 (no overlap) → 1.0 (identical).
 * Formula: 2 * |A ∩ B| / (|A| + |B|)
 */
export function diceCoefficient(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1.0;
  if (a.size === 0 || b.size === 0) return 0.0;
  const intersection = [...a].filter((x) => b.has(x)).length;
  return (2 * intersection) / (a.size + b.size);
}

const DICE_THRESHOLD = 0.65;
const NEAR_MATCH_LOG_THRESHOLD = 0.50;

/**
 * Returns true if `newTitle` is a near-duplicate of any title in
 * `existingTitles` (after normalisation + Dice coefficient on bigrams).
 *
 * Logs borderline near-matches (0.50–0.65) for threshold tuning.
 */
export function isSimilarTitle(
  newTitle: string,
  existingTitles: Set<string>,
  threshold = DICE_THRESHOLD,
): boolean {
  const normalizedNew = normalizeTitle(newTitle);
  if (!normalizedNew) return false;

  // Fast path: exact match after normalisation.
  if (existingTitles.has(normalizedNew)) return true;

  const newBigrams = titleBigrams(normalizedNew);
  if (newBigrams.size === 0) return false;

  for (const existing of existingTitles) {
    // existingTitles values are already normalised when stored via normalizeTitle().
    const score = diceCoefficient(newBigrams, titleBigrams(existing));
    if (score >= threshold) return true;
    if (score >= NEAR_MATCH_LOG_THRESHOLD) {
      console.log(
        `[dedup] near-match (dice=${score.toFixed(2)}): "${normalizedNew}" ≈ "${existing}"`,
      );
    }
  }
  return false;
}

/**
 * Deduplicates `items` within the batch itself (intra-batch).
 * Keeps the first occurrence of each title; later near-duplicates are dropped.
 * Mutates nothing — returns a new array.
 */
export function deduplicateBatch<T extends { title: string; url: string }>(
  items: T[],
  label: string,
): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    if (isSimilarTitle(item.title, seen)) {
      console.log(`[dedup] intra-batch duplicate dropped (${label}): "${item.title}"`);
      continue;
    }
    seen.add(normalizeTitle(item.title));
    result.push(item);
  }
  return result;
}
