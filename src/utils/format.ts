/** Format seconds as HH:MM:SS.xx */
export function formatTime(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.round(totalSeconds * 100) / 100);
  const wholeSeconds = Math.floor(safeSeconds);
  const hours = Math.floor(wholeSeconds / 3600);
  const minutes = Math.floor((wholeSeconds % 3600) / 60);
  const seconds = wholeSeconds % 60;
  const centiseconds = Math.round((safeSeconds - wholeSeconds) * 100);

  if (centiseconds === 100) {
    return formatTime(wholeSeconds + 1);
  }

  return `${[hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":")}.${String(centiseconds).padStart(2, "0")}`;
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
