import {describe, beforeEach, expect, vi, it, type Mock} from "vitest";
import { handleAddToWantToWatch } from "../utils/handleAddToWantToWatch";
import { saveUserWantToWatchList } from "../services/tmdbService";


// 1. Mock the external API service
vi.mock("../services/tmdbService", () => ({
  saveUserWantToWatchList: vi.fn().mockResolvedValue({success: true}),
}));

describe("handleAddToWantToWatch", () => {
  // Variables to hold our mock functions
  let mockSetWantToWatchList: Mock<(list: { id: number; type: "movie" | "tv" }[]) => void>;
  let mockGetIdToken: Mock<() => Promise<string | null>>;

  // Reset everything before each test runs
  beforeEach(() => {
    mockSetWantToWatchList = vi.fn();
    mockGetIdToken = vi.fn().mockResolvedValue("fake-firebase-token");
    vi.clearAllMocks();
  });

  // test case 1: adding new item

  it("adds item to the list if it is not already present", async () => {
    const newItem = { id: 123, type: "movie" } as const;
    const currentList: { id: number; type: "movie" | "tv" }[] = [];

    await handleAddToWantToWatch(
      newItem,
      currentList,
      mockSetWantToWatchList,
      mockGetIdToken
    );

    const expectedList = [{ id: 123, type: "movie" }];

    // Verify state was updated with the new item appended
    expect(mockSetWantToWatchList).toHaveBeenCalledWith(expectedList);
    // Verify the API was called with the updated list and token
    expect(saveUserWantToWatchList).toHaveBeenCalledWith(expectedList, "fake-firebase-token");
  });

  // test case 2: remove item if already in list

  it("removes item from the list if it is already present", async () => {
    const itemToToggle = { id: 123, type: "movie" } as const;
    const currentList = [
      { id: 123, type: "movie" } as const,
      { id: 456, type: "tv" } as const
    ] 

    await handleAddToWantToWatch(
      itemToToggle,
      currentList,
      mockSetWantToWatchList,
      mockGetIdToken
    );

    // The list should now only contain the TV show
    const expectedList = [{ id: 456, type: "tv" }];

    // Verify state was updated with fitlered list
    expect(mockSetWantToWatchList).toHaveBeenCalledWith(expectedList);
    expect(saveUserWantToWatchList).toHaveBeenCalledWith(expectedList, "fake-firebase-token");
  });

  // test case 3: function stops when user is unauthenticated 

  it("function stops and does not update state if user is unauthenticated", async () => {
    // Force the token to be null for this specific test
    mockGetIdToken.mockResolvedValueOnce(null);
    
    const newItem = { id: 123, type: "movie" } as const;

    await handleAddToWantToWatch(
      newItem,
      [],
      mockSetWantToWatchList,
       mockGetIdToken
    );

    // Verify that state updates and API calls never happened
    expect(mockSetWantToWatchList).not.toHaveBeenCalled();
    expect(saveUserWantToWatchList).not.toHaveBeenCalled();
  });


});