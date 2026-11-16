import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/sidebar";
import {
  searchMovies,
} from "../services/tmdbService";
import "../styles/ComparisonPage.css";
import { useAuth } from "../context/AuthContext";
import { useGenreMap } from "../utils/useGenreMap";
import { mapSearchDataToMovie } from "../utils/mapSearchDataToMovie";
import type { TMDBSearchResult } from "../types/tmdb";
import { handleSlotSelection } from "../utils/handleSlotSelection";

interface SelectedMovie {
  id: number;
  title: string;
  year: string;
  image: string | null;
  rating: number;
  synopsis: string;
  genres: string[];
  platform: string[];
  mediaType: "movie" | "tv";

}

const ComparisonPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SelectedMovie[]>([]);
  const [selectedMovies, setSelectedMovies] = useState<(SelectedMovie | null)[]>([null, null]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<0 | 1>(0);
  const [compared, setCompared] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { genreMap } = useGenreMap();


  const { getIdToken } = useAuth();



  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setDropdownOpen(false);
      return;
    }
    // Debounced API Search logic
    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchMovies(query);

        // Ensure data results exist before mapping
        const rawResults = data.results || [];
        // mapping of search results to SelectedMovie type using the genreMap
        const mappedResults: SelectedMovie[] = rawResults
          .map((item: TMDBSearchResult) => mapSearchDataToMovie(item, genreMap)).slice(0, 6);

        setResults(mappedResults);
        setDropdownOpen(mappedResults.length > 0);
      } catch (error) {
        console.error("Failed to fetch search results:", error);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query, genreMap]);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  // When a title is selected, we fetch its available platforms and update the selectedMovies state accordingly. 
  // We also determine which slot should be active next using handleSlotSelection.
  const selectMovie = async (movie: SelectedMovie) => {
    const { updatedSlots, nextActiveSlot } = await handleSlotSelection({
      movie,
      activeSlot,
      selectedMovies,
      getIdToken
    });

    setSelectedMovies(updatedSlots);
    setActiveSlot(nextActiveSlot);
    setQuery("");
    setResults([]);
    setDropdownOpen(false);
    setCompared(false);
  };
  // Function to remove a movie from a selected slot
  const removeMovie = (slot: 0 | 1) => {
    const updated = [...selectedMovies] as (SelectedMovie | null)[];
    updated[slot] = null;
    setSelectedMovies(updated);
    setActiveSlot(slot);
    setCompared(false);
  };

  const bothSelected = selectedMovies[0] !== null && selectedMovies[1] !== null;

  return (
    <div className="comparison-page">
      <Sidebar />

      <main className="comparison-main">
        <section className="hero-section">
          <div className="hero-text">
            <h1>The data behind your next binge</h1>
            <p>Pick two titles and see how they differ in ratings, genre, and more.</p>
          </div>
        </section>

        {/* Search bar */}
        <div className="comparison-search-section" ref={searchRef}>
          <div className="search-input-wrapper">
            <span className="search-icon">{loading ? "⏳" : "🔍"}</span>
            <input
              type="text"
              className="comparison-search-input"
              placeholder="Search for a movie or show..."
              value={query}
              onChange={handleQueryChange}
              onFocus={() => results.length > 0 && setDropdownOpen(true)}
              ref={searchInputRef}
            />
          </div>

          {dropdownOpen && results.length > 0 && (
            <ul className="search-dropdown">
              {results.map((movie) => (
                <li
                  key={movie.id}
                  className="dropdown-item"
                  onMouseDown={() => selectMovie(movie)}
                >
                  {movie.image ? (
                    <img src={movie.image} alt={`${movie.title} poster`} className="dropdown-image" />
                  ) : (
                    <div className="dropdown-image-placeholder">🎬</div>
                  )}
                  <div className="dropdown-info">
                    <span className="dropdown-title">{movie.title}</span>
                    <span className="dropdown-year">{movie.year} {movie.genres.length > 0 ? `· ${movie.genres.join(", ")}` : ""}</span>
                  </div>
                  <span className="dropdown-rating">★ {movie.rating}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Selection slots */}
        <div className="comparison-slots">
          {([0, 1] as const).map((slot) => {
            const movie = selectedMovies[slot];
            return (
              <div
                key={slot}
                className={`selection-slot ${movie ? "filled" : "empty"} ${activeSlot === slot ? "active-slot" : ""}`}
                onClick={() => {
                  if (!movie) {
                    setActiveSlot(slot);
                    searchInputRef.current?.focus();
                  }
                }}
              >
                {movie ? (
                  <>
                    <button
                      className="remove-btn"
                      onClick={(e) => { e.stopPropagation(); removeMovie(slot); }}
                      aria-label={`Remove ${movie.title}`}
                    >
                      ✕
                    </button>

                    {movie.image ? (
                      <img src={movie.image} alt={`${movie.title} poster`} className="slot-image" />
                    ) : (
                      <div className="slot-image-placeholder">🎬</div>
                    )}
                    <div className="slot-info">
                      <h3 className="slot-title">{movie.title}</h3>
                      <span className="slot-year">{movie.year}</span>
                      <span className="slot-genres">{movie.genres.join(", ")}</span>
                      <span className="slot-rating">★ {movie.rating}</span>
                    </div>
                  </>
                ) : (
                  <div className="empty-slot-content">
                    <span className="empty-slot-icon">＋</span>
                    <span className="empty-slot-label">
                      {activeSlot === slot ? "Search above to add" : `Click to select slot`}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Compare button */}
        <div className="compare-btn-row">
          <button
            className={`compare-btn ${bothSelected ? "ready" : "disabled"}`}
            onClick={() => bothSelected && setCompared(true)}
            disabled={!bothSelected}
          >
            {compared ? "✓ Compared" : "Compare"}
          </button>
        </div>
        <div className="mobile-bottom-spacer" />

        {/* Comparison result */}
        {compared && bothSelected && (
          <div className="comparison-result">
            <div className="result-divider"><span>Comparison</span></div>
            <div className="result-grid">
              <div className="result-cell label-cell" />
              <div className="result-cell header-cell">{selectedMovies[0]!.title}</div>
              <div className="result-cell header-cell">{selectedMovies[1]!.title}</div>

              <div className="result-cell label-cell">Rating</div>
              <div className={`result-cell value-cell ${selectedMovies[0]!.rating >= selectedMovies[1]!.rating ? "winner" : ""}`}>
                ★ {selectedMovies[0]!.rating}
              </div>
              <div className={`result-cell value-cell ${selectedMovies[1]!.rating >= selectedMovies[0]!.rating ? "winner" : ""}`}>
                ★ {selectedMovies[1]!.rating}
              </div>

              <div className="result-cell label-cell">Year</div>
              <div className="result-cell value-cell">{selectedMovies[0]!.year}</div>
              <div className="result-cell value-cell">{selectedMovies[1]!.year}</div>

              <div className="result-cell label-cell">Genres</div>
              <div className="result-cell value-cell">{selectedMovies[0]!.genres.join(", ")}</div>
              <div className="result-cell value-cell">{selectedMovies[1]!.genres.join(", ")}</div>

              <div className="result-cell label-cell">Platform</div>
              <div className="result-cell value-cell">{selectedMovies[0]!.platform.join(", ")}</div>
              <div className="result-cell value-cell">{selectedMovies[1]!.platform.join(", ")}</div>

              <div className="result-cell label-cell">Synopsis</div>
              <div className="result-cell value-cell synopsis-cell">{selectedMovies[0]!.synopsis}</div>
              <div className="result-cell value-cell synopsis-cell">{selectedMovies[1]!.synopsis}</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ComparisonPage;