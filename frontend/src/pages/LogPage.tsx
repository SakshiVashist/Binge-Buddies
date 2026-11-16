import { useEffect, useState } from "react";
import Sidebar from "../components/sidebar";
import MovieCard from "../components/MovieCard";
import "../styles/LogPage.css";

import { 
  getMovieDetails, 
  getTVShowDetails, 
  getPosterUrl, 
  searchMovies,
  getUserWatchLog,
  saveUserWatchLog, 
  fetchPlatforms,
} from "../services/tmdbService";
import {getTopGenre} from "../utils/getTopGenre"
import { mapToCard } from "../utils/mapToCard";
import type { TmdbItem, TMDBSearchResult, TMDBGenre } from "../types/tmdb";

import { useAuth } from "../context/AuthContext";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

interface LogItem {
  id: number;
  type: "movie" | "tv";
  notes?: string; 
  userRating?: number; 
}

export default function LogPage() {
  const { user, getIdToken, loading: authLoading } = useAuth(); 

  const [watchList, setWatchList] = useState<LogItem[]>([]);
  const [movies, setMovies] = useState<TmdbItem[]>([]);
  
  const [isDataLoading, setIsDataLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TMDBSearchResult[]>([]);

  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [currentNote, setCurrentNote] = useState("");
  const [currentUserRating, setCurrentUserRating] = useState<number>(0); 
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // TEXT INPUT FILTERING STATE
  const [filterSearchQuery, setFilterSearchQuery] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");

  // =========================================================================
  // UNIFIED ASYNC DATA PIPELINE
  // =========================================================================
  useEffect(() => {
    async function loadFullWatchLog() {
      if (!user) return; 
      
      try {
        setIsDataLoading(true); 
        
        const token = await getIdToken();
        if (!token) {
          setIsDataLoading(false);
          return;
        }

        const data = await getUserWatchLog(token);
        
        if (data && data.watchList && data.watchList.length > 0) {
          setWatchList(data.watchList);

          const results = await Promise.all(
            data.watchList.map(async (item: LogItem) => {
              const detailsPromise = item.type === "tv"
                ? getTVShowDetails(item.id)
                : getMovieDetails(item.id);

              const [mediaDetail, platforms] = await Promise.all([
                detailsPromise,
                fetchPlatforms(item.id, token, item.type),
              ]);

              if (!mediaDetail) return null;

              return { 
                ...mediaDetail, 
                platforms: platforms || [],
                __custom_media_type: item.type,
                notes: item.notes || "",
                userRating: item.userRating || 0 
              };
            })
          );
          
          setMovies(results.filter((media) => media));
        } else {
          setWatchList([]);
          setMovies([]);
        }
      } catch (err) {
        console.error("Failed to compile dashboard pipeline profiles:", err);
      } finally {
        setIsDataLoading(false); 
      }
    }
    
    loadFullWatchLog();
  }, [user, getIdToken]);

  // Persist the user's top genre to Firestore so it can be shown on their
  // Find a Binge Buddy card. Runs once the watch log has finished loading.
  useEffect(() => {
    if (!user?.uid || isDataLoading ) return;
    const tg = movies.length > 0 ? (getTopGenre(movies) || "None") :"None";

    // Always update Firestore with the latest calculated topGenre
    setDoc(doc(db, "users", user.uid), { topGenre: tg }, { merge: true }).catch(
      (err) => console.error("Failed to persist top genre:", err)
    );
  }, [movies, isDataLoading, user]);

  // SEARCH DEBOUNCE LOGIC FOR DIALOG WINDOW LOOKUP
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const data = await searchMovies(searchQuery);
        const parsedResults = Array.isArray(data) ? data : data.results || [];
        
        const mediaOnly = parsedResults.filter(
          (item: TMDBSearchResult) => item.media_type === "movie" || item.media_type === "tv"
        );

        setSearchResults(mediaOnly);
      } catch (err) {
        console.error("Error fetching proxy search data:", err);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleAddNewLog = () => {
    setIsModalOpen(true);
  };

  const handleAddMedia = async (mediaId: number, type: "movie" | "tv") => {
    if (watchList.some((item) => item.id === mediaId)) {
      alert("This title is already logged in your list dashboard profile!");
      return;
    }

    const updatedList: LogItem[] = [{ id: mediaId, type, notes: "", userRating: 0 }, ...watchList];

    setWatchList(updatedList);
    setIsModalOpen(false);
    setSearchQuery("");
    setSearchResults([]);

    try {
      const token = await getIdToken();
      if (token) {
        await saveUserWatchLog(updatedList, token);
        
        const detailsPromise = type === "tv" ? getTVShowDetails(mediaId) : getMovieDetails(mediaId);
        
        const [mediaDetail, platforms] = await Promise.all([
          detailsPromise,
          fetchPlatforms(mediaId, token, type)
        ]);

        if (mediaDetail) {
          const newMediaObj = {
            ...mediaDetail,
            platforms: platforms || [],
            __custom_media_type: type,
            notes: "",
            userRating: 0
          };
          setMovies(prev => [newMediaObj, ...prev]);
        }
      }
    } catch (err) {
      console.error("Background data synchronizer failed to commit update write:", err);
    }
  };

  const handleOpenDetails = (movie: TmdbItem) => {
    setSelectedMovieId(movie.id);
    setCurrentNote(movie.notes || "");
    setCurrentUserRating(movie.userRating || 0);
  };

  const handleSaveNote = async () => {
    if (selectedMovieId === null) return;
    
    setIsSavingNote(true);
    const updatedWatchList = watchList.map((item) => 
      item.id === selectedMovieId ? { ...item, notes: currentNote, userRating: currentUserRating } : item
    );

    setWatchList(updatedWatchList);
    setMovies(prevMovies => 
      prevMovies.map((m) => m.id === selectedMovieId ? { ...m, notes: currentNote, userRating: currentUserRating } : m)
    );

    try {
      const token = await getIdToken();
      if (token) {
        await saveUserWatchLog(updatedWatchList, token);
      }
      setSelectedMovieId(null); 
    } catch (err) {
      console.error("Failed to commit user notes update:", err);
      alert("Could not save your review log data. Try again!");
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleRemoveMedia = async () => {
    if (selectedMovieId === null) return;
    
    const confirmRemoval = window.confirm("Are you sure you want to remove this title from your watch log?");
    if (!confirmRemoval) return;

    setIsRemoving(true);
    const updatedWatchList = watchList.filter((item) => item.id !== selectedMovieId);

    try {
      const token = await getIdToken();
      if (token) {
        await saveUserWatchLog(updatedWatchList, token);
      }
      
      setWatchList(updatedWatchList);
      setMovies(prevMovies => prevMovies.filter((m) => m.id !== selectedMovieId));
      setSelectedMovieId(null);
    } catch (err) {
      console.error("Failed to delete log item:", err);
      alert("Could not remove the item. Please try again.");
    } finally {
      setIsRemoving(false);
    }
  };

  if (authLoading) {
    return <div className="loading-container">Loading your Binge Buddies profile...</div>;
  }

  if (!user) {
    return <div className="auth-error-container">Please sign in to view your watch log.</div>;
  }

  // =========================================================================
  // ANALYTICS & DYNAMIC GENRE EXTRACTION
  // =========================================================================
  const totalWatched = movies.length;

  const avgTmdbRating =
    totalWatched > 0
      ? (
          movies.reduce((sum, item) => sum + (item.vote_average || 0), 0) /
          totalWatched
        ).toFixed(1)
      : "0.0";

  const ratedMovies = movies.filter((m) => m.userRating && m.userRating > 0);
  const avgCustomRating =
    ratedMovies.length > 0
      ? (
          ratedMovies.reduce((sum, item) => sum + ((item.userRating || 0) / 2), 0) /
          ratedMovies.length
        ).toFixed(1)
      : "0.0";

  const topGenre = getTopGenre(movies);

  // =========================================================================
  // COMBINED FILTER ENGINE PIPELINE
  // =========================================================================
  const filteredMovies = movies.filter((movie) => {
    if (!movie) return false;
    
    const movieTitle = (movie.title || movie.name || "").toLowerCase();
    const mediaType = movie.__custom_media_type === "movie" ? "movies movie" : "tv shows tv show series";
    const movieGenres = movie.genres?.map((g: TMDBGenre) => g.name.toLowerCase()) || [];
    const moviePlatforms = (movie.platforms || []).filter((p: unknown): p is string => typeof p === 'string').map((p: string) => p.toLowerCase());
    
    const query = appliedSearchQuery.toLowerCase().trim();
    if (query === "") return true;
    
    const keywords = query.split(/[\s,]+/).filter(k => k.trim() !== "");
    
    return keywords.every(keyword => {
      const matchesTitle = movieTitle.includes(keyword);
      const matchesFormatKeyword = mediaType.includes(keyword);
      const matchesGenreKeyword = movieGenres.some((gName: string) => gName.includes(keyword));
      const matchesPlatformKeyword = moviePlatforms.some((pName: string) => pName.includes(keyword));
      
      return matchesTitle || matchesFormatKeyword || matchesGenreKeyword || matchesPlatformKeyword;
    });
  });



  const activeMovieObj = movies.find((m) => m.id === selectedMovieId);

  return (
    <div className="log-page">
      <Sidebar />

      <main className="log-main">
        {/* HERO BANNER */}
        <section className="hero-section">
          <div className="hero-text">
            <h1>My Watch Log</h1>
            <p>Track everything you’ve watched, rated, and loved.</p>
          </div>
          
          <button className="add-log-card-trigger" onClick={handleAddNewLog}>
            <div className="add-log-card-inner">
              <span className="add-log-subtext">ADD ENTRIES</span>
              <span className="add-log-maintext">Add New Log</span>
            </div>
          </button>
        </section>

        {isDataLoading || (watchList.length > 0 && movies.length === 0) ? (
          <>
            <div className="stats-container">
              <div className="stats-row">
                <div className="stat-card-skeleton skeleton"></div>
                <div className="stat-card-skeleton skeleton"></div>
                <div className="stat-card-skeleton skeleton"></div>
                <div className="stat-card-skeleton skeleton"></div>
              </div>
            </div>
            <div className="filter-strip-skeleton skeleton"></div>
            <div className="log-grid-container">
              <div className="movie-card-skeleton skeleton"></div>
              <div className="movie-card-skeleton skeleton"></div>
              <div className="movie-card-skeleton skeleton"></div>
              <div className="movie-card-skeleton skeleton"></div>
              <div className="movie-card-skeleton skeleton"></div>
            </div>
          </>
        ) : (
          <>
            {/* STATS MATRIX VIEWPORT GRID */}
            <div className="stats-container">
              <div className="stats-row">
                <div className="stat-card">
                  <h3>{totalWatched}</h3>
                  <p>Watched</p>
                </div>

                <div className="stat-card">
                  <h3>{avgTmdbRating}</h3>
                  <p>Avg TMDB Rating</p>
                </div>

                <div className="stat-card">
                  <h3>{avgCustomRating}</h3>
                  <p>Avg Custom Rating</p>
                </div>

                <div className="stat-card">
                  <h3 className="highlight-genre">{topGenre}</h3>
                  <p>Top Genre</p>
                </div>
              </div>
            </div>

            {/* FILTER BAR */}
            <div className="filter-navigation-strip">
              <div className="filter-search-wrapper">
                <span className="search-icon">🔍</span>
                <input 
                  type="text" 
                  placeholder="Search for a title, genre, or format..." 
                  className="filter-search-input"
                  value={filterSearchQuery}
                  onChange={(e) => setFilterSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setAppliedSearchQuery(filterSearchQuery);
                  }}
                />
              </div>

              <div className="filter-button-group">
                <button className="apply-filters-btn" onClick={() => setAppliedSearchQuery(filterSearchQuery)}>
                  Apply Filter
                </button>
                {filterSearchQuery !== "" && (
                  <button className="clear-filters-btn" onClick={() => { setFilterSearchQuery(""); setAppliedSearchQuery(""); }}>
                    Remove Filter(s)
                  </button>
                )}
              </div>
            </div>

            {/* WATCH LOG GRID CARD CONTAINER */}
            <div className="log-grid-container">
              {movies.length === 0 ? (
                <div className="empty-log-state">
                  <p>Your watch log is currently empty.</p>
                  <p>Watch something for it to be added here!</p>
                </div>
              ) : filteredMovies.length > 0 ? (
                filteredMovies.map((movie, index) => {
                  if (!movie) return null;
                  const posterImg = getPosterUrl(movie.poster_path);
                  const titleString = movie.title || movie.name || "";

                  return (
                    <div 
                      className="compact-log-item" 
                      key={movie.id || index}
                      onClick={() => handleOpenDetails(movie)}
                    >
                      <div className="compact-poster-wrapper">
                        <img src={posterImg} alt={titleString} className="compact-poster" />
                      </div>
                      <h4 className="compact-title">{titleString}</h4>
                    </div>
                  );
                })
              ) : (
                <div className="empty-log-state">
                  <p>No logged items match this filter category.</p>
                  <p>Try clearing your active filters or change your search query!</p>
                </div>
              )}
            </div>
            <div className="mobile-bottom-spacer" />
          </>
        )}
      </main>

      {/* DETAIL MODAL OVERLAY */}
      {selectedMovieId && activeMovieObj && (
        <div className="modal-overlay" onClick={() => setSelectedMovieId(null)}>
          <div className="modal-content detail-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Media Profile Details </h2>
              <button className="close-btn" onClick={() => setSelectedMovieId(null)}>✕</button>
            </div>

            <div className="detail-modal-body">
              <MovieCard {...mapToCard(activeMovieObj)} />

              <div className="user-notes-section">
                <div className="rating-input-container">
                  <h3>My Rating {currentUserRating > 0 ? `(${ (currentUserRating / 2).toFixed(1) })` : "(Unrated)"}</h3>
                  
                  <div className="star-rating-selector">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((starIndex) => {
                      const leftValue = starIndex * 2 - 1; 
                      const rightValue = starIndex * 2;   
                      
                      let starClass = "empty";
                      if (currentUserRating >= rightValue) {
                        starClass = "full";
                      } else if (currentUserRating === leftValue) {
                        starClass = "half";
                      }

                      return (
                        <div key={starIndex} className={`split-star-box ${starClass}`}>
                          <span className="star-display-icon">★</span>
                          <button 
                            type="button"
                            className="star-hitbox left-hitbox" 
                            onClick={() => setCurrentUserRating(leftValue)}
                          />
                          <button 
                            type="button"
                            className="star-hitbox right-hitbox" 
                            onClick={() => setCurrentUserRating(rightValue)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <h3>My Diary Notes</h3>
                <textarea
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                  placeholder="Type your personal thoughts, comments, or reminders here..."
                  rows={4}
                  className="user-notes-input"
                />
                
                <div className="modal-action-row">
                  <button 
                    type="button" 
                    onClick={handleRemoveMedia} 
                    disabled={isSavingNote || isRemoving}
                    className="remove-log-btn"
                  >
                    {isRemoving ? "Removing..." : "Remove from Log"}
                  </button>

                  <button 
                    type="button" 
                    onClick={handleSaveNote} 
                    disabled={isSavingNote || isRemoving}
                    className="save-notes-btn"
                  >
                    {isSavingNote ? "Saving..." : "Save Log"}
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEARCH BASE ENTRY MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Search Titles to Log</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            
            <input
              type="text"
              placeholder="Type movie or show name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="modal-search-input"
              autoFocus
            />

            <div className="search-results-list">
              {searchResults.map((item) => {
                const title = item.title || item.name;
                const rawDate = item.release_date || item.first_air_date;
                const year = rawDate ? rawDate.split("-")[0] : "N/A";
                const badgeLabel = item.media_type === "tv" ? "TV Show" : "Movie";

                return (
                  <div key={item.id} className="search-result-item">
                    <img 
                      src={item.poster_path ? getPosterUrl(item.poster_path, "w92") : "https://via.placeholder.com/45x65?text=No+Img"} 
                      alt={title} 
                      className="search-item-img"
                    />
                    <div className="search-item-info">
                      <h4>{title} ({year})</h4>
                      <p>
                        <span className={`media-badge ${item.media_type}`}>
                          {badgeLabel}
                        </span>
                        {"  "}⭐ {item.vote_average?.toFixed(1) || "0.0"}
                      </p>
                    </div>
                    <button className="select-movie-btn" onClick={() => handleAddMedia(item.id, item.media_type as "movie" | "tv")}>
                      Add
                    </button>
                  </div>
                );
              })}
              
              {searchQuery && searchResults.length === 0 && (
                <p className="no-results">No matches found matching your search.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}