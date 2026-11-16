import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import { useAuth } from "../context/AuthContext";
import {
  getBingeBuddies,
  getMovieDetails,
  getTVShowDetails,
  getPosterUrl,
  type BingeBuddyMatch
} from "../services/tmdbService";
import { buildContactLink } from "../utils/buildContactLink";
import {initial} from "../utils/getInitial"
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import "../styles/BingeBuddiesPage.css";

// Resolved display info for a shared title
interface TitleInfo {
  title: string;
  poster: string | null;
}

// Max shared-title posters shown per match card before "+N more"
const MAX_POSTERS = 6;

const BingeBuddiesPage = () => {
  const { getIdToken, user } = useAuth();
  const navigate = useNavigate();

  const [matches, setMatches] = useState<BingeBuddyMatch[]>([]);
  const [titleMap, setTitleMap] = useState<Record<string, TitleInfo>>({});
  const [loading, setLoading] = useState(true);
  const [hasList, setHasList] = useState(true);
  const [myOptIn, setMyOptIn] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    if (!user) return; // wait for auth before the one-time fetch
    hasFetched.current = true;

    const load = async () => {
      try {
        setLoading(true);
        const idToken = await getIdToken();
        if (!idToken) {
          setLoading(false);
          return;
        }

        const { matches: found, hasList: listExists, myOptIn: optedIn } =
          await getBingeBuddies(idToken);
        setHasList(listExists);
        setMatches(found);

        // Read the current user's opt-in flag straight from Firestore so the
        // banner is accurate even if the backend response omits `myOptIn`.
        if (user?.uid) {
          try {
            const meSnap = await getDoc(doc(db, "users", user.uid));
            setMyOptIn(meSnap.exists() && meSnap.data().bingeBuddyOptIn === true);
          } catch {
            setMyOptIn(optedIn ?? false);
          }
        } else {
          setMyOptIn(optedIn ?? false);
        }

        // Resolve the details of every unique shared title once (cached by key)
        const uniqueKeys = new Map<string, { id: number; type: "movie" | "tv" }>();
        found.forEach((m) =>
          m.commonItems.forEach((item) => {
            uniqueKeys.set(`${item.type}-${item.id}`, item);
          })
        );

        const entries = await Promise.all(
          [...uniqueKeys.entries()].map(async ([key, item]) => {
            try {
              const detail =
                item.type === "tv"
                  ? await getTVShowDetails(item.id)
                  : await getMovieDetails(item.id);
              const info: TitleInfo = {
                title: detail.title || detail.name || "Untitled",
                poster: detail.poster_path ? getPosterUrl(detail.poster_path) : null,
              };
              return [key, info] as const;
            } catch {
              return [key, { title: "Untitled", poster: null }] as const;
            }
          })
        );

        const map: Record<string, TitleInfo> = {};
        entries.forEach(([key, info]) => {
          map[key] = info;
        });
        setTitleMap(map);
      } catch (err) {
        console.error("Failed to load binge buddies:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [getIdToken, user]);

  return (
    <div className="buddies-page">
      <Sidebar />

      <main className="buddies-main">
        {/* Hero */}
        <section className="hero-section">
          <div className="hero-text">
            <h1>Social Connection <span>Hub</span></h1>
            <p>Discover fellow bingers who want to watch the same movies and shows as you.</p>
          </div>
        </section>

        {/* Nudge users who haven't opted in yet */}
        {!loading && !myOptIn && (
          <div className="buddies-optin-banner">
            <i className="ti ti-user-search" aria-hidden="true"></i>
            <div className="buddies-optin-copy">
              <p className="buddies-optin-title">You're not listed yet</p>
              <p className="buddies-optin-text">
                Opt in from your <Link to="/profile">Profile</Link> so other bingers can find and reach you here.
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="buddies-loading">
            <img src="/Baby Pop.png" alt="loading" className="buddies-loading-icon" />
            <p>Finding your binge buddies...</p>
          </div>
        ) : !hasList ? (
          <div className="buddies-empty">
            <img src="/Big Pop.png" alt="Binge Buddies Mascot" className="buddies-empty-mascot" />
            <h3>Your Want to Watch list is empty!</h3>
            <p>
              Add titles to your <em>Want to Watch</em> list from the Recommendations page,
              then come back to find buddies who share your taste.
            </p>
          </div>
        ) : matches.length === 0 ? (
          <div className="buddies-empty">
            <img src="/Baby Pop.png" alt="Binge Buddies Mascot" className="buddies-empty-mascot" />
            <h3>No binge buddies yet!</h3>
            <p>
              Nobody who's opted in shares a want-to-watch title with you right now. Add more titles to your list,
              as more people join and opt in, your matches will show up here.
            </p>
          </div>
        ) : (
          <div className="buddies-grid">
            {matches.map((match) => {
              const shown = match.commonItems.slice(0, MAX_POSTERS);
              const extra = match.commonItems.length - shown.length;
              const contact = buildContactLink(match.contactType, match.contactValue);
              return (
                <div key={match.uid} className="buddy-card">
                  <div className="buddy-header">
                    <div className="buddy-avatar">
                      {match.photoURL ? (
                        <img src={match.photoURL} alt={`${match.username}'s avatar`} />
                      ) : (
                        initial(match.username)
                      )}
                    </div>
                    <div className="buddy-info">
                      <p className="buddy-name">{match.username}</p>
                      <p className="buddy-match-count">
                        {match.matchCount} title{match.matchCount === 1 ? "" : "s"} in common
                      </p>
                    </div>
                  </div>

                  {/* Top genre + contact */}
                  <div className="buddy-meta">
                    <div className="buddy-meta-row">
                      <span className="buddy-meta-label">Top genre</span>
                      <span className="buddy-genre-chip">{match.topGenre || "Not set yet"}</span>
                    </div>
                    <div className="buddy-meta-row">
                      <span className="buddy-meta-label">Contact</span>
                      {contact ? (
                        contact.href ? (
                          <a
                            className="buddy-contact-chip"
                            href={contact.href}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {contact.label}
                          </a>
                        ) : (
                          <span className="buddy-contact-chip is-static">{contact.label}</span>
                        )
                      ) : (
                        <span className="buddy-no-contact">No contact shared</span>
                      )}
                    </div>
                  </div>

                  <div className="buddy-common-titles">
                    {shown.map((item) => {
                      const info = titleMap[`${item.type}-${item.id}`];
                      return (
                        <div
                          key={`${item.type}-${item.id}`}
                          className="common-title"
                          title={info?.title || ""}
                        >
                          {info?.poster ? (
                            <img src={info.poster} alt={info.title} className="common-poster" />
                          ) : (
                            <div className="common-poster common-poster-fallback">🎬</div>
                          )}
                        </div>
                      );
                    })}
                    {extra > 0 && <div className="common-more">+{extra}</div>}
                  </div>

                  <button
                    className="buddy-message-btn"
                    onClick={() =>
                      navigate(`/messages/${match.uid}`, {
                        state: { username: match.username, photoURL: match.photoURL },
                      })
                    }
                  >
                     Message
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default BingeBuddiesPage;
