
import { getPosterUrl } from "../services/tmdbService";
import type { TMDBSearchResult } from "../types/tmdb";

export function mapSearchDataToMovie(item: TMDBSearchResult, genreMap: Record<number, string>) {
    const releaseDate = item.release_date || item.first_air_date || "";
    const genreNames = item.genre_ids
        ? item.genre_ids.map((id: number) => genreMap[id] || "Other")
        : [];
    // uses the media_type from the search result to determine if it's a movie or TV show but if not available, it checks for the presence of first_air_date to infer it's a TV show, otherwise defaults to movie
    const detectedType: "movie" | "tv" =
        item.media_type === "tv" || item.first_air_date ? "tv" : "movie";


    return {
        id: item.id,
        title: item.title || item.name,
        year: releaseDate ? releaseDate.split("-")[0] : "N/A",
        image: item.poster_path ? getPosterUrl(item.poster_path) : null,
        rating: item.vote_average ? parseFloat(item.vote_average.toFixed(1)) : 0,
        synopsis: item.overview || "No description available.",
        genres: genreNames.slice(0, 3),
        platform: [], // We fetch this dynamically when the item is selected to avoid mass-hitting APIs
        mediaType: detectedType // Use the inferred type

    };
}