import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/sidebar";
import MovieCard from "../components/MovieCard";
import "../styles/RecommendationsPage.css";

import {
  discoverByGenre,
  getUserWatchLog,
  getMovieDetails,
  getTVShowDetails,
  getRecommendations,
  getUserWantToWatchList,
} from "../services/tmdbService";
import { handleAddToWantToWatch } from "../utils/handleAddToWantToWatch";
import { mapRecommendationToCard } from "../utils/mapRecommendationToCard";

import { useAuth } from "../context/AuthContext";
import { getActiveGenre } from "../utils/getActiveGenre";
import { getSeedItem } from "../utils/getSeedItem";
import { filteringProcess } from "../utils/filteringProcess";
import { useGenreMap } from "../utils/useGenreMap";
import type { TMDBSearchResult } from "../types/tmdb";

interface WatchLogEntry {
  id: number;
  type: "movie" | "tv";
  userRating?: number;
}


interface RecommendationItem {
  category: "log-recommendations" | "genre-discovery" | "show-recommendations"
  type: "movie" | "tv";
  reason: string;
  context: string;
  icon: string;
  movie: {
    id: number;
    title: string;
    genres: string[];
    synopsis: string;
    image: string;
    rating: number;
    platform: string[];
  };
}
const uiToTmdbGenreMap: Record<string, string> = {
  "sci-fi": "science fiction",
  "tv movie": "tv movie",
  "action & adventure": "action & adventure",
  "sci-fi & fantasy": "sci-fi & fantasy",
  "war & politics": "war"
};

const resolveGenreId = (
  genreName: string,
  genreNameToId: Record<string, number>
): number | null => {
  const clean = genreName.toLowerCase();
  const tmdbName = uiToTmdbGenreMap[clean] || clean;
  return genreNameToId[tmdbName] || genreNameToId[clean] || null;
};

// Rotating status lines shown while recommendations are loading
const LOADING_MESSAGES = [
  "Scanning your watch history...",
  "Hunting for hidden gems...",
  "Matching your taste profile...",
  "Checking what's available in SG...",
  "Curating your next obsession...",
];

