import { useState, useEffect, useMemo } from 'react'
import '../styles/CommunityPage.css'
import Sidebar from '../components/sidebar'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase'
import { searchMovies } from '../services/tmdbService'
import { mapSearchDataToMovie } from '../utils/mapSearchDataToMovie'
import type { TMDBSearchResult } from '../types/tmdb'
import { useGenreMap } from '../utils/useGenreMap'
import { formatTime, computeTrending, resolveAuthor, canSubmitPost, filterPosts, type Media, type Post } from '../utils/communityUtils'
import { initial } from '../utils/getInitial'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  writeBatch,
  getDocs,
} from 'firebase/firestore'
import type { Timestamp } from 'firebase/firestore'


interface Comment {
  id: string
  authorId: string
  authorName: string
  authorPhotoURL: string | null
  content: string
  createdAt: Timestamp | null
}


// Inline trash icon — inherits the theme colour via currentColor
const TrashIcon = () => (
  <svg
    className="trash-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 7h16" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12" />
    <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
  </svg>
)

// Thumbs-up icon (filled state toggles via the `filled` prop)
const ThumbUpIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg
    className="action-icon"
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M7 10v11" />
    <path d="M7 10l4-7a2 2 0 0 1 2 2v4h5a2 2 0 0 1 2 2.3l-1.3 7A2 2 0 0 1 18.4 21H7" />
  </svg>
)

// Magnifier search icon
const SearchIcon = () => (
  <svg
    className="feed-search-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
)

// Speech-bubble comment icon
const CommentIcon = () => (
  <svg
    className="action-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z" />
  </svg>
)

// Renders a profile picture if available, otherwise a coloured initial
const Avatar = ({ name, photoURL }: { name: string; photoURL: string | null }) => (
  <div className="post-avatar">
    {photoURL ? (
      <img src={photoURL} alt={`${name}'s avatar`} className="post-avatar-img" />
    ) : (
      initial(name || 'Binger')
    )}
  </div>
)

