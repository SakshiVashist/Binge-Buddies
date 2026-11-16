// Shared TMDB-shaped data types used across the app.

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBProvider {
  provider_name: string;
}

// A raw item returned by the TMDB search / discover / genre endpoints.
export interface TMDBSearchResult {
  id: number;
  media_type?: "movie" | "tv" | "person";
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  genre_ids?: number[];
  genres?: TMDBGenre[];
  userRating?: number;
  notes?: string;
  __custom_media_type?: "movie" | "tv";
}

// An item that has been resolved to a concrete media type, optionally carrying
// platform availability from the watch-providers endpoint.
export interface TmdbItem extends TMDBSearchResult {
  type: "movie" | "tv";
  platforms?: string[];
  platform?: string[];
}
