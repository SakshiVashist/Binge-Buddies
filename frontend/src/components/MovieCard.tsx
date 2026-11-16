import React from "react";
import "../styles/MovieCard.css";

interface MovieCardProps {
  title: string;
  genres: string[];
  synopsis: string;
  image: string;
  rating: number;
  platform: string[];
  variant?: "featured" | "compact" | "normal";
  season?: number;
  episode?: number;
  episodeTitle?: string;
  actionLabel?: string;
  onActionClick?: () => void;
}

const MovieCard: React.FC<MovieCardProps> = ({
  title,
  genres,
  synopsis,
  image,
  rating,
  platform = [],
  variant = "normal",
  season,
  episode,
  episodeTitle,
  actionLabel,
  onActionClick,
}) => {
  return (
    /* We append the variant layout modifier dynamically here, if not available in SG will return not available */
    <div className={`movie-card ${variant}-variant`}>
      {/* HEADER SECTION (Now neatly sitting inside our outlined card) */}
      <div className="movie-card-header">
        <div className="header-left">
          <span className="card-rating">★ {rating.toFixed(1)}</span>
          <div className="where-to-watch-badges">
            {platform.length > 0 ? (
              platform.map((platform, idx) => (
              <span key={idx} className="platform-badge">
                {platform}
              </span>
            ))
          ) : (
            <span className="platform-badge">Not currently available in SG</span>
          )}
          </div>
        </div>
      </div>

      {/* CORE INFO LAYOUT */}
      <div className="movie-card-body">
        {/* Frame around poster guarantees mask clips correctly */}
        <div className="movie-poster-frame">
          <img src={image} alt={title} className="movie-poster" />
        </div>

        <div className="movie-details">
          <div className="movie-genres">
            {genres.map((genre, index) => (
              <span key={index} className="genre-tag">
                {genre}
              </span>
            ))}
          </div>

          <h3 className="movie-title">{title}</h3>

          {/* Conditional rendering for Episode/Season subheadings */}
          {(season || episode || episodeTitle) ? (
            <h4 className="episode-subtitle">
              S{season} E{episode} {episodeTitle ? `• "${episodeTitle}"` : ""}
            </h4>
          ) : (
            /* Blank placeholder to maintain vertical text spacing parity when there is no subtitle */
            <h4 className="episode-subtitle" style={{ visibility: 'hidden' }}>Placeholder</h4>
          )}

          <p className="movie-synopsis">{synopsis}</p>

          {/* Conditional Rendering for Interactive CTA actions */}
          {actionLabel && onActionClick && (
            <button type="button" className="primary-btn" onClick={onActionClick}>
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;