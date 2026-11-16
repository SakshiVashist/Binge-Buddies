import type { TmdbItem } from "../types/tmdb";

// filter logs that are rated 7 and above
// prioritize a highly rated log that matches top genre, otherwise any highly rated log, if no highly rated log then the latest log if not null
export function getSeedItem(validLogs: TmdbItem[], topGenre: string): TmdbItem | null {
    const highlyRatedLogs = validLogs.filter((movie) => (movie.userRating || 0) >= 14);
    return (
    highlyRatedLogs.find((item) =>
      item.genres?.some((g) => g.name.toLowerCase() === topGenre.toLowerCase())
    ) ||
    highlyRatedLogs[0] ||
    validLogs[0] ||
    null
  );
}
