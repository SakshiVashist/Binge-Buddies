import { getPosterUrl } from "../services/tmdbService";
import type { TmdbItem } from "../types/tmdb";

export function mapToCard(movie: TmdbItem) {
    return {
        title: movie.title || movie.name || "",
        genres: movie.genres?.map((g) => g.name) || [],
        synopsis: movie.overview || "",
        image: getPosterUrl(movie.poster_path),
        rating: movie.vote_average || 0,
        platform: movie.platforms || [],
    };
}
