import { fetchPlatforms } from "../services/tmdbService";
import type { TmdbItem } from "../types/tmdb";

export async function filteringProcess(
  items: TmdbItem[],
  idToken: string,
  watchedIds: Set<number>,
  wantToWatchKeys: Set<string> = new Set()
): Promise<TmdbItem[]> {
  const unwatched = items.filter((item) => {
    if (watchedIds.has(item.id)) return false;
    if (wantToWatchKeys.has(`${item.type}-${item.id}`)) return false;
    return true;
  });

  // Check platform availability for every candidate in parallel rather than
  // one-at-a-time, so the whole batch takes ~1 round-trip instead of N.
  const checked: (TmdbItem | null)[] = await Promise.all(
    unwatched.map(async (item) => {
      const platforms = await fetchPlatforms(item.id, idToken, item.type);
      return platforms.length > 0 ? { ...item, platforms } : null;
    })
  );

  return checked.filter((item): item is TmdbItem => item !== null);
}
