// src/utils/handleSlotSelection.ts
import { fetchPlatforms } from "../services/tmdbService";

interface SelectionParams<T> {
  movie: T;
  activeSlot: 0 | 1;
  selectedMovies: (T | null)[];
  getIdToken: () => Promise<string | null>;
}

export async function handleSlotSelection<T extends { id: number; mediaType: "movie" | "tv" }>({
  movie,
  activeSlot,
  selectedMovies,
  getIdToken
}: SelectionParams<T>): Promise<{
  updatedSlots: (T & { platform: string[] } | null)[];
  nextActiveSlot: 0 | 1;
}> {
  let platforms: string[] = [];

  try {
    // Fetch the required authentication token and platforms
    const idToken = await getIdToken();
    if (idToken) {
      platforms = await fetchPlatforms(movie.id, idToken, movie.mediaType);
    }
  } catch (error) {
    console.error("Error fetching watch platforms:", error);
  }

  // Map the platform array to your movie object, if not available in SG, we can set it to "Not Available / Rent Only"
  const movieWithPlatforms = { 
    ...movie, 
    platform: platforms.length > 0 ? platforms : ["Not currently available in SG"] 
  };

  // duplicate the selectedMovies array and update the active slot with the newly selected movie
  const updatedSlots = [...selectedMovies] as (T & { platform: string[] } | null)[];
  updatedSlots[activeSlot] = movieWithPlatforms;

  // Determine which slot should automatically become active next, if slot 0 is selected, slot 1 becomes active. If the other slot is already filled, we keep the current active slot.
  const otherSlot = activeSlot === 0 ? 1 : 0;
  const nextActiveSlot = updatedSlots[otherSlot] === null ? otherSlot : activeSlot;

  // Return the newly computed states and next active slot back to the page component
  return {
    updatedSlots,
    nextActiveSlot
  };
}
