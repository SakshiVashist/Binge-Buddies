import { describe, it, expect, vi } from "vitest";
import { mapToCard } from "../utils/mapToCard";
import type { TmdbItem } from "../types/tmdb";

// mock getPosterUrl as we dont need real API

vi.mock("../services/tmdbService", () => ({
  getPosterUrl: (path: string) => path ? `https://image.tmdb.org/t/p/w500${path}` : "",
}));

describe("mapToCard", () => {
  it("maps movie title correctly", () => {
    const result = mapToCard({ title: "Inception", genres: [], overview: "", poster_path: "", vote_average: 8.8 } as unknown as TmdbItem);
    expect(result.title).toBe("Inception");
  });

  it("uses name when title is missing for TV shows", () => {
    const result = mapToCard({ name: "Squid Game", genres: [], overview: "", poster_path: "", vote_average: 8.0 } as unknown as TmdbItem);
    expect(result.title).toBe("Squid Game");
  });

  it("maps genres correctly", () => {
    const result = mapToCard({ title: "Test", genres: [{ name: "Action" }, { name: "Drama" }], overview: "", poster_path: "", vote_average: 0 } as unknown as TmdbItem);
    expect(result.genres).toEqual(["Action", "Drama"]);
  });

  it("returns empty genres array when genres missing", () => {
    const result = mapToCard({ title: "Test", overview: "", poster_path: "", vote_average: 0 } as unknown as TmdbItem);
    expect(result.genres).toEqual([]);
  });

  it("returns 0 rating when vote_average is missing", () => {
    const result = mapToCard({ title: "Test", genres: [], overview: "", poster_path: "" } as unknown as TmdbItem);
    expect(result.rating).toBe(0);
  });

  it("returns empty platform array when platforms missing", () => {
    const result = mapToCard({ title: "Test", genres: [], overview: "", poster_path: "", vote_average: 0 } as unknown as TmdbItem);
    expect(result.platform).toEqual([]);
  });

  it("maps synopsis correctly", () => {
    const result = mapToCard({ title: "Test", genres: [], overview: "A great movie", poster_path: "", vote_average: 0 } as unknown as TmdbItem);
    expect(result.synopsis).toBe("A great movie");
  });
});
