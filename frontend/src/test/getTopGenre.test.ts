import { describe, it, expect } from "vitest";
import { getTopGenre } from "../utils/getTopGenre";
import type { TmdbItem } from "../types/tmdb";

describe("getTopGenre", () => {
  it("returns None when no movies", () => {
    expect(getTopGenre([])).toBe("None");
  });

  it("returns correct top genre by points", () => {
    const movies = [
      { genres: [{ name: "Action" }], userRating: 16 }, // check if it chooses action since its rating is 7 or above
      { genres: [{ name: "Drama" }], userRating: 5 },   // +1 point
    ] as TmdbItem[];
    expect(getTopGenre(movies)).toBe("Action");
  });

  it("breaks tie by appearance count", () => {
    const movies = [
      { genres: [{ name: "Action" }], userRating: 5 },
      { genres: [{ name: "Action" }], userRating: 5 },
      { genres: [{ name: "Drama" }], userRating: 5 },
    ] as TmdbItem[];
    expect(getTopGenre(movies)).toBe("Action");
  });

  it("breaks tie alphabetically", () => {
    const movies = [
      { genres: [{ name: "Drama" }], userRating: 5 },
      { genres: [{ name: "Action" }], userRating: 5 },
    ] as TmdbItem[];
    expect(getTopGenre(movies)).toBe("Action");
  });

  it("returns None when movies have no genres", () => {
    const movies = [{ genres: [], userRating: 5 }] as unknown as TmdbItem[];
    expect(getTopGenre(movies)).toBe("None");
  });
});
