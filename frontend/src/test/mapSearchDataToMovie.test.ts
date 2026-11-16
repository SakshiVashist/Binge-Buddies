import { describe, it, expect, vi } from "vitest";
import { mapSearchDataToMovie } from "../utils/mapSearchDataToMovie";


vi.mock("../services/tmdbService", () => ({
  getPosterUrl: (path: string) => path ? `https://image.tmdb.org/t/p/w500${path}` : "",
}));

describe("mapSearchDataToMovie utility", () => {
  const mockGenreMap = {
    28: "Action",
    12: "Adventure",
    878: "Sci-Fi",
  };
it("should correctly translate genre IDs to localized string names and maximum 3 items", () => {
    const mockItem = {
      id: 101,
      title: "Action Movie",
      genre_ids: [28, 12, 878, 999], // 4 genres, one missing from map
    };

    const result = mapSearchDataToMovie(mockItem, mockGenreMap);

    expect(result.genres).toEqual(["Action", "Adventure", "Sci-Fi"]);
  });

  it("should safely default to an empty array if genre_ids is missing", () => {
    const mockItem = { id: 102, title: "No Genre Movie" }; // no genre_ids array

    const result = mapSearchDataToMovie(mockItem, mockGenreMap);

    expect(result.genres).toEqual([]);
  });

  it("should correctly map all relevant fields from the search result to the movie object", () => {
    const mockItem = {
      id: 103,
      title: "Mapped Movie",
      release_date: "2020-01-01",
      poster_path:"/poster.jpg",
      vote_average: 7.5,
      overview: "A great movie.",
      genre_ids: [28, 12],
      media_type: "movie" as const,
    };

    const result = mapSearchDataToMovie(mockItem, mockGenreMap);

    expect(result.id).toBe(103);
    expect(result.title).toBe("Mapped Movie");
    expect(result.year).toBe("2020");
    expect(result.image).toBe("https://image.tmdb.org/t/p/w500/poster.jpg");
    expect(result.rating).toBe(7.5);
    expect(result.synopsis).toBe("A great movie.");
    expect(result.genres).toEqual(["Action", "Adventure"]);
    expect(result.mediaType).toBe("movie");
  });

  it("should deduce mediaType as 'movie' when release_date is present and media_type is not specified", () => {
    const mockMovie = {
      id: 201,
      title: "Inception",
      release_date: "2010-07-16",
    };

    const result = mapSearchDataToMovie(mockMovie, mockGenreMap);

    expect(result.mediaType).toBe("movie");
    expect(result.year).toBe("2010");
  });

  it("should deduce mediaType as 'tv' when first_air_date is present", () => {
    const mockTvShow = {
      id: 301,
      name: "The Boys",
      first_air_date: "2019-07-26",
    };

    const result = mapSearchDataToMovie(mockTvShow, mockGenreMap);

    expect(result.mediaType).toBe("tv");
    expect(result.title).toBe("The Boys"); //uses name when title is missing for tv shows
    expect(result.year).toBe("2019");
  });
});