const CommunityPage = () => {
  const { user, username } = useAuth()

  const [posts, setPosts] = useState<Post[]>([])
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState<string>('')

  // Feed filter + search
  const [filter, setFilter] = useState<'all' | 'reflection' | 'recommendation'>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Current user's live profile picture (base64) for authoring posts/comments
  const [myPhotoURL, setMyPhotoURL] = useState<string | null>(null)

  // Live author profiles keyed by uid, so avatars/usernames always stay current
  const [profiles, setProfiles] = useState<
    Record<string, { username: string; photoURL: string | null }>
  >({})

  // Compose form state
  const [composeOpen, setComposeOpen] = useState<boolean>(false)
  const [composeType, setComposeType] = useState<'reflection' | 'recommendation'>('reflection')
  const [newTitle, setNewTitle] = useState<string>('')
  const [newContent, setNewContent] = useState<string>('')
  const [posting, setPosting] = useState<boolean>(false)

  // Recommendation search state
  const { genreMap } = useGenreMap()
  const [mediaQuery, setMediaQuery] = useState<string>('')
  const [mediaResults, setMediaResults] = useState<Media[]>([])
  const [mediaLoading, setMediaLoading] = useState<boolean>(false)
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null)

  const displayName =
    username || user?.displayName || user?.email?.split('@')[0] || 'Binger'

  // Debounced movie/TV search while composing a recommendation
  useEffect(() => {
    if (!mediaQuery.trim()) {
      setMediaResults([])
      return
    }
    const t = setTimeout(async () => {
      setMediaLoading(true)
      try {
        const data = await searchMovies(mediaQuery)
        const mapped = (data.results || [])
          .filter((item: TMDBSearchResult) => item.media_type !== 'person')
          .map((item: TMDBSearchResult) => {
            const m = mapSearchDataToMovie(item, genreMap)
            return {
              id: m.id,
              mediaType: m.mediaType,
              title: m.title,
              year: m.year,
              posterUrl: m.image,
            } as Media
          })
          .slice(0, 6)
        setMediaResults(mapped)
      } catch (err) {
        console.error('Failed to search titles:', err)
      } finally {
        setMediaLoading(false)
      }
    }, 400)
    return () => clearTimeout(t)
  }, [mediaQuery, genreMap])

  // Top 5 most-recommended titles this week, derived from recommendation posts
  const trending = useMemo(() => computeTrending(posts), [posts])

  // Subscribe to the live post feed, newest first
  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      const list: Post[] = snap.docs.map((d) => {
        const data = d.data()
        return {
          id: d.id,
          authorId: data.authorId,
          authorName: data.authorName || 'Binger',
          authorPhotoURL: data.authorPhotoURL || null,
          type: data.type || 'reflection',
          title: data.title || '',
          content: data.content || '',
          media: data.media || null,
          likedBy: data.likedBy || [],
          commentCount: data.commentCount || 0,
          createdAt: data.createdAt || null,
        }
      })
      setPosts(list)
    })
    return () => unsub()
  }, [])

  // Live-subscribe to the current user's own profile so any picture/username
  // change instantly propagates to every post and comment they've made
  useEffect(() => {
    if (!user?.uid) {
      setMyPhotoURL(null)
      return
    }
    const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data()
        setMyPhotoURL(data.photoURL || null)
        setProfiles((prev) => ({
          ...prev,
          [user.uid]: {
            username: data.username || '',
            photoURL: data.photoURL || null,
          },
        }))
      }
    })
    return () => unsub()
  }, [user])

  // Fetch profiles of any post/comment authors we haven't loaded yet
  useEffect(() => {
    const ids = new Set<string>()
    posts.forEach((p) => p.authorId && ids.add(p.authorId))
    comments.forEach((c) => c.authorId && ids.add(c.authorId))

    const missing = [...ids].filter((id) => !(id in profiles))
    if (missing.length === 0) return

    Promise.all(
      missing.map(async (id) => {
        try {
          const snap = await getDoc(doc(db, 'users', id))
          const data = snap.exists() ? snap.data() : {}
          return [id, { username: data.username || '', photoURL: data.photoURL || null }] as const
        } catch {
          return [id, { username: '', photoURL: null }] as const
        }
      })
    ).then((entries) => {
      setProfiles((prev) => {
        const next = { ...prev }
        entries.forEach(([id, prof]) => {
          if (!(id in next)) next[id] = prof
        })
        return next
      })
    })
  }, [posts, comments, profiles])

  // Subscribe to comments of the currently open post
  useEffect(() => {
    if (!selectedPostId) {
      setComments([])
      return
    }
    const q = query(
      collection(db, 'posts', selectedPostId, 'comments'),
      orderBy('createdAt', 'asc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setComments(
        snap.docs.map((d) => {
          const data = d.data()
          return {
            id: d.id,
            authorId: data.authorId,
            authorName: data.authorName || 'Binger',
            authorPhotoURL: data.authorPhotoURL || null,
            content: data.content || '',
            createdAt: data.createdAt || null,
          }
        })
      )
    })
    return () => unsub()
  }, [selectedPostId])

  const selectedPost = posts.find((p) => p.id === selectedPostId) || null

  // Resolve an author's current name/photo, preferring the live profile and
  // falling back to whatever was stored on the post/comment
  const resolveAuthorLocal = (
    authorId: string,
    fallbackName: string,
    fallbackPhoto: string | null
  ) => resolveAuthor(authorId, fallbackName, fallbackPhoto, profiles)

  // Posts after applying the type filter and the search query
  const visiblePosts = filterPosts(posts, filter, searchQuery, profiles)

  // Toggle a like for the current user (persisted as an array of uids)
  const handleLike = async (post: Post) => {
    if (!user) return
    const hasLiked = post.likedBy.includes(user.uid)
    try {
      await updateDoc(doc(db, 'posts', post.id), {
        likedBy: hasLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
      })
    } catch (err) {
      console.error('Failed to update like:', err)
    }
  }


  const canSubmit = canSubmitPost(composeType, newTitle, newContent, selectedMedia)

  // Create a new post from the compose form
  const handleCreatePost = async () => {
    if (!user || !canSubmit) return
    const isRec = composeType === 'recommendation'
    setPosting(true)
    try {
      await addDoc(collection(db, 'posts'), {
        authorId: user.uid,
        authorName: displayName,
        authorPhotoURL: myPhotoURL,
        type: composeType,
        // For recommendations the title is the chosen title; the note is optional
        title: isRec ? selectedMedia!.title : newTitle.trim(),
        content: newContent.trim(),
        media: isRec ? selectedMedia : null,
        likedBy: [],
        commentCount: 0,
        createdAt: serverTimestamp(),
      })
      resetCompose()
    } catch (err) {
      console.error('Failed to create post:', err)
    } finally {
      setPosting(false)
    }
  }

  // Clear every field of the compose form
  const resetCompose = () => {
    setNewTitle('')
    setNewContent('')
    setMediaQuery('')
    setMediaResults([])
    setSelectedMedia(null)
    setComposeOpen(false)
  }

  // Post a comment on the open post and bump its comment counter
  const handlePostComment = async () => {
    if (!user || !selectedPost) return
    if (!commentText.trim()) return
    try {
      await addDoc(collection(db, 'posts', selectedPost.id, 'comments'), {
        authorId: user.uid,
        authorName: displayName,
        authorPhotoURL: myPhotoURL,
        content: commentText.trim(),
        createdAt: serverTimestamp(),
      })
      await updateDoc(doc(db, 'posts', selectedPost.id), {
        commentCount: increment(1),
      })
      setCommentText('')
    } catch (err) {
      console.error('Failed to post comment:', err)
    }
  }

  // Delete a post (author only) along with its comments
  const handleDeletePost = async (post: Post) => {
    if (!user || user.uid !== post.authorId) return
    if (!window.confirm('Delete this post? This cannot be undone.')) return
    try {
      const batch = writeBatch(db)
      const commentsSnap = await getDocs(
        collection(db, 'posts', post.id, 'comments')
      )
      commentsSnap.forEach((c) => batch.delete(c.ref))
      batch.delete(doc(db, 'posts', post.id))
      await batch.commit()
      if (selectedPostId === post.id) setSelectedPostId(null)
    } catch (err) {
      console.error('Failed to delete post:', err)
    }
  }

  // Delete a comment (author only) and decrement the counter
  const handleDeleteComment = async (comment: Comment) => {
    if (!user || !selectedPost || user.uid !== comment.authorId) return
    try {
      await deleteDoc(
        doc(db, 'posts', selectedPost.id, 'comments', comment.id)
      )
      await updateDoc(doc(db, 'posts', selectedPost.id), {
        commentCount: increment(-1),
      })
    } catch (err) {
      console.error('Failed to delete comment:', err)
    }
  }

  const openCompose = (type: 'reflection' | 'recommendation') => {
    setComposeType(type)
    setNewTitle('')
    setNewContent('')
    setMediaQuery('')
    setMediaResults([])
    setSelectedMedia(null)
    setComposeOpen(true)
    setSelectedPostId(null)
  }

  return (
    <div className="community-page">
      <Sidebar />

      <div className="main-content">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-text">
            <h1>Community <span>Hub</span></h1>
            <p>Share reflections, discover recommendations, and connect with your fellow binge buddies.</p>
          </div>
        </div>

        {/* Dashboard 2-Column Split Grid */}
        <div className="content-grid">
          {/* Column 1: Main Feed Stream */}
          <div className="community-main">
            {composeOpen ? (
              /* Compose new post */
              <div className="card post-full-card">
                <button
                  className="secondary-btn btn-back"
                  onClick={resetCompose}
                >
                  ← Back to feed
                </button>

                <h2 className="movie-title">
                  {composeType === 'reflection'
                    ? 'Write a Reflection'
                    : 'Share a Recommendation'}
                </h2>

                <div className="compose-form">
                  {composeType === 'reflection' ? (
                    <input
                      className="compose-title-input"
                      placeholder="Give it a title..."
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      maxLength={120}
                    />
                  ) : selectedMedia ? (
                    /* Chosen title preview */
                    <div className="selected-media">
                      {selectedMedia.posterUrl ? (
                        <img
                          src={selectedMedia.posterUrl}
                          alt={selectedMedia.title}
                          className="selected-media-poster"
                        />
                      ) : (
                        <div className="selected-media-poster media-poster-fallback">
                          🎬
                        </div>
                      )}
                      <div className="selected-media-info">
                        <span className="media-badge">
                          {selectedMedia.mediaType === 'tv' ? 'TV Show' : 'Movie'}
                        </span>
                        <p className="selected-media-title">{selectedMedia.title}</p>
                        <p className="selected-media-year">{selectedMedia.year}</p>
                        <button
                          className="change-media-btn"
                          onClick={() => setSelectedMedia(null)}
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Search box + results dropdown */
                    <div className="media-search">
                      <input
                        className="compose-title-input"
                        placeholder="Search for a movie or TV show..."
                        value={mediaQuery}
                        onChange={(e) => setMediaQuery(e.target.value)}
                        autoFocus
                      />
                      {mediaLoading && (
                        <p className="media-search-status">Searching...</p>
                      )}
                      {!mediaLoading &&
                        mediaQuery.trim() &&
                        mediaResults.length === 0 && (
                          <p className="media-search-status">No titles found.</p>
                        )}
                      {mediaResults.length > 0 && (
                        <ul className="media-dropdown">
                          {mediaResults.map((m) => (
                            <li
                              key={`${m.mediaType}-${m.id}`}
                              className="media-dropdown-item"
                              onClick={() => {
                                setSelectedMedia(m)
                                setMediaQuery('')
                                setMediaResults([])
                              }}
                            >
                              {m.posterUrl ? (
                                <img
                                  src={m.posterUrl}
                                  alt={m.title}
                                  className="media-thumb"
                                />
                              ) : (
                                <div className="media-thumb media-poster-fallback">
                                  🎬
                                </div>
                              )}
                              <div className="media-dropdown-text">
                                <span className="media-dropdown-title">{m.title}</span>
                                <span className="media-dropdown-meta">
                                  {m.mediaType === 'tv' ? 'TV Show' : 'Movie'} · {m.year}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  <textarea
                    className="comment-input"
                    placeholder={
                      composeType === 'recommendation'
                        ? 'Add a note about why you recommend it (optional)...'
                        : 'Share your thoughts...'
                    }
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                  />
                  <button
                    className="primary-btn"
                    onClick={handleCreatePost}
                    disabled={posting || !canSubmit}
                  >
                    {posting ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            ) : !selectedPost ? (
              <>
                {/* Search + filter toolbar */}
                <div className="feed-toolbar">
                  <div className="feed-search">
                    <SearchIcon />
                    <input
                      type="text"
                      placeholder="Search posts, titles or people..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button
                        className="feed-search-clear"
                        title="Clear search"
                        onClick={() => setSearchQuery('')}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <div className="feed-filters">
                    {([
                      { key: 'all', label: 'All' },
                      { key: 'reflection', label: 'Reflections' },
                      { key: 'recommendation', label: 'Recommendations' },
                    ] as const).map((f) => (
                      <button
                        key={f.key}
                        className={`feed-filter-btn ${filter === f.key ? 'active' : ''}`}
                        onClick={() => setFilter(f.key)}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="post-list">
                  {posts.length === 0 ? (
                    <div className="card empty-feed">
                      <p>No posts yet. Be the first to share something!</p>
                    </div>
                  ) : visiblePosts.length === 0 ? (
                    <div className="card empty-feed">
                      <p>No posts match your search or filter.</p>
                    </div>
                  ) : null}
                  {visiblePosts.map((post) => (
                    <div
                      key={post.id}
                      className={`card post-card post-card--${post.type}`}
                      onClick={() => setSelectedPostId(post.id)}
                    >
                      <div className="card-header-post">
                        <div className="user-profile-block">
                          {(() => {
                            const a = resolveAuthorLocal(
                              post.authorId,
                              post.authorName,
                              post.authorPhotoURL
                            )
                            return (
                              <>
                                <Avatar name={a.name} photoURL={a.photoURL} />
                                <div>
                                  <p className="post-user">{a.name}</p>
                                  <p className="post-time">{formatTime(post.createdAt)}</p>
                                </div>
                              </>
                            )
                          })()}
                        </div>
                        {user?.uid === post.authorId && (
                          <button
                            className="delete-btn"
                            title="Delete post"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeletePost(post)
                            }}
                          >
                            <TrashIcon />
                          </button>
                        )}
                      </div>
                      {post.type === 'recommendation' && post.media ? (
                        <div className="rec-preview">
                          {post.media.posterUrl ? (
                            <img
                              src={post.media.posterUrl}
                              alt={post.media.title}
                              className="rec-poster"
                            />
                          ) : (
                            <div className="rec-poster media-poster-fallback">🎬</div>
                          )}
                          <div className="rec-preview-text">
                            <span className="media-badge">
                              {post.media.mediaType === 'tv' ? 'TV Show' : 'Movie'}
                            </span>
                            <h3 className="post-title">
                              {post.media.title}{' '}
                              <span className="rec-year">({post.media.year})</span>
                            </h3>
                            {post.content && (
                              <p className="synopsis-short">
                                {post.content.length > 120
                                  ? `${post.content.substring(0, 120)}...`
                                  : post.content}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3 className="post-title">{post.title}</h3>
                          <p className="synopsis-short">
                            {post.content.length > 140
                              ? `${post.content.substring(0, 140)}...`
                              : post.content}
                          </p>
                        </>
                      )}

                      <div className="post-footer">
                        <button
                          className={`post-stat icon-like-btn ${user && post.likedBy.includes(user.uid) ? 'is-liked' : ''
                            }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleLike(post)
                          }}
                        >
                          <ThumbUpIcon filled={!!user && post.likedBy.includes(user.uid)} />
                          <span className="count-text">{post.likedBy.length}</span>
                        </button>

                        <span className="post-stat icon-comment-display">
                          <CommentIcon />
                          <span className="count-text">{post.commentCount}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mobile-bottom-spacer" />
              </>
            ) : (
              /* Inside Selected Active Post Expansion */
              <div className={`card post-full-card post-card--${selectedPost.type}`}>
                <button
                  className="secondary-btn btn-back"
                  onClick={() => setSelectedPostId(null)}
                >
                  ← Back to feed
                </button>

                <div className="card-header-post">
                  <div className="user-profile-block">
                    {(() => {
                      const a = resolveAuthorLocal(
                        selectedPost.authorId,
                        selectedPost.authorName,
                        selectedPost.authorPhotoURL
                      )
                      return (
                        <>
                          <Avatar name={a.name} photoURL={a.photoURL} />
                          <div>
                            <p className="post-user">{a.name}</p>
                            <p className="post-time">
                              {formatTime(selectedPost.createdAt)}
                            </p>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                  {user?.uid === selectedPost.authorId && (
                    <button
                      className="delete-btn"
                      title="Delete post"
                      onClick={() => handleDeletePost(selectedPost)}
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>

                {selectedPost.type === 'recommendation' && selectedPost.media && (
                  <div className="rec-detail">
                    {selectedPost.media.posterUrl ? (
                      <img
                        src={selectedPost.media.posterUrl}
                        alt={selectedPost.media.title}
                        className="rec-detail-poster"
                      />
                    ) : (
                      <div className="rec-detail-poster media-poster-fallback">🎬</div>
                    )}
                    <div>
                      <span className="media-badge">
                        {selectedPost.media.mediaType === 'tv' ? 'TV Show' : 'Movie'}
                      </span>
                      <p className="rec-detail-year">Released {selectedPost.media.year}</p>
                    </div>
                  </div>
                )}

                <h2 className="movie-title">{selectedPost.title}</h2>
                {selectedPost.content && (
                  <p className="synopsis">{selectedPost.content}</p>
                )}

                {/* thumbs-up action button */}
                <div className="post-actions">
                  <button
                    className={`primary-btn ${user && selectedPost.likedBy.includes(user.uid) ? 'is-liked' : ''
                      }`}
                    onClick={() => handleLike(selectedPost)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <ThumbUpIcon
                      filled={!!user && selectedPost.likedBy.includes(user.uid)}
                    />
                    <span>
                      {user && selectedPost.likedBy.includes(user.uid) ? 'Liked' : 'Like'} (
                      {selectedPost.likedBy.length})
                    </span>
                  </button>
                </div>

                <div className="comment-section">
                  <p className="episode-subtitle">
                    Comments ({selectedPost.commentCount})
                  </p>

                  {/* Existing comments */}
                  <div className="comment-list">
                    {comments.length === 0 && (
                      <p className="no-comments">No comments yet. Start the conversation!</p>
                    )}
                    {comments.map((comment) => {
                      const a = resolveAuthorLocal(
                        comment.authorId,
                        comment.authorName,
                        comment.authorPhotoURL
                      )
                      return (
                        <div key={comment.id} className="comment-item">
                          <Avatar name={a.name} photoURL={a.photoURL} />
                          <div className="comment-body">
                            <div className="comment-header">
                              <span className="comment-user">{a.name}</span>
                              <span className="comment-time">
                                {formatTime(comment.createdAt)}
                              </span>
                              {user?.uid === comment.authorId && (
                                <button
                                  className="delete-btn comment-delete"
                                  title="Delete comment"
                                  onClick={() => handleDeleteComment(comment)}
                                >
                                  <TrashIcon />
                                </button>
                              )}
                            </div>
                            <p className="comment-text">{comment.content}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* New comment box */}
                  <p className="episode-subtitle">Leave a comment</p>
                  <textarea
                    className="comment-input"
                    placeholder="Write your thoughts..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <button
                    className="secondary-btn"
                    onClick={handlePostComment}
                    disabled={!commentText.trim()}
                  >
                    Post Comment
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Column 2: Interactive Right Sidebar Blocks */}
          <div className="side-cards">
            {/* Quick Action Block */}
            <div className="card shadow-adjust share-card">
              <h2>Share Something</h2>
              <div className="action-button-group">
                <button
                  className="primary-btn full-width-btn"
                  onClick={() => openCompose('reflection')}
                >
                  Write a Reflection
                </button>
                <button
                  className="secondary-btn"
                  onClick={() => openCompose('recommendation')}
                >
                  Share a Recommendation
                </button>
              </div>
            </div>

            {/* Trending Block — most-recommended titles */}
            <div className="card shadow-adjust">
              <h2>Trending This Week</h2>
              <p className="trending-subtitle">Most recommended by the community</p>
              <div className="trending-list">
                {trending.length === 0 ? (
                  <p className="no-trending">
                    No recommendations yet. Share one to get things started!
                  </p>
                ) : (
                  trending.map((entry, index) => (
                    <div
                      key={`${entry.media.mediaType}-${entry.media.id}`}
                      className="trending-item"
                    >
                      <span className="time-left">{index + 1}</span>
                      {entry.media.posterUrl ? (
                        <img
                          src={entry.media.posterUrl}
                          alt={entry.media.title}
                          className="trending-poster"
                        />
                      ) : (
                        <div className="trending-poster media-poster-fallback">🎬</div>
                      )}
                      <span className="trending-title">{entry.media.title}</span>
                      <span className="trending-count">
                        {entry.count} rec{entry.count === 1 ? '' : 's'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommunityPage
