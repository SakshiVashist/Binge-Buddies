import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase"
import { useEffect, useState } from "react";
import Sidebar from "../components/sidebar";
import MovieCard from "../components/MovieCard";
import { useAuth } from "../context/AuthContext";
import {
  getMovieDetails,
  getTVShowDetails,
  fetchPlatforms,
  getPosterUrl,
  getUserWatchLog,
  getUserWantToWatchList,
  getGenres,
  discoverByGenre,
  removeFromUserWantToWatchList,
  searchMovies,
  saveUserWantToWatchList
} from "../services/tmdbService";
import { filteringProcess } from "../utils/filteringProcess";
import { mapRecommendationToCard } from "../utils/mapRecommendationToCard";
import type { TMDBSearchResult, TMDBGenre } from "../types/tmdb";
import "../styles/HomePage.css";
import { handleAddToWantToWatch } from "../utils/handleAddToWantToWatch";

interface MovieCardData {
  id: number;
  type: "movie" | "tv"
  title: string;
  genres: string[];
  synopsis: string;
  image: string;
  rating: number;
  platform: string[];
}

interface LogItem {
  id: number;
  type: "movie" | "tv";
  notes?: string;
  userRating?: number;
}

const languageCodeMap: Record<string, string> = {
  English: "en",
  Korean: "ko",
  Japanese: "ja",
  Mandarin: "zh",
  Spanish: "es",
  French: "fr",
  Hindi: "hi",
  Thai: "th",
  German: "de",
};

// Map onboarding/profile string text to standard TMDB API return naming conventions
const uiToTmdbGenreMap: Record<string, string> = {
  "sci-fi": "science fiction",
  "tv movie": "tv movie",
  "action & adventure": "action & adventure",
  "sci-fi & fantasy": "sci-fi & fantasy",
  "war & politics": "war & politics"
};

