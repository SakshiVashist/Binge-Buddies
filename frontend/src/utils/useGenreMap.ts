// src/hooks/useGenreMap.ts
import { useState, useEffect } from "react";
import { getGenres } from "../services/tmdbService";
import type { TMDBGenre } from "../types/tmdb";

export const useGenreMap = () => {
    const [genreMap, setGenreMap] = useState<Record<number, string>>({});
    const [genreNameToId, setGenreNameToId] = useState<Record<string, number>>({});
    const [isGenreLoading, setIsGenreLoading] = useState(true);

    useEffect(() => {
        const initializeGenres = async () => {
            try {
                // fetch genre list to convert genre name to id
                const [movieGenreRes, tvGenreRes] = await Promise.all([
                    getGenres("movie"),
                    getGenres("tv")
                ]);
                // map genre id to name for later display, and also name to id for lookup
                const tempGenreMap: Record<number, string> = {};
                const tempGenreNameToId: Record<string, number> = {};

                [...movieGenreRes, ...tvGenreRes].forEach((g: TMDBGenre) => {
                    const cleanName = g.name.toLowerCase().trim();
                    tempGenreMap[g.id] = g.name;
                    tempGenreNameToId[cleanName] = g.id;
                });

                setGenreMap(tempGenreMap);
                setGenreNameToId(tempGenreNameToId);
            } catch (error) {
                console.error("Failed to initialize dynamic genres:", error);
            } finally {
                setIsGenreLoading(false);
            }
        };

        initializeGenres();
    }, []);

    return { genreMap, genreNameToId, isGenreLoading };
};