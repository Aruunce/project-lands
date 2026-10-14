const LT_DIACRITICS: Record<string, string> = {
  ą: "a",
  č: "c",
  ę: "e",
  ė: "e",
  į: "i",
  š: "s",
  ų: "u",
  ū: "u",
  ž: "z",
};

// Lowercase and replace Lithuanian letters with plain Latin ones ("Molėtų" -> "moletu").
export function stripDiacritics(input: string): string {
  return input
    .toLowerCase()
    .split("")
    .map((char) => LT_DIACRITICS[char] ?? char)
    .join("");
}

export function slugify(input: string): string {
  return stripDiacritics(input)
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export function randomSlugSuffix(length = 6): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}
