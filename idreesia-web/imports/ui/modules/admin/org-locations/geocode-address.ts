export interface GeocodeResult {
  latitude: number;
  longitude: number;
  /** The part of the address that was actually matched. */
  matchedQuery: string;
  /** False when leading parts (house number, street) had to be dropped. */
  isFullMatch: boolean;
}

const SEARCH_URL = 'https://nominatim.openstreetmap.org/search';
const REQUEST_TIMEOUT_MS = 8000;
// Nominatim's usage policy allows at most one request per second.
const REQUEST_GAP_MS = 1100;
const MAX_ATTEMPTS = 3;
const MIN_PARTS = 2;

const wait = (ms: number) =>
  new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });

async function search(query: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const params = new URLSearchParams({
      q: query,
      format: 'jsonv2',
      limit: '1',
      'accept-language': 'en',
    });
    const response = await fetch(`${SEARCH_URL}?${params}`, {
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Address search failed (${response.status})`);
    const rows = (await response.json()) as { lat: string; lon: string }[];
    return rows[0]
      ? { latitude: Number(rows[0].lat), longitude: Number(rows[0].lon) }
      : null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Looks an address up on OpenStreetMap's Nominatim. House numbers and streets
 * are often missing from the map, so when the full address finds nothing the
 * leading comma-separated parts are dropped one at a time ("381-A, Colony,
 * Multan" then "Colony, Multan") until something matches.
 */
export async function geocodeAddress(
  address: string
): Promise<GeocodeResult | null> {
  const parts = address
    .split(/[,\n]/)
    .map(part => part.trim())
    .filter(Boolean);
  if (!parts.length) return null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const remaining = parts.slice(attempt);
    if (attempt > 0 && remaining.length < MIN_PARTS) return null;

    if (attempt > 0) await wait(REQUEST_GAP_MS);
    const matchedQuery = remaining.join(', ');
    const found = await search(matchedQuery);
    if (found) return { ...found, matchedQuery, isFullMatch: attempt === 0 };
  }
  return null;
}
