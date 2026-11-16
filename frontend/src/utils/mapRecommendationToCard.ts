import { getPosterUrl } from "../services/tmdbService";
import type { TmdbItem } from "../types/tmdb";

// for recommendations page, mapping of cards (different fuction since it requires genre_ids array of numbers)

export function mapRecommendationToCard(item: TmdbItem, genreMap: Record<number, string>) {
    return {
        id: item.id,
        type: item.type,
        title: item.title || item.name || "",
        genres: item.genre_ids?.map((id: number) => genreMap[id] || "").filter(Boolean) || [],
        synopsis: item.overview || "",
        image: getPosterUrl(item.poster_path),
        rating: item.vote_average || 0,
        platform: item.platforms || [],
    }
}