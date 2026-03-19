const ENTITY_MAP: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&apos;": "'",
  "&#39;": "'",
  "&#x27;": "'",
};

const ENTITY_PATTERN = /&(amp|lt|gt|quot|apos);|&#39;|&#x27;/gi;

export function decodeHtmlEntities(value: string): string {
  return value.replace(ENTITY_PATTERN, (match) => {
    const normalized = match.toLowerCase();
    return ENTITY_MAP[normalized] ?? match;
  });
}
