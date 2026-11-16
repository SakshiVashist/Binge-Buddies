import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { getPosterUrl, getRecommendations, fetchPlatforms, discoverByGenre, searchMovies, getBingeBuddies } from "../services/tmdbService";

beforeEach(() => {
  vi.resetAllMocks();
});

// =====================
// getPosterUrl testing
// =====================

describe("getPosterUrl", () => {
  it("returns full TMDB image URL when given a valid path", () => {
    const result = getPosterUrl("/abc123.jpg");
    expect(result).toBe("https://image.tmdb.org/t/p/w500/abc123.jpg");
  });

  it("returns empty string when path is empty", () => {
    const result = getPosterUrl("");
    expect(result).toBe("");
  });
});

// ==========================
// getRecommendations testing
// ==========================

describe("getRecommendations", () => {
  it("returns results array when API call succeeds", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: [{ id: 1, title: "Dark" }] }),
    }) as unknown as typeof fetch;

    const result = await getRecommendations(93405, "tv");
    expect(result.results).toHaveLength(1);
    expect(result.results[0].title).toBe("Dark");
  });

  it("returns { results: [] } when API call fails", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
    }) as unknown as typeof fetch;

    const result = await getRecommendations(93405, "tv");
    expect(result).toEqual({ results: [] });
  });

  it("returns { results: [] } when fetch throws", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network error")) as unknown as typeof fetch;

    const result = await getRecommendations(93405, "tv");
    expect(result).toEqual({ results: [] });
  });
});

// =====================
// fetchPlatforms testing
// =====================
describe("fetchPlatforms", () => {
  it("returns provider names from flatrate array", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        flatrate: [
          { provider_name: "Netflix" },
          { provider_name: "Disney+" },
        ],
      }),
    }) as unknown as typeof fetch;

    const result = await fetchPlatforms(93405, "mock-token", "tv");
    expect(result).toEqual(["Netflix", "Disney+"]);
  });

  it("returns empty array when flatrate is missing", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as unknown as typeof fetch;

    const result = await fetchPlatforms(93405, "mock-token", "tv");
    expect(result).toEqual([]);
  });

  it("returns empty array when API response is not ok", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
    }) as unknown as typeof fetch;

    const result = await fetchPlatforms(93405, "mock-token", "tv");
    expect(result).toEqual([]);
  });

  // test for new cases since we are now accepting buying/renting/ads platforms as well
  it("merges provider names from rent, buy, and ads arrays", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        rent: [{ provider_name: "Amazon" }],
        buy: [{ provider_name: "iTunes" }],
        ads: [{ provider_name: "Tubi" }],
      }),
    }) as any;

    const result = await fetchPlatforms(93405, "mock-token", "tv");
    expect(result).toEqual(["Amazon", "iTunes", "Tubi"]);
  });

  it("de-duplicates a provider that appears in multiple categories", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        flatrate: [{ provider_name: "Netflix" }],
        rent: [{ provider_name: "Netflix" }],
        buy: [{ provider_name: "Netflix" }],
      }),
    }) as any;

    const result = await fetchPlatforms(93405, "mock-token", "tv");
    expect(result).toEqual(["Netflix"]);
  });

  it("filters out entries with missing or non-string provider_name", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        flatrate: [
          { provider_name: "Netflix" },
          { provider_name: null },
          { provider_name: "" },
          {},
        ],
      }),
    }) as any;

    const result = await fetchPlatforms(93405, "mock-token", "tv");
    expect(result).toEqual(["Netflix"]);
  });

  it("returns empty array when fetch throws", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network error")) as any;

    const result = await fetchPlatforms(93405, "mock-token", "tv");
    expect(result).toEqual([]);
  });

  it("calls fetch with the correct URL and Authorization header", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ flatrate: [] }),
    });
    globalThis.fetch = mockFetch as any;

    const movieId = 12345;
    const idToken = "mock-token";
    const mediaType = "movie";

    await fetchPlatforms(movieId, idToken, mediaType);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(`/watch-providers/${mediaType}/${movieId}`),
      expect.objectContaining({
        headers: { Authorization: `Bearer ${idToken}` },
      })
    );
  });
});

// =====================
// discoverByGenre testing
// =====================

describe("discoverByGenre", () => {
  it("returns results array when given valid genreId and mediaType", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: [{ id: 1, title: "Inception" }] }),
    }) as unknown as typeof fetch;

    const result = await discoverByGenre(28, "movie");
    expect(result.results).toHaveLength(1);
    expect(result.results[0].title).toBe("Inception");
  });

  it("returns empty array when API call fails", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
    }) as unknown as typeof fetch;

    const result = await discoverByGenre(28, "movie");
    expect(result).toEqual({ results: [] });
  });
})

// =====================
// searchMovies testing
// =====================
describe("searchMovies", () => {
  // Clear the mock setup before each individual test runs
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  // Test Case 1: The Success Path
  it("should successfully fetch and return the raw JSON results payload", async () => {
    const mockPayload = {
      results: [{ id: 1, title: "Inception", media_type: "movie" }]
    };

    // Force fetch to return a resolved promise
    (globalThis.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPayload,
    } as Response);

    const result = await searchMovies("Inception");

    // Verify that the fetch was called with the correct URL and that the result matches the mock payload
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/search?q=Inception")
    );
    expect(result).toEqual(mockPayload);
  });

  // Test Case 2: Query Encoding Validation
  it("should safely URL-encode queries containing spaces and special characters", async () => {
    (globalThis.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [] }),
    } as Response);

    await searchMovies("Spider-Man: No Way Home");

    // spaces and colons are converted to safe HTML escape characters
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("?q=Spider-Man%3A%20No%20Way%20Home")
    );
  });
  // Test Case 3: Empty Results Path
  it("should return an empty results array when searching for an invalid title", async () => {
    const mockEmptyPayload = { results: [] };

    (globalThis.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockEmptyPayload,
    } as Response);

    const result = await searchMovies("abcdefg1234567");

    // return empty results array when the search query yields no matches
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(result.results).toEqual([]);
  });

  // Test Case 4: Network Failure / Server Error
  it("should reject or handle exceptions when the fetch network request fails", async () => {
    // Simulate a total network breakdown (e.g., internet disconnected)
    (globalThis.fetch as Mock).mockRejectedValueOnce(new Error("Network Error"));

    // the function throws/rejects the error up so the UI can catch it
    await expect(searchMovies("Inception")).rejects.toThrow("Network Error");
  });
});
  

// =====================
// getBingeBuddies testing
// =====================

describe("getBingeBuddies", () => {
  it("calls the correct API endpoint with authorization header", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({matches: [], hasList: true, myOptIn: true}),
    });
    globalThis.fetch = mockFetch as any;
    await getBingeBuddies("mock-token");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/binge-buddies"),
      expect.objectContaining({
        method: "GET",
        headers: { Authorization: `Bearer mock-token` },
      })
    );
  });

  it("returns the parsed JSON response when API call is successful", async () => {
    const mockData = { matches: [{ uid: "123", username: "Alice", photoURL: null, matchCount: 5}], hasList: true, myOptIn: true };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    }) as any;

    const result = await getBingeBuddies("mock-token");
    expect(result).toEqual(mockData);
  });

  it("returns default values when API call fails", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
    }) as any;

    const result = await getBingeBuddies("mock-token");
    expect(result).toEqual({ matches: [], hasList: true, myOptIn: false });
  });

  it("does not call json() when API call fails", async () => {
    const mockJson = vi.fn();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: mockJson,
    }) as any;

    await getBingeBuddies("mock-token");
    expect(mockJson).not.toHaveBeenCalled();
  });
});

