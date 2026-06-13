const UNSAFE_CARD_TEXT_PATTERNS = [
  /\bcum\b/iu,
  /\bsex advice\b/iu,
  /\bsexually explicit\b/iu,
  /\badult\s+(?:film|movie|video|magazine|model|website|performer|content)\b/iu,
  /\bporn(?:ography|ographic)?\b/iu,
  /\berotic(?:a|ism)?\b/iu,
  /\bsoftcore\b/iu,
  /\bhardcore\b/iu,
  /\bnud(?:e|es|ity)\b/iu,
  /\bexplicit sexual\b/iu,
  /\bsexual (?:activity|acts|behavior|behaviour|content|intercourse)\b/iu,
  /\bsex tape\b/iu,
  /\bmasturbat(?:e|es|ed|ing|ion)\b/iu,
  /\bgenital(?:ia)?\b/iu,
  /\bpenis(?:es)?\b/iu,
  /\bpenile\b/iu,
  /\bphall(?:us|uses|ic|ological)\b/iu,
  /\bvagina(?:l)?\b/iu,
  /\bpubic\b/iu,
  /\bbrothel\b/iu,
  /\bstrip(?:per|club|tease)\b/iu,
  /\bfetish\b/iu,
];

export function textLooksUnsafeForCards(
  value: string | null | undefined,
): boolean {
  if (!value) {
    return false;
  }

  return UNSAFE_CARD_TEXT_PATTERNS.some((pattern) => pattern.test(value));
}
