const BASE_URL = "https://binge-buddies-orbital-26-1.onrender.com/api/tmdb";
import type { TMDBSearchResult, TMDBProvider } from "../types/tmdb";
// =====================
// MOVIES
// =====================

export async function getMovieDetails(id: number) {
  const res = await fetch(`${BASE_URL}/movie/${id}`);
  return res.json();
}

// =====================
// TV SHOWS 
// =====================

export async function getTVShowDetails(id: number) {
  const res = await fetch(`${BASE_URL}/tv/${id}`);
  return res.json();
}

// =====================
// SEARCH
// =====================

export async function searchMovies(query: string) {
  const res = await fetch(
    `${BASE_URL}/search?q=${encodeURIComponent(query)}`
  );
  return res.json();
}

// =====================
// RECOMMENDATIONS
// =====================

export async function getRecommendations(id: number, mediaType: "movie" | "tv" = "movie") {
  try {
    const res = await fetch(`${BASE_URL}/${mediaType}/${id}/recommendations`);
    if (!res.ok) throw new Error(`Failed to fetch recommendations for ${mediaType}`);
    return res.json();
  } catch (error) {
    console.error("Error in getRecommendations:", error);
    return { results: [] };
  }
}

// =====================
// PLATFORM AVAILABILITY
// =====================

export const fetchPlatforms = async (
  movieId: number,
  idToken: string,
  mediaType: 'movie' | 'tv'
): Promise<string[]> => {
  try {
    const response = await fetch(`${BASE_URL}/watch-providers/${mediaType}/${movieId}`, {
      headers: { Authorization: `Bearer ${idToken}` }
    });
    if (!response.ok) return [];
    const data = await response.json();

    const extract = (arr: TMDBProvider[] | undefined) => (arr || []).map((p: TMDBProvider) => p.provider_name)
    .filter((name: unknown): name is string => typeof name === 'string' && name.length > 0);
    const flatrate = extract(data.flatrate);
    const rent = extract(data.rent);
    const buy = extract(data.buy);
    const ads = extract(data.ads);

    return [...new Set([...flatrate, ...rent, ...buy, ...ads])];
  } catch {
    return [];
  }
};

// =====================
// IMAGE HELPERS 
// =====================

export function getPosterUrl(path: string | null | undefined, size: string = "w500") {
  if (!path) return "";
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

// =====================
// USER FIREBASE SYNC (Inside tmdbService.ts)
// =====================

const FIREBASE_BASE_URL = "https://binge-buddies-orbital-26-1.onrender.com/api/users";

export async function saveUserWatchLog(watchList: { id: number; type: string }[], token: string) {
  const res = await fetch(`${FIREBASE_BASE_URL}/watchlog`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ watchList })
  });
  return res.json();
}

export async function getUserWatchLog(token: string) {
  const res = await fetch(`${FIREBASE_BASE_URL}/watchlog`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  return res.json();
}

//using local base url for now, will change to render url when deployed

export async function saveUserWantToWatchList(wantToWatchList: { id: number; type: string }[], token: string) {
  const res = await fetch(`${FIREBASE_BASE_URL}/wanttowatch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ wantToWatchList })
  });
  return res.json();
}

export async function getUserWantToWatchList(token: string) {
  const res = await fetch(`${FIREBASE_BASE_URL}/wanttowatch`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  return res.json();
}

export async function removeFromUserWantToWatchList(itemId: number, type: "movie" | "tv", token: string) {
  const numericId = Number(itemId);
  const res = await fetch(`${FIREBASE_BASE_URL}/wanttowatch/${numericId}?type=${type}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  return res.json();
}

// =====================
// FIND A BINGE BUDDY
// =====================

export interface BingeBuddyMatch {
  uid: string;
  username: string;
  photoURL: string | null;
  matchCount: number;
  commonItems: { id: number; type: "movie" | "tv" }[];
  contactType: string | null;
  contactValue: string | null;
  topGenre: string | null;
}

// Fetch opted-in users who share want-to-watch titles with the current user.
// `myOptIn` reflects whether the current user has themselves opted in.
export async function getBingeBuddies(
  token: string
): Promise<{ matches: BingeBuddyMatch[]; hasList: boolean; myOptIn: boolean }> {
  const res = await fetch(`${FIREBASE_BASE_URL}/binge-buddies`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  if (!res.ok) return { matches: [], hasList: true, myOptIn: false };
  return res.json();
}

// =====================
// DISCOVER BY GENRES
// =====================
export async function discoverByGenre(
  genreId: number,
  mediaType: "movie" | "tv",
  queryParams: Record<string, string> = {}
): Promise<{ results: TMDBSearchResult[] }> {
  const query = new URLSearchParams({
    with_genres: genreId.toString(),
    ...queryParams,
  }).toString();

  try { 
    const res = await fetch(`${BASE_URL}/discover/${mediaType}?${query}`);
    if (!res.ok) return { results: [] };
    return res.json(); 
  } catch (error) {
    console.error("Error in discoverByGenre:", error);
    return { results: []}
  }
}

// =====================
// FETCHING OF MOVIE/SHOW ID for DISCOVERY
// =====================
export async function getGenres(mediaType: "movie" | "tv" = "movie") {
  try {
    const res = await fetch(`${BASE_URL}/genre/${mediaType}/list`);
    if (!res.ok) throw new Error(`Failed to fetch ${mediaType} genres`);

    const data = await res.json();
    return data.genres || [];
  } catch (error) {
    console.error(`Error in getGenres for ${mediaType}:`, error);
    return [];
  }
}