const parsePreferenceArray = (key: string): string[] => {
  const raw = sessionStorage.getItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const determinePreferredMediaType = (
  categories: string[],
  movieGenres: string[],
  tvGenres: string[],
  watchTypeCounts: { movie: number; tv: number }
): "movie" | "tv" => {
  const hasTvCategory = categories.some((category) =>
    ["TV Shows", "K-Dramas", "Anime", "Mini Series"].includes(category)
  );
  const hasMovieCategory = categories.includes("Movies");

  if (hasTvCategory && !hasMovieCategory) return "tv";
  if (hasMovieCategory && !hasTvCategory) return "movie";

  // tie breaker using watch history
  if (watchTypeCounts.movie > watchTypeCounts.tv) return "movie";
  if (watchTypeCounts.tv > watchTypeCounts.movie) return "tv";
  // neither is selected compare against genre counts 
  if (movieGenres.length > tvGenres.length) return "movie";
  if (tvGenres.length > movieGenres.length) return "tv";
  return "tv";
};

const chooseDiscoverGenreId = (
  topGenre: string,
  preferredGenresForType: string[], // pass only genres for the chosen media type here
  genreNameToId: Record<string, number>
): number | null => {
  // 1. Evaluate explicit historical top genre first
  if (topGenre && topGenre.toLowerCase() !== "none") {
    const topGenreClean = topGenre.toLowerCase();
    const topGenreId = genreNameToId[uiToTmdbGenreMap[topGenreClean] || topGenreClean];
    if (topGenreId) return topGenreId;

  }

  // 2. Fall back to looping through onboarding preference choices safely
  for (const genreName of preferredGenresForType) {
    const cleanName = genreName.toLowerCase();
    const tmdbName = uiToTmdbGenreMap[cleanName] || cleanName;
    const id = genreNameToId[tmdbName];
    if (id) return id;
  }

  // 3. Absolute Fallback Strategy: If string matching fails completely, pick the first valid TMDB ID
  const fallbackIds = Object.values(genreNameToId);
  if (fallbackIds.length > 0) return fallbackIds[0];

  return null;
};

const HomePage = () => {
  const { username, user, streak, getIdToken } = useAuth();

  const [watchAgainShow, setWatchAgainShow] = useState<MovieCardData | null>(null);
  const [topRecommendationShow, setTopRecommendationShow] = useState<MovieCardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [wantToWatchList, setWantToWatchList] = useState<MovieCardData[]>([]);

  // Raw {id,type} want-to-watch list (what gets persisted) + manual-add search UI
  const [rawWantToWatch, setRawWantToWatch] = useState<{ id: number; type: "movie" | "tv" }[]>([]);
  const [showAddSearch, setShowAddSearch] = useState<boolean>(false);
  const [addQuery, setAddQuery] = useState<string>("");
  const [addResults, setAddResults] = useState<{ id: number; type: "movie" | "tv"; title: string; year: string; poster: string | null }[]>([]);
  const [addSearching, setAddSearching] = useState<boolean>(false);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [topRecErrorState, setTopRecErrorState] = useState<"no-prefs" | "no-availability">("no-prefs");

  const isNewUser = sessionStorage.getItem('isNewUser') === 'true';

  useEffect(() => {
    sessionStorage.removeItem('isNewUser');
  }, []);

  const displayName = username || user?.displayName || user?.email?.split("@")[0] || "Binger";

  useEffect(() => {
    let active = true;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        if (!user) return;

        const idToken = await user.getIdToken();
        if (!idToken || !active) return;

        // 1. Fetch Shared Prerequisites (Genres & Logs)
        const [movieGenreRes, tvGenreRes, logData, wantToWatchData, userDocSnap] = await Promise.all([
          getGenres("movie"),
          getGenres("tv"),
          getUserWatchLog(idToken),
          getUserWantToWatchList(idToken),
          getDoc(doc(db, "users", user.uid))
        ]);

        if (!active) return;

        const genreMap: Record<number, string> = {};


        const movieGenreNameToId: Record<string, number> = {};
        const tvGenreNameToId: Record<string, number> = {};
        movieGenreRes.forEach((g: TMDBGenre) => {
          genreMap[g.id] = g.name;
          movieGenreNameToId[g.name.toLowerCase()] = g.id;
        });
        tvGenreRes.forEach((g: TMDBGenre) => {
          genreMap[g.id] = g.name;
          tvGenreNameToId[g.name.toLowerCase()] = g.id;
        });

        const watchList = logData?.watchList || [];
        const watchedIds = new Set<number>(watchList.map((item: LogItem) => item.id));
        // wil use unique keys to carry out filtering
        const watchedKeys = new Set(watchList.map((item: LogItem) => `${item.type}-${item.id}`));

        // =========================================================================
        // WANT TO WATCH LOGIC
        // =========================================================================
        const rawWantToWatchList = wantToWatchData?.wantToWatchList || [];
        const wantToWatchKeys = new Set<string>(rawWantToWatchList.map((item: LogItem): string => `${item.type}-${item.id}`));
        // identify items that are in the want to watch list but have already been watched
        const watchedItemsInWantToWatch = rawWantToWatchList.filter((item: LogItem) => watchedKeys.has(`${item.type}-${item.id}`));
        // remove those items from firebase
        if (watchedItemsInWantToWatch.length > 0) {
          Promise.all(
            watchedItemsInWantToWatch.map((item: LogItem) => {
              try {
                return removeFromUserWantToWatchList(item.id, item.type, idToken);
              } catch (error) {
                console.error(`Error removing item ID ${item.id} from Want to Watch list:`, error);
                return null;
              }
            }
            )
          );
        }
        // now we filter the want to watch list to only include items that haven't been watched yet
        const filteredWantToWatchList = rawWantToWatchList.filter((item: LogItem) => !watchedKeys.has(`${item.type}-${item.id}`));
        const watchlistDetailsPromises = filteredWantToWatchList.map(async (item: LogItem) => {
          try {
            const detailsPrmoise = item.type === "tv"
              ? getTVShowDetails(item.id)
              : getMovieDetails(item.id);
            const [mediaDetail, platforms] = await Promise.all([
              detailsPrmoise,
              fetchPlatforms(item.id, idToken, item.type),
            ]);
            return {
              id: item.id,
              type: item.type,
              title: mediaDetail?.title || mediaDetail?.name || "Unknown Title",
              genres: mediaDetail?.genres ? mediaDetail.genres.map((g: TMDBGenre) => g.name) : [],
              synopsis: mediaDetail?.overview || "No synopsis available.",
              image: getPosterUrl(mediaDetail?.poster_path, "w500"),
              rating: mediaDetail?.vote_average ? parseFloat(mediaDetail.vote_average.toFixed(1)) : 0,
              platform: platforms || [],
            };
          } catch (error) {
            console.error(`Error fetching details for item ID ${item.id}:`, error);
            return null;
          }

        });
        const finalWantToWatchList = (await Promise.all(watchlistDetailsPromises)).filter((item): item is MovieCardData => item !== null);
        if (active) {
          setWantToWatchList(finalWantToWatchList);
          setRawWantToWatch(
            filteredWantToWatchList.map((item: LogItem) => ({ id: item.id, type: item.type }))
          );
        }


        let finalWatchAgain: MovieCardData | null = null;
        let finalRecommendation: MovieCardData | null = null;

        // =========================================================================
        // WATCH AGAIN LOGIC
        // =========================================================================
        if (watchList.length > 0) {
          const highlyRatedEntries = watchList.filter(
            (item: LogItem) => item.userRating && item.userRating >= 14
          );

          if (highlyRatedEntries.length > 0) {
            const randomPick = highlyRatedEntries[Math.floor(Math.random() * highlyRatedEntries.length)];

            const detailsPromise = randomPick.type === "tv"
              ? getTVShowDetails(randomPick.id)
              : getMovieDetails(randomPick.id);

            const [mediaDetail, platforms] = await Promise.all([
              detailsPromise,
              fetchPlatforms(randomPick.id, idToken, randomPick.type),
            ]);

            if (mediaDetail && active) {
              finalWatchAgain = {
                id: randomPick.id,
                type: randomPick.type,
                title: mediaDetail.title || mediaDetail.name,
                genres: mediaDetail.genres ? mediaDetail.genres.map((g: TMDBGenre) => g.name) : ["Favorite"],
                synopsis: mediaDetail.overview,
                image: getPosterUrl(mediaDetail.poster_path, "w500"),
                rating: parseFloat(mediaDetail.vote_average.toFixed(1)),
                platform: platforms || [],
              };
            }
          }
        }

        // =========================================================================
        // DYNAMIC TOP RECOMMENDATION LOGIC 
        // =========================================================================

        const topGenre = userDocSnap.exists() ? (userDocSnap.data().topGenre || "None") : "None";


        const preferredMovieGenres = parsePreferenceArray("movieGenres");
        const preferredTvGenres = parsePreferenceArray("tvGenres");

        const profileCategories = parsePreferenceArray("categories");
        const profileLanguages = parsePreferenceArray("languages");

        const preferredLanguageCode = profileLanguages.length
          ? languageCodeMap[profileLanguages[0]] || null
          : null;

        const watchTypeCounts = watchList.reduce(
          (acc: { movie: number; tv: number }, item: LogItem) => {
            if (item.type === "tv") acc.tv += 1;
            if (item.type === "movie") acc.movie += 1;
            return acc;
          },
          { movie: 0, tv: 0 }
        );

        const preferredMediaType = determinePreferredMediaType(profileCategories, preferredMovieGenres, preferredTvGenres, watchTypeCounts);


        const relevantGenreNameToId = preferredMediaType === "tv" ? tvGenreNameToId : movieGenreNameToId;
        const targetProfileGenres = preferredMediaType === "tv" ? preferredTvGenres : preferredMovieGenres
        const discoverGenreId = chooseDiscoverGenreId(topGenre, targetProfileGenres, relevantGenreNameToId);

        if (discoverGenreId) {
          const discoverParams: Record<string, string> = {};
          if (preferredLanguageCode) {
            discoverParams.with_original_language = preferredLanguageCode;
          }

          const discoverData = await discoverByGenre(discoverGenreId, preferredMediaType, discoverParams);


          const discoverItems = (discoverData.results || []).map((item: TMDBSearchResult) => ({
            ...item,
            type: preferredMediaType,
          }));

          const recResults = await filteringProcess(discoverItems, idToken, watchedIds, wantToWatchKeys);



          const shuffledDiscover = recResults.sort(() => Math.random() - 0.5);

          if (shuffledDiscover.length > 0) {
            const targetItem = shuffledDiscover[0];
            const cardData = mapRecommendationToCard(targetItem, genreMap);
            finalRecommendation = {
              ...cardData,
              platform: targetItem.platforms || [],
            };
          } else {
            if (active) setTopRecErrorState("no-availability");
          }
        } else {
          if (active) setTopRecErrorState("no-prefs");
        }

        // =========================================================================
        // ATOMIC STATE UPDATES
        // =========================================================================
        if (active) {
          setWatchAgainShow(finalWatchAgain);
          setTopRecommendationShow(finalRecommendation);
          setLoading(false);
        }

      } catch (error) {
        console.error("Error setting up homepage dashboard cards:", error);
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      active = false;
    };
  }, [user]);

  // Debounced search for the manual "Add to Want to Watch" box
  useEffect(() => {
    if (!addQuery.trim()) {
      setAddResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setAddSearching(true);
      try {
        const data = await searchMovies(addQuery);
        const mapped = (data.results || [])
          .filter((item: TMDBSearchResult) => item.media_type !== "person")
          .map((item: TMDBSearchResult) => {
            const mediaType: "movie" | "tv" =
              item.media_type === "tv" || item.first_air_date ? "tv" : "movie";
            const date = item.release_date || item.first_air_date || "";
            return {
              id: item.id,
              type: mediaType,
              title: item.title || item.name || "Untitled",
              year: date ? date.split("-")[0] : "",
              poster: item.poster_path ? getPosterUrl(item.poster_path) : null,
            };
          })
          .slice(0, 6);
        setAddResults(mapped);
      } catch (err) {
        console.error("Failed to search titles:", err);
      } finally {
        setAddSearching(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [addQuery]);

  // Add a manually-searched title to the Want to Watch list
  const handleManualAdd = async (item: { id: number; type: "movie" | "tv" }) => {
    // Skip if already in the list
    if (rawWantToWatch.some((e) => e.id === item.id && e.type === item.type)) {
      setAddQuery("");
      setAddResults([]);
      return;
    }
    setAddingId(item.id);
    try {
      const idToken = await getIdToken();
      if (!idToken) return;

      const newRaw = [...rawWantToWatch, { id: item.id, type: item.type }];
      setRawWantToWatch(newRaw);

      // Resolve details so it appears in the list immediately
      const detail =
        item.type === "tv" ? await getTVShowDetails(item.id) : await getMovieDetails(item.id);
      const platforms = await fetchPlatforms(item.id, idToken, item.type);
      const card = {
        id: item.id,
        type: item.type,
        title: detail?.title || detail?.name || "Unknown Title",
        genres: detail?.genres ? detail.genres.map((g: TMDBGenre) => g.name) : [],
        synopsis: detail?.overview || "No synopsis available.",
        image: getPosterUrl(detail?.poster_path, "w500"),
        rating: detail?.vote_average ? parseFloat(detail.vote_average.toFixed(1)) : 0,
        platform: platforms || [],
      };
      setWantToWatchList((prev) => [...prev, card as MovieCardData]);

      await saveUserWantToWatchList(newRaw, idToken);

      // Reset the search UI
      setAddQuery("");
      setAddResults([]);
      setShowAddSearch(false);
    } catch (err) {
      console.error("Failed to add title to Want to Watch:", err);
    } finally {
      setAddingId(null);
    }
  };

  // manual removal of titles from want to watch list

  const handleRemoveFromWantToWatch = async (item: { id: number; type: "movie" | "tv" }) => {
    await handleAddToWantToWatch(item, rawWantToWatch, setRawWantToWatch, getIdToken);
    setWantToWatchList((prev) =>
      prev.filter((card) => !(card.id === item.id && card.type === item.type)));
  };

  return (
    <div className="homepage">
      <Sidebar />

      <main className="main-content">
        {/* HERO SECTION */}
        <section className="hero-section">
          {isNewUser ? (
            <div className="hero-text">
              <h1>Welcome to Binge Buddies, <span>{displayName}</span>!</h1>
              <p>Your personalized binge-watching dashboard is being created!</p>
            </div>
          ) : (
            <div className="hero-text">
              <h1>Welcome back, <span>{displayName}</span></h1>
              <p>You're on a roll! Continue tracking your binge journey and discover your next obsession.</p>
            </div>
          )}

          <div className="streak-card animated-streak">
            <div className="streak-icon">🔥</div>
            <div className="streak-info">
              <span className="streak-label">Binge Streak</span>
              <p className="streak-count">{streak || 1} {streak === 1 ? 'Day' : 'Days'}</p>
            </div>
          </div>
        </section>

        {/* CONTENT GRID */}
        {loading ? (
          <div className="dashboard-cards-container loading state">
            <section className="content-grid">
              <div className="card featured-card">
                <div className="card-header">
                  <h2>Watch Again</h2>
                </div>
                <div className="movie-card-skeleton-rect generic-pulse-animation"></div>
              </div>

              <div className="card top-pick-card">
                <div className="card-header">
                  <h2>Top Recommendation</h2>
                </div>
                <div className="movie-card-skeleton-rect generic-pulse-animation"></div>
              </div>
            </section>
            <div className="card want-to-watch-card loading state">
              <div className="card-header">
                <h2>Want to Watch</h2>
              </div>
              <div className="movie-card-skeleton-rect generic-pulse-animation"></div>
            </div>
          </div>

        ) : (
          <div className="dashboard-cards-container">
            <section className="content-grid">

              {/* COLUMN 1: WATCH AGAIN */}
              <div className="card featured-card">
                <div className="card-header">
                  <h2>Watch Again</h2>
                </div>
                {watchAgainShow ? (
                  <MovieCard
                    variant="featured"
                    title={watchAgainShow.title}
                    genres={watchAgainShow.genres}
                    synopsis={watchAgainShow.synopsis}
                    image={watchAgainShow.image}
                    rating={watchAgainShow.rating}
                    platform={watchAgainShow.platform}
                  />
                ) : (
                  <div className="empty-watch-again-state">
                    <img
                      src="/Big Pop.png"
                      alt="Binge Buddies Mascot"
                      className="placeholder-mascot-img"
                    />
                    <h3>Your Screen is Blank!</h3>
                    <p>
                      Rate titles <strong>7 stars or higher</strong> in your
                      <em> Watch Log</em> to feature your absolute favorites right here.
                    </p>
                  </div>
                )}
              </div>

              {/* COLUMN 2: TOP RECOMMENDATION */}
              <div className="card top-pick-card">
                <div className="card-header">
                  <h2>Top Recommendation</h2>
                </div>
                {topRecommendationShow ? (
                  <MovieCard
                    variant="compact"
                    title={topRecommendationShow.title}
                    genres={topRecommendationShow.genres}
                    synopsis={topRecommendationShow.synopsis}
                    image={topRecommendationShow.image}
                    rating={topRecommendationShow.rating}
                    platform={topRecommendationShow.platform}
                  />
                ) : (
                  <div className="empty-recommendation-state">
                    <img
                      src="/Baby Pop.png"
                      alt="Binge Buddies Mascot"
                      className="placeholder-mascot-img"
                    />
                    {topRecErrorState === "no-availability" ? (
                      <>
                        <h3>No Titles Available</h3>
                        <p>We could not find any available titles streaming in SG based on your preferences right now.
                        </p>
                      </>
                    ) : (

                      <>
                        <h3>Looking for More?</h3>
                        <p>
                          Log and rate titles in your <em>Watch Log</em> to help us map your unique taste to curated top picks!
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* COLUMN 3: WANT TO WATCH LIST */}
            <div className="card want-to-watch-card">
              <div className="card-header">
                <h2>Want to Watch</h2>
                <button
                  className="wtw-add-btn"
                  onClick={() => setShowAddSearch((v) => !v)}
                  title={showAddSearch ? "Close" : "Add a title"}
                  aria-label={showAddSearch ? "Close add search" : "Add a title"}
                >
                  {showAddSearch ? "×" : "+"}
                </button>
              </div>

              {showAddSearch && (
                <div className="wtw-add-search">
                  <input
                    className="wtw-add-input"
                    placeholder="Search for a movie or TV show..."
                    value={addQuery}
                    onChange={(e) => setAddQuery(e.target.value)}
                    autoFocus
                  />
                  {addSearching && <p className="wtw-search-status">Searching...</p>}
                  {!addSearching && addQuery.trim() && addResults.length === 0 && (
                    <p className="wtw-search-status">No titles found.</p>
                  )}
                  {addResults.length > 0 && (
                    <ul className="wtw-dropdown">
                      {addResults.map((r) => {
                        const already = rawWantToWatch.some(
                          (e) => e.id === r.id && e.type === r.type
                        );
                        return (
                          <li
                            key={`${r.type}-${r.id}`}
                            className={`wtw-dropdown-item ${already ? "is-added" : ""}`}
                            onClick={() => !already && addingId === null && handleManualAdd(r)}
                          >
                            {r.poster ? (
                              <img src={r.poster} alt={r.title} className="wtw-thumb" />
                            ) : (
                              <div className="wtw-thumb wtw-thumb-fallback">🎬</div>
                            )}
                            <div className="wtw-dropdown-text">
                              <span className="wtw-dropdown-title">{r.title}</span>
                              <span className="wtw-dropdown-meta">
                                {r.type === "tv" ? "TV Show" : "Movie"}
                                {r.year ? ` · ${r.year}` : ""}
                              </span>
                            </div>
                            <span className="wtw-add-hint">
                              {addingId === r.id ? "Adding..." : already ? "Added" : "+ Add"}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}

              {wantToWatchList.length > 0 ? (
                <div className="want-to-watch-list">
                  {wantToWatchList.map((item, index) => (
                    <div key={index} className="want-to-watch-mini-card">
                      <img src={item.image} alt={`${item.title} Poster`} className="mini-row-poster" />
                      <div className="mini-row-info">
                        <h4 className="mini-row-title">{item.title}</h4>
                      </div>
                      <button
                        className="wtw-remove-button"
                        onClick={() => handleRemoveFromWantToWatch({ id: item.id, type: item.type })}
                        title="Remove from Want To Watch"
                        aria-label="Remove from Want to Watch"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>

              ) : (
                <div className="empty-want-to-watch-state">
                  <img
                    src="/Big Pop.png"
                    alt="Binge Buddies Mascot"
                    className="placeholder-mascot-img"
                  />
                  <h3>Your Want to Watch List is Empty!</h3>
                  <p>
                    Add titles to your list from <em>Recommendations</em> to plan your future binge sessions.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="mobile-bottom-spacer" />

      </main>
    </div>
  );
};

export default HomePage;