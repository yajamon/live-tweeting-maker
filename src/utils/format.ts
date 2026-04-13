/** Format seconds as HH:MM:SS */
export function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

/**
 * Weighted character count following X/Twitter rules:
 * Full-width characters count as 2, half-width as 1, towards a limit of 280.
 */
export function twitterWeightedLength(text: string): number {
  let length = 0;
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;
    if (
      (code >= 0x1100 && code <= 0x11ff) || // Hangul Jamo
      (code >= 0x2e80 && code <= 0x9fff) || // CJK
      (code >= 0xac00 && code <= 0xd7af) || // Hangul Syllables
      (code >= 0xf900 && code <= 0xfaff) || // CJK Compat
      (code >= 0xfe30 && code <= 0xfe4f) || // CJK Compat Forms
      (code >= 0xff00 && code <= 0xff60) || // Fullwidth Forms
      (code >= 0xffe0 && code <= 0xffe6) || // Fullwidth Signs
      (code >= 0x1f000 && code <= 0x1fbff) || // Emojis / Symbols
      (code >= 0x20000 && code <= 0x2fa1f) // CJK Ext-B+
    ) {
      length += 2;
    } else {
      length += 1;
    }
  }
  return length;
}
