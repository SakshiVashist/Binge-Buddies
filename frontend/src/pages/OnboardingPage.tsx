import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/OnboardingPage.css'
import { auth } from "../firebase"
import { useAuth } from '../context/AuthContext'

// Static configuration data matching TMDb structure perfectly
const movieGenres = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama',
  'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery', 'Romance',
  'Sci-Fi', 'TV Movie', 'Thriller', 'War', 'Western'
]

const tvGenres = [
  'Action & Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama',
  'Family', 'Kids', 'Mystery', 'News', 'Reality', 'Sci-Fi & Fantasy', 'Soap', 'Talk', 'War & Politics', 'Western'
]

const categoriesList = ['Movies', 'TV Shows']

const languagesList = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Japanese',
  'Korean', 'Mandarin', 'Chinese', 'Hindi', 'Portuguese', 'Russian',
  'Arabic', 'Thai', 'Turkish', 'Vietnamese', 'Indonesian'
]

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { setHasCompletedOnboarding, setUsername: setGlobalUsername } = useAuth()

  // Component States
  const [username, setUsername] = useState('')
  const [selectedMovieGenres, setSelectedMovieGenres] = useState<string[]>([])
  const [selectedTvGenres, setSelectedTvGenres] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [customLanguage, setCustomLanguage] = useState('')
  const [showCustomLanguage, setShowCustomLanguage] = useState(false)

  // Toggle utility function for handling array selections
  const toggle = (item: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item))
    } else {
      setList([...list, item])
    }
  }
  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      // Deselect category and wipe associated genre choices
      setSelectedCategories(selectedCategories.filter((c) => c !== cat))
      if (cat === 'Movies') setSelectedMovieGenres([])
      if (cat === 'TV Shows') setSelectedTvGenres([])
    } else {
      // Select category
      setSelectedCategories([...selectedCategories, cat])
    }
  }


  // Handle custom language additions
  const handleAddCustomLanguage = () => {
    if (customLanguage.trim() && !selectedLanguages.includes(customLanguage.trim())) {
      setSelectedLanguages([...selectedLanguages, customLanguage.trim()])
      setCustomLanguage('')
      setShowCustomLanguage(false)
    }
  }

  // Submit preferences to Node.js backend
  const handleSubmit = async () => {
    setError('')

    // Form Validations
    if (!username.trim()) {
      setError('Please enter a username')
      return
    }
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters')
      return
    }
    if (selectedMovieGenres.length === 0 && selectedTvGenres.length === 0) {
      setError('Please select at least one movie or TV genre')
      return
    }
    if (selectedCategories.includes('TV Shows') && selectedTvGenres.length === 0) {
      setError('You selected TV Shows as a category. Please select at least one TV genre')
      return
    }
    if (selectedCategories.includes('Movies') && selectedMovieGenres.length === 0) {
      setError('You selected Movies as a category. Please select at least one Movie genre')
      return
    }

    if (selectedCategories.length === 0) {
      setError('Please select at least one category to watch')
      return
    }
    if (selectedLanguages.length === 0) {
      setError('Please select at least one language')
      return
    }

    const currentUser = auth.currentUser

    if (!currentUser) {
      setError('No active session. Please log in again.')
      navigate('/login')
      return
    }

    setIsSubmitting(true)

    try {
      // 1. Fetch user's Firebase auth token to authenticate server-side
      const token = await currentUser.getIdToken()

      // 2. Send decoupled preference payload over to Node server
      const response = await fetch('https://binge-buddies-orbital-26-1.onrender.com/api/users/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          uid: currentUser.uid,
          username: username.trim(),
          movieGenres: selectedMovieGenres,
          tvGenres: selectedTvGenres,
          categories: selectedCategories,
          languages: selectedLanguages,
          hasCompletedOnboarding: true
        })
      })

      if (!response.ok) {
        throw new Error('Server rejected onboarding data')
      }

      // 3. Clear application context authentication parameters
      setHasCompletedOnboarding(true)
      if (setGlobalUsername) {
        setGlobalUsername(username.trim())
      }

      // 4. Mirror items securely inside Session Storage for dynamic dashboard fallbacks
      sessionStorage.setItem('firebaseUserId', currentUser.uid)
      sessionStorage.setItem('isNewUser', 'true')
      sessionStorage.setItem('username', username.trim())
      sessionStorage.setItem('movieGenres', JSON.stringify(selectedMovieGenres))
      sessionStorage.setItem('tvGenres', JSON.stringify(selectedTvGenres))
      sessionStorage.setItem('categories', JSON.stringify(selectedCategories))
      sessionStorage.setItem('languages', JSON.stringify(selectedLanguages))
      sessionStorage.setItem('redirect', '/home')
      sessionStorage.removeItem('UserTopGenre')

      navigate('/home')
    } catch (err) {
      console.error("Error connecting to server.js backend:", err)
      setError('Failed to communicate with the server. Please check that your backend node process is running on port 5005.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="newuser-wrapper">

      {/* Floating background popcorn units */}
      <div className="popcorn-float" aria-hidden="true">
        <span className="pop p1">🍿</span>
        <span className="pop p2">🍿</span>
        <span className="pop p3">🍿</span>
        <span className="pop p4">🍿</span>
        <span className="pop p5">🍿</span>
        <span className="pop p6">🍿</span>
      </div>

      <div className="newuser-card">

        {/* Main Card Header */}
        <div className="newuser-header">
          <img src="/Baby Pop.png" alt="Binge Buddies mascot" className="mascot" />
          <h1 className="newuser-title">Before we start, let's get to know you better!</h1>
          <p className="newuser-subtitle">Help us personalise your Binge Buddies experience</p>
        </div>

        {/* Question 1 — Username Selection */}
        <div className="question-block">
          <h2 className="question-title">1. What should we call you? 👋</h2>
          <p className="question-hint">Choose a username for your Binge Buddies profile</p>
          <div className="username-input-wrap">
            <input
              type="text"
              placeholder="e.g. ilovemovies123"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="username-input"
              maxLength={20}
              disabled={isSubmitting}
            />
            <p className="username-counter">{username.length}/20</p>
          </div>
        </div>

        {/* Question 2 — Separated Genre Selections */}
        <div className="question-block">
          <h2 className="question-title">2. What genres do you enjoy? 🎭</h2>
          <p className="question-hint">Select movie and TV genres you like</p>

          {/* Movie Section */}
          <h4 className="sub-title">Movie Genres</h4>
          <div className="chip-group">
            {movieGenres.map((genre) => (
              <button
                key={`movie-${genre}`}
                className={`chip ${selectedMovieGenres.includes(genre) ? 'chip-selected' : ''}`}
                onClick={() => toggle(genre, selectedMovieGenres, setSelectedMovieGenres)}
                disabled={isSubmitting}
              >
                {genre}
              </button>
            ))}
            {/* Display custom movie genres dynamically appended */}
            {selectedMovieGenres
              .filter((g) => !movieGenres.includes(g))
              .map((g) => (
                <button
                  key={`custom-movie-${g}`}
                  className="chip chip-selected"
                  onClick={() => toggle(g, selectedMovieGenres, setSelectedMovieGenres)}
                  disabled={isSubmitting}
                >
                  {g} ✕
                </button>
              ))}
          </div>

          {/* TV Shows Section */}
          <h4 className="sub-title">TV Genres</h4>
          <div className="chip-group">
            {tvGenres.map((genre) => (
              <button
                key={`tv-${genre}`}
                className={`chip ${selectedTvGenres.includes(genre) ? 'chip-selected' : ''}`}
                onClick={() => toggle(genre, selectedTvGenres, setSelectedTvGenres)}
                disabled={isSubmitting}
              >
                {genre}
              </button>
            ))}
            {/* Display custom TV genres dynamically appended */}
            {selectedTvGenres
              .filter((g) => !tvGenres.includes(g))
              .map((g) => (
                <button
                  key={`custom-tv-${g}`}
                  className="chip chip-selected"
                  onClick={() => toggle(g, selectedTvGenres, setSelectedTvGenres)}
                  disabled={isSubmitting}
                >
                  {g} ✕
                </button>
              ))}
          </div>

        </div>

        {/* Question 3 — Structural Category Selection */}
        <div className="question-block">
          <h2 className="question-title">3. What do you like to watch? 📺</h2>
          <p className="question-hint">Select all that apply</p>
          <div className="chip-group">
            {categoriesList.map((cat) => (
              <button
                key={cat}
                className={`chip ${selectedCategories.includes(cat) ? 'chip-selected' : ''}`}
                onClick={() => toggleCategory(cat)}
                disabled={isSubmitting}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Question 4 — Language Filter Selection */}
        <div className="question-block">
          <h2 className="question-title">4. What languages do you watch in? 🌍</h2>
          <p className="question-hint">Select all that apply</p>
          <div className="chip-group">
            {languagesList.map((lang) => (
              <button
                key={lang}
                className={`chip ${selectedLanguages.includes(lang) ? 'chip-selected' : ''}`}
                onClick={() => toggle(lang, selectedLanguages, setSelectedLanguages)}
                disabled={isSubmitting}
              >
                {lang}
              </button>
            ))}

            {/* Custom language chips */}
            {selectedLanguages
              .filter((l) => !languagesList.includes(l))
              .map((l) => (
                <button
                  key={`custom-lang-${l}`}
                  className="chip chip-selected"
                  onClick={() => toggle(l, selectedLanguages, setSelectedLanguages)}
                  disabled={isSubmitting}
                >
                  {l} ✕
                </button>
              ))}

            {/* Add language UI */}
            {!showCustomLanguage ? (
              <button
                className="chip chip-more"
                onClick={() => setShowCustomLanguage(true)}
                disabled={isSubmitting}
              >
                + Add Language
              </button>
            ) : (
              <div className="custom-input-wrap">
                <input
                  type="text"
                  placeholder="Add a language"
                  value={customLanguage}
                  onChange={(e) => setCustomLanguage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustomLanguage()}
                  disabled={isSubmitting}
                />
                <button className="btn-add" onClick={handleAddCustomLanguage} disabled={isSubmitting}>Add</button>
              </div>
            )}
          </div>
        </div>

        {/* System Error Display Messages */}
        {error && <p className="error-msg">{error}</p>}

        {/* Form Generation Trigger Action */}
        <button
          className="btn-generate"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Generating Dashboard...' : 'Generate My Dashboard'}
        </button>

      </div>
    </div>
  )
}