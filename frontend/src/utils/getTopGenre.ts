import type { TmdbItem } from "../types/tmdb";

export function getTopGenre(movies: TmdbItem[]): string {
    if (movies.length === 0) return "None";
    const genrePoints: Record<string, number> = {};
    const genreAppearance: Record<string, number> = {};

    movies.forEach((movie) => {
        if (!movie || !movie.genres) return;
        const ratingValue = movie.userRating || 0;
        const pointsAwarded = ratingValue >= 14 ? 2 : 1;

        movie.genres.forEach((g) => {
            const name = g.name;
            if (!name) return;
            genrePoints[name] = (genrePoints[name] || 0) + pointsAwarded;
            genreAppearance[name] = (genreAppearance[name] || 0) + 1;
        });
    });

    const uniqueGenres = Object.keys(genrePoints);
    if (uniqueGenres.length === 0) return "None";

    uniqueGenres.sort((a, b) => {
        if (genrePoints[b] !== genrePoints[a]) return genrePoints[b] - genrePoints[a];
        if (genreAppearance[b] !== genreAppearance[a]) return genreAppearance[b] - genreAppearance[a];
        return a.localeCompare(b);
    });

    return uniqueGenres[0];
}
