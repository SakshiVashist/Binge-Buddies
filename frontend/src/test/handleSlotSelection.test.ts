import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleSlotSelection } from "../utils/handleSlotSelection";
import { fetchPlatforms } from "../services/tmdbService";

// Mock the tmdbService module completely so it doesn't execute real API calls
vi.mock("../services/tmdbService", () => ({
  fetchPlatforms: vi.fn(),
}));

describe("handleSlotSelection Utility", () => {
  // Simple fake authentication token resolver
  const mockGetIdToken = vi.fn().mockResolvedValue("fake-firebase-token");

  const mockMovie = {
    id: 123,
    title: "Interstellar",
    mediaType: "movie" as "movie" | "tv",
  };

  beforeEach(() => {
    vi.clearAllMocks(); // Clear tracking metrics between runs
  });

  it("should populate the active slot with platforms returned from the API", async () => {
    // Force the platform spy to return specific networks
    vi.mocked(fetchPlatforms).mockResolvedValue(["Netflix", "Disney+"]);
    const emptySlots = [null, null];

    // Select a movie into the left box (index 0)
    const result = await handleSlotSelection({
      movie: mockMovie,
      activeSlot: 0,
      selectedMovies: emptySlots,
      getIdToken: mockGetIdToken,
    });

    // Verify the parameters forwarded to your API service layer
    expect(mockGetIdToken).toHaveBeenCalled();
    expect(fetchPlatforms).toHaveBeenCalledWith(123, "fake-firebase-token", "movie");

    // Check if slot 0 was updated with the movie and its platforms, while slot 1 remains empty
    expect(result.updatedSlots[0]).toEqual({
      id: 123,
      title: "Interstellar",
      mediaType: "movie",
      platform: ["Netflix", "Disney+"],
    });
    expect(result.updatedSlots[1]).toBeNull(); // Right box remains empty 
  });

  it("should display fallback for platform availability when the API returns an empty array", async () => {
    // Force API to return no available streaming providers
    vi.mocked(fetchPlatforms).mockResolvedValue([]);

    const result = await handleSlotSelection({
      movie: mockMovie,
      activeSlot: 0,
      selectedMovies: [null, null],
      getIdToken: mockGetIdToken,
    });

    // Verifies your custom regional availability fallback rule
    expect(result.updatedSlots[0]!.platform).toEqual(["Not currently available in SG"]);
  });

  it("should shift focus onto the remaining open slot index if it is currently empty", async () => {
    vi.mocked(fetchPlatforms).mockResolvedValue(["Prime Video"]);

    const result = await handleSlotSelection({
      movie: mockMovie,
      activeSlot: 0, // Filled left box
      selectedMovies: [null, null], // Both boxes were empty
      getIdToken: mockGetIdToken,
    });

    // Right box (index 1) is open, so auto-forward highlight focus to 1
    expect(result.nextActiveSlot).toBe(1);
  });

  it("should lock focus on the current slot if the opposite slot is already full", async () => {
    vi.mocked(fetchPlatforms).mockResolvedValue(["Apple TV"]);

    // Pretend the right slot (index 1) already has an item locked inside it
    const existingSlots = [null, { id: 999, title: "Existing Show", mediaType: "tv" as const, platform: ["Netflix"] }];

    const result = await handleSlotSelection({
      movie: mockMovie,
      activeSlot: 0, // Filling the last remaining vacancy
      selectedMovies: existingSlots,
      getIdToken: mockGetIdToken,
    });

    //Because right slot (index 1) is full, keep active cursor at index 0 
    expect(result.nextActiveSlot).toBe(0);
  });
});