const RecommendationsPage = () => {
  const { user, getIdToken } = useAuth();
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const hasFetched = useRef(false);
  const { genreMap, genreNameToId, isGenreLoading } = useGenreMap();
  const [wantToWatchList, setWantToWatchList] = useState<{ id: number; type: "movie" | "tv" }[]>([]);

  // Cycle through the loading messages while data is being fetched
  useEffect(() => {
    if (!isDataLoading) return;
    const id = setInterval(() => {
      setLoadingMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 1800);
    return () => clearInterval(id);
  }, [isDataLoading]);

  useEffect(() => {

    if (isGenreLoading) return; // Wait for genre map to load before proceeding

    const loadRecommendations = async () => {
      if (hasFetched.current) return;
      hasFetched.current = true;

      try {
        setIsDataLoading(true);

        const idToken = await getIdToken();
        if (!idToken || !user) {
          setIsDataLoading(false);
          return;
        }

        const userDocSnap = await getDoc(doc(db, "users", user.uid));
        const topGenre = userDocSnap.exists() ? (userDocSnap.data().topGenre || "None") : "None";

        // We only ever display one card per section, so we don't need to check
        // platform availability for every candidate — a small shuffled pool is
        // plenty and keeps the number of network calls low.
        const CANDIDATE_POOL = 12;

        // fetch want to watch list
        const [logData, wantToWatchData] = await Promise.all([
          getUserWatchLog(idToken),
          getUserWantToWatchList(idToken)
        ]);


        // Fetch the watch log once — both sections depend on it
        
        const watchList = logData?.watchList || [];
        const watchedIds = new Set<number>(watchList.map((item: WatchLogEntry) => item.id));
        const wantToWatchRaw = wantToWatchData?.wantToWatchList || [];
        const wantToWatchKeys = new Set<string>(wantToWatchRaw.map((item: WatchLogEntry) => `${item.type}-${item.id}`));

        // ---- Section 1: "Based On Your Love For X" ----
        const buildShowCards = async (): Promise<RecommendationItem[]> => {
          if (watchList.length === 0) {
            return [{
              category: "show-recommendations",
              type: "movie",
              reason: "Based On Your Love For:",
              context: "No Watch Logs Found",
              icon: "🍿",
              movie: { id: 0, title: "", genres: [], synopsis: "", image: "", rating: 0, platform: [] },
            }];
          }

          const detailedLogs = await Promise.all(
            watchList.map(async (item: WatchLogEntry) => {
              const detail = item.type === "tv" ? await getTVShowDetails(item.id) : await getMovieDetails(item.id);
              return detail ? { ...detail, __custom_media_type: item.type, userRating: item.userRating || 0 } : null;
            })
          );
          const validLogs = detailedLogs.filter(Boolean);
          const seedItem = getSeedItem(validLogs, topGenre);
          if (!seedItem) return [];

          const seedTitle = seedItem.title || seedItem.name;
          const seedMediaType: "movie" | "tv" = seedItem.__custom_media_type ?? seedItem.type;
          const recommendationsData = await getRecommendations(seedItem.id, seedMediaType);

          // shuffle first, then cap before the (expensive) availability check
          const candidates = (recommendationsData.results || [])
            .map((item: TMDBSearchResult) => ({ ...item, type: seedMediaType }))
            .sort(() => Math.random() - 0.5)
            .slice(0, CANDIDATE_POOL);

          const recResults = await filteringProcess(candidates, idToken, watchedIds, wantToWatchKeys);

          if (recResults.length === 0) {
            return [{
              category: "show-recommendations" as const,
              type: seedMediaType,
              reason: "Based On Your Love For:",
              context: "No Available Titles Found",
              icon: "🍿",
              movie: { id: 0, title: "", genres: [], synopsis: "", image: "", rating: 0, platform: [] },
            }];
          }

          return recResults.slice(0, 1).map((item) => ({
            category: "show-recommendations" as const,
            type: seedMediaType,
            reason: "Based On Your Love For:",
            context: seedTitle || "",
            icon: seedMediaType === "tv" ? "TV SHOW" : "MOVIE",
            movie: mapRecommendationToCard(item, genreMap),
          }));
        };

        // ---- Section 2: "Discovering A New Obsession" ----
        const buildGenreCards = async (): Promise<RecommendationItem[]> => {
          const movieGenresRaw = sessionStorage.getItem("movieGenres");
          const tvGenresRaw = sessionStorage.getItem("tvGenres");
          const movieGenresParsed = movieGenresRaw ? JSON.parse(movieGenresRaw) : [];
          const onboardingGenres = movieGenresParsed.length > 0 ? movieGenresRaw : tvGenresRaw;
          const activeGenre = getActiveGenre(topGenre, onboardingGenres);
          const genreId = resolveGenreId(activeGenre, genreNameToId);


          if (!genreId) {
            return [{
              category: "genre-discovery",
              type: "movie",
              reason: "Discovering A New Obsession",
              context: "No Top Genres Found",
              icon: "🍿",
              movie: { id: 0, title: "", genres: [], synopsis: "", image: "", rating: 0, platform: [] },
            }];
          }

          const [movieData, tvData] = await Promise.all([
            discoverByGenre(genreId, "movie"),
            discoverByGenre(genreId, "tv"),
          ]);

          const candidates = [
            ...(movieData.results || []).map((item) => ({ ...item, type: "movie" as const })),
            ...(tvData.results || []).map((item) => ({ ...item, type: "tv" as const })),
          ]
            .sort(() => Math.random() - 0.5)
            .slice(0, CANDIDATE_POOL);

          const recResultsForGenre = await filteringProcess(candidates, idToken, watchedIds, wantToWatchKeys);
          if (recResultsForGenre.length === 0) {
            return [{
              category: "genre-discovery" as const,
              type: "movie",
              reason: "Discovering a new obsession in:",
              context: `${activeGenre}: No Available Titles Found`,
              icon: "🍿",
              movie: { id: 0, title: "", genres: [], synopsis: "", image: "", rating: 0, platform: [] },
            }];
          }



          return recResultsForGenre.slice(0, 1).map((item) => ({
            category: "genre-discovery" as const,
            type: item.type,
            reason: "Discovering a new obsession in:",
            context: activeGenre,
            icon: item.type === "tv" ? "TV SHOW" : "MOVIE",
            movie: mapRecommendationToCard(item, genreMap),
          }));
        };

        // Run both sections concurrently instead of one after the other
        const [showCards, genreCards] = await Promise.all([
          buildShowCards(),
          buildGenreCards(),
        ]);

        setRecommendations([...showCards, ...genreCards]);
      } catch (error) {
        console.error("Error loading recommendations:", error);
      } finally {
        setIsDataLoading(false);
      }
    };

    loadRecommendations();
  }, [isGenreLoading, getIdToken, genreMap, genreNameToId, user]
  );

  // we will now work on the new feature of saving your recommended titles to your want to watch list
  useEffect(() => {
    const loadWantToWatchList = async () => {
      const idToken = await getIdToken();
      if (!idToken) return;

      const wantToWatchData = await getUserWantToWatchList(idToken);
      setWantToWatchList(wantToWatchData?.wantToWatchList || []);
    };

    loadWantToWatchList();
  }, [getIdToken]);



  return (
    <div className="recs-page">
      <Sidebar />

      <main className="recs-main">
        <section className="hero-section">
          <div className="hero-text">
            <h1>Your Next Obsession</h1>
            <p>Personalized recommendations based on your unique watch journey and taste profile.</p>
          </div>
        </section>
        {isDataLoading ? (
          <div className="loading-state">
            <div className="loading-mascot-wrap">
              <span className="loading-pulse-ring" />
              <img
                src="Baby Pop.png"
                alt="Binge Buddies mascot"
                className="loading-state-icon"
              />
            </div>
            <p className="loading-message" key={loadingMsgIndex}>
              {LOADING_MESSAGES[loadingMsgIndex]}
            </p>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="recs-grid-container">
            {recommendations.map((item, index) => (
              <div className="recs-wrapper-card" key={index}>
                <div className="recs-reason-header">
                  <div className="reason-text-block">
                    <span className="reason-label">{item.reason}</span>
                    <h4 className="context-title">{item.context}</h4>
                  </div>
                  <span className="media-badge">{item.icon}</span>
                </div>


                <div className="recs-card-body">
                  {item.movie.title === "" ? (
                    <div className="empty-rec-card">
                      <img src={item.category === "show-recommendations" ? "/Big Pop.png" : "/Baby Pop.png"} alt="Binge Buddies Mascot" className="placeholder-mascot-img" />
                      {item.category === "show-recommendations" ? (
                        item.context === "No Watch Logs Found" ? (
                          <>
                            <h3>Your Watch Log is Empty!</h3>
                            <p>
                              Add titles to your <em>Watch Log</em> to get personalised recommendations here.
                            </p>
                          </>

                        ) : (
                          <>
                            <h3>No Ttiles Available</h3>
                            <p>
                              We could not find available titles streaming in SG based on your top genre right now.
                            </p>
                          </>
                        )
                      ) : (
                        item.context === "No Top Genres Found" ? (
                          <>
                            <h3>No Genre Preference Found!</h3>
                            <p>We need at least one genre preference from you. Head over to your <em>Profile</em> to update your top genre!</p>
                          </>
                        ) : (
                          <>
                            <h3>No Titles Available</h3>
                            <p>
                              We could not find any available titles streaming in SG for <strong>{item.context.split(":")[0]}</strong>.
                            </p>
                          </>
                        )
                      )}
                    </div>

                  ) : (
                    <MovieCard
                      variant="compact"
                      title={item.movie.title}
                      genres={item.movie.genres}
                      synopsis={item.movie.synopsis}
                      image={item.movie.image}
                      rating={item.movie.rating}
                      platform={item.movie.platform}
                    />
                  )}
                </div>
                {
                  item.movie.title !== "" && (
                    <button
                      className={`add-to-watchlist-button ${wantToWatchList.some(entry => entry.id === item.movie.id && entry.type === item.type) ? 'added' : ''}`}
                      onClick={() => handleAddToWantToWatch(
                        { id: item.movie.id, type: item.type },
                        wantToWatchList,
                        setWantToWatchList,
                        getIdToken
                      )
                      }
                      title="Add to Want to Watch List"
                    >
                      {wantToWatchList.some(entry => entry.id === item.movie.id && entry.type === item.type) ? 'Remove from Want to Watch' : 'Add to Want to Watch'}
                    </button>
                  )
                }
              </div>

            ))}
          </div>
        ) : (
          <div className="empty-results-fallback">
            <p>No matching recommendations found.</p>
          </div>
        )
        }
        <div className="mobile-bottom-spacer" />
      </main >
    </div >

  );
};


export default RecommendationsPage;

