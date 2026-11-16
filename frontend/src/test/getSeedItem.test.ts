import { describe, it, expect } from "vitest";
import { getSeedItem } from "../utils/getSeedItem";
import type { TmdbItem } from "../types/tmdb";

describe("getSeedItem", () => {
    it("returns highly rated item matching top genre first", () => {
        const validLogs = [
            { title: "Inception", genres: [{ name: "Action" }], userRating: 10 },
            { title: "Succession", genres: [{ name: "Drama" }], userRating: 16 },
        ] as TmdbItem[];
        const result = getSeedItem(validLogs, "Drama");
        expect(result?.title).toBe("Succession");
        expect(result?.genres?.[0]?.name).toBe("Drama");
    });

    it("returns first highly rated item when no genre match", () => {
        const validLogs = [
            { title: "Inception", genres: [{ name: "Action" }], userRating: 16 },
            { title: "Succession", genres: [{ name: "Drama" }], userRating: 5 },
        ] as TmdbItem[];
        const result = getSeedItem(validLogs, "Comedy");
        expect(result?.title).toBe("Inception");
        expect(result?.genres?.[0]?.name).toBe("Action");
    });


    it("returns first highly rated item when no genre match after filtering", () => {
        const validLogs = [
            { title: "Inception", genres: [{ name: "Action" }], userRating: 16 },
            { title: "Succession", genres: [{ name: "Comedy" }], userRating: 5 },
        ] as TmdbItem[];
        const result = getSeedItem(validLogs, "Comedy");
        expect(result?.title).toBe("Inception");
        expect(result?.genres?.[0]?.name).toBe("Action");
    });

    it("returns first valid log when no highly rated logs exist", () => {
        const validLogs = [
            { title: "Succession", genres: [{ name: "Drama" }], userRating: 5 },
        ] as TmdbItem[];
        const result = getSeedItem(validLogs, "Comedy");
        expect(result?.title).toBe("Succession");
        expect(result?.genres?.[0]?.name).toBe("Drama");
    });

    it("returns null when no logs at all", () => {
        const result = getSeedItem([], "Action");
        expect(result).toBeNull();
    });

    it("prioritises highly rated log matching top genre over other highly rated logs", () => {
        const validLogs = [
            { title: "Inception", genres: [{ name: "Action" }], userRating: 16 },
            { title: "Succession", genres: [{ name: "Drama" }], userRating: 14 },
        ] as TmdbItem[];
        const result = getSeedItem(validLogs, "Drama");
        expect(result?.title).toBe("Succession");
        expect(result?.genres?.[0]?.name).toBe("Drama");
    });
});
