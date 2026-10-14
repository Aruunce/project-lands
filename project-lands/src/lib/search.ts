import { stripDiacritics } from "@/lib/slug";

// Text search that ignores Lithuanian letters and word endings: "moletai", "Molėtų"
// and "molėt" all find "Molėtų r. sav.". Listings store a normalized `searchText`.

export function buildSearchText(parts: (string | null | undefined)[]): string {
  return stripDiacritics(parts.filter(Boolean).join(" ")).replace(/\s+/g, " ").trim();
}

// Words of the query, normalized and with endings trimmed (5+ letters lose the last 2).
export function searchTerms(query: string): string[] {
  return stripDiacritics(query)
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map((word) => (word.length >= 5 ? word.slice(0, -2) : word))
    .slice(0, 6);
}
