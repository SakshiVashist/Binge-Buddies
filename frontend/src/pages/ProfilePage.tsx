import { useEffect, useState, useRef } from 'react'
import type { ChangeEvent } from 'react'
import Sidebar from '../components/sidebar'
import '../styles/ProfilePage.css'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'

const movieGenres = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
  'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery',
  'Romance', 'Sci-Fi', 'TV Movie', 'Thriller', 'War', 'Western'
]

const tvGenres = [
  'Action & Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama',
  'Family', 'Kids', 'Mystery', 'News', 'Reality', 'Romance', 'Sci-Fi & Fantasy',
  'Soap', 'Talk', 'War & Politics'
]

const allCategories = ['Movies', 'TV Shows']

const allLanguages = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Japanese',
  'Korean', 'Mandarin', 'Chinese', 'Hindi', 'Portuguese', 'Russian',
  'Arabic', 'Thai', 'Turkish', 'Vietnamese', 'Indonesian'
]

const ProfilePage = () => {
  // Extract real user data from AuthContext
  const { user, username: userUsername, setUsername: setUserUsername, logout } = useAuth();
  const navigate = useNavigate();

  // Sign out (used by the mobile-only button, since the bottom bar routes here)
  const handleSignOut = async () => {
    try {
      await logout();
      sessionStorage.clear();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const initialUsername = sessionStorage.getItem('username') || userUsername || user?.displayName || user?.email?.split("@")[0] || "Binger";

  // State Management
  const [username, setUsername] = useState<string>(initialUsername)
  const [isEditingUsername, setIsEditingUsername] = useState<boolean>(false)
  const [tempUsername, setTempUsername] = useState<string>(initialUsername)
  const [usernameError, setUsernameError] = useState<string>('')
  const [usernameSuccess, setUsernameSuccess] = useState<string>('')

  // Custom Profile Picture States
  const [photoURL, setPhotoURL] = useState<string | null>(null)
  const [avatarError, setAvatarError] = useState<string>('')
  const [isLoadingUserData, setIsLoadingUserData] = useState<boolean>(true)

  // Binge Buddy contact (opt-in) — how other users can reach you once matched
  const [contactType, setContactType] = useState<string>('instagram')
  const [contactValue, setContactValue] = useState<string>('')
  const [isEditingContact, setIsEditingContact] = useState<boolean>(false)
  const [tempContactType, setTempContactType] = useState<string>('instagram')
  const [tempContactValue, setTempContactValue] = useState<string>('')
  const [contactSuccess, setContactSuccess] = useState<string>('')

  // Find a Binge Buddy opt-in — when on, your username, contact, top genre and
  // shared titles are visible to anyone you match with
  const [bingeBuddyOptIn, setBingeBuddyOptIn] = useState<boolean>(false)
  const [optInSaving, setOptInSaving] = useState<boolean>(false)

  // State for tracking the full screen/enlarged click modal
  const [isEnlarged, setIsEnlarged] = useState<boolean>(false)

  // Decoupled Preference State Management
  const [selectedMovieGenres, setSelectedMovieGenres] = useState<string[]>([])
  const [selectedTvGenres, setSelectedTvGenres] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])

  const [customLanguage, setCustomLanguage] = useState<string>('')
  const [showCustomLanguage, setShowCustomLanguage] = useState<boolean>(false)
  const [prefSuccess, setPrefSuccess] = useState<string>('')
  const [prefError, setPrefError] = useState<string>('')

  // Active section
  const [activeSection, setActiveSection] = useState<string>('account')

  // Ref to trigger the hidden file input programmatically
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Syncing user details and fetching active user's data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.uid) return;

      setIsLoadingUserData(true);
      sessionStorage.setItem('firebaseUserId', user.uid);

      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();

          // Pull independent genre arrays out of Firestore fallback schemas
          const mGenres = userData.movieGenres || userData.genres || [];
          const tGenres = userData.tvGenres || [];
          const categories = userData.categories || [];
          const languages = userData.languages || [];

          setSelectedMovieGenres(mGenres);
          setSelectedTvGenres(tGenres);
          setSelectedCategories(categories);
          setSelectedLanguages(languages);

          setPhotoURL(userData.photoURL || null);
          setContactType(userData.contactType || 'instagram');
          setContactValue(userData.contactValue || '');
          setBingeBuddyOptIn(userData.bingeBuddyOptIn === true);

          sessionStorage.setItem('movieGenres', JSON.stringify(mGenres));
          sessionStorage.setItem('tvGenres', JSON.stringify(tGenres));
          sessionStorage.setItem('categories', JSON.stringify(categories));
          sessionStorage.setItem('languages', JSON.stringify(languages));
        } else {
          setSelectedMovieGenres([]);
          setSelectedTvGenres([]);
          setSelectedCategories([]);
          setSelectedLanguages([]);
          setPhotoURL(null);
          sessionStorage.removeItem('movieGenres');
          sessionStorage.removeItem('tvGenres');
          sessionStorage.removeItem('categories');
          sessionStorage.removeItem('languages');
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setIsLoadingUserData(false);
      }
    };

    fetchUserData();
  }, [user]);

  useEffect(() => {
    if (userUsername) {
      setUsername(userUsername);
      if (!isEditingUsername) {
        setTempUsername(userUsername);
      }
    }
  }, [userUsername, isEditingUsername]);

  // Handle Profile Picture Upload and convert to standard base64 data string
  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select a valid image file.');
      return;
    }

    if (file.size > 1.5 * 1024 * 1024) {
      setAvatarError('Image is too large. Please select an image under 1.5MB.');
      return;
    }

    setAvatarError('');

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setPhotoURL(base64String);

      const activeUid = sessionStorage.getItem('firebaseUserId') || user?.uid || '';
      if (activeUid) {
        try {
          const userRef = doc(db, 'users', activeUid);
          await setDoc(userRef, { photoURL: base64String }, { merge: true });
        } catch (err) {
          console.error("Error saving profile picture:", err);
          setAvatarError('Failed to sync profile picture with database.');
        }
      }
    };
    reader.readAsDataURL(file);

    e.target.value = '';
  };

  // Profile Picture Removal Handler
  const handleRemoveAvatar = async () => {
    const activeUid = sessionStorage.getItem('firebaseUserId') || user?.uid || '';
    if (activeUid) {
      try {
        const userRef = doc(db, 'users', activeUid);
        await setDoc(userRef, { photoURL: null }, { merge: true });
        setPhotoURL(null);
        setAvatarError('');
      } catch (err) {
        console.error("Error removing profile picture:", err);
        setAvatarError('Failed to remove profile picture.');
      }
    }
  };

  // Click handler that checks whether to add or remove pictures
  const handlePictureAction = () => {
    if (photoURL) {
      handleRemoveAvatar();
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleSaveUsername = async () => {
    setUsernameError('')
    setUsernameSuccess('')

    if (!tempUsername.trim()) {
      setUsernameError('Username cannot be empty')
      return
    }
    if (tempUsername.trim().length < 3) {
      setUsernameError('Username must be at least 3 characters')
      return
    }

    const activeUid = sessionStorage.getItem('firebaseUserId') || user?.uid || '';

    if (!activeUid) {
      setUsernameError('User ID not found. Please log in again.');
      return;
    }

    try {
      const userRef = doc(db, 'users', activeUid);
      await setDoc(userRef, { username: tempUsername.trim() }, { merge: true });

      sessionStorage.setItem('username', tempUsername.trim())
      setUsername(tempUsername.trim())
      if (setUserUsername) {
        setUserUsername(tempUsername.trim())
      }

      setIsEditingUsername(false)
      setUsernameSuccess('Username updated successfully!')
      setTimeout(() => setUsernameSuccess(''), 3000)
    } catch (err) {
      console.error('Error updating username:', err);
      setUsernameError('Failed to update username. Please try again later.')
    }
  }

  // Toggle the Find a Binge Buddy opt-in and persist it immediately
  const handleToggleOptIn = async () => {
    const activeUid = sessionStorage.getItem('firebaseUserId') || user?.uid || '';
    if (!activeUid) return;
    const next = !bingeBuddyOptIn;
    setBingeBuddyOptIn(next);
    setOptInSaving(true);
    try {
      const userRef = doc(db, 'users', activeUid);
      await setDoc(userRef, { bingeBuddyOptIn: next }, { merge: true });
    } catch (err) {
      console.error('Error saving opt-in preference:', err);
      setBingeBuddyOptIn(!next); // revert on failure
    } finally {
      setOptInSaving(false);
    }
  }

  // Save the opt-in Binge Buddy contact handle
  const handleSaveContact = async () => {
    const activeUid = sessionStorage.getItem('firebaseUserId') || user?.uid || '';
    if (!activeUid) return;
    try {
      const userRef = doc(db, 'users', activeUid);
      const trimmed = tempContactValue.trim();
      await setDoc(
        userRef,
        { contactType: tempContactType, contactValue: trimmed },
        { merge: true }
      );
      setContactType(tempContactType);
      setContactValue(trimmed);
      setIsEditingContact(false);
      setContactSuccess(trimmed ? 'Contact saved!' : 'Contact cleared.');
      setTimeout(() => setContactSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving contact:', err);
    }
  }

  // Human-readable label for the currently-saved contact
  const contactTypeLabels: Record<string, string> = {
    instagram: 'Instagram',
    telegram: 'Telegram',
    discord: 'Discord',
    email: 'Email',
  }

  // Password change states
  const [showPasswordForm, setShowPasswordForm] = useState<boolean>(false)
  const [currentPassword, setCurrentPassword] = useState<string>('')
  const [newPassword, setNewPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [passwordError, setPasswordError] = useState<string>('')
  const [passwordSuccess, setPasswordSuccess] = useState<string>('')

  // Toggle chip helper
  const toggle = (item: string, list: string[], setList: (l: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item))
    } else {
      setList([...list, item])
    }
  }

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      // Remove category and wipe associated genre selection
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
      if (cat === 'Movies') setSelectedMovieGenres([]);
      if (cat === 'TV Shows') setSelectedTvGenres([]);
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  // Add custom language
  const handleAddCustomLanguage = () => {
    if (customLanguage.trim() && !selectedLanguages.includes(customLanguage.trim())) {
      setSelectedLanguages([...selectedLanguages, customLanguage.trim()])
      setCustomLanguage('')
      setShowCustomLanguage(false)
    }
  }

  // Handle password change via backend endpoint
  const handlePasswordChange = async () => {
    setPasswordError('')
    setPasswordSuccess('')

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all fields')
      return
    }
    if (newPassword.length < 12) {
      setPasswordError('New password must be at least 12 characters')
      return
    }

    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasNumberOrSymbol = /[0-9!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\/;']/.test(newPassword);

    if (!hasUppercase || !hasNumberOrSymbol) {
      setPasswordError('New password must include at least one uppercase letter, and a number or symbol')
      return
    }

    if (newPassword === currentPassword) {
      setPasswordError('New password cannot be the same as the current password')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    if (!user) {
      setPasswordError('User context not found. Please log in again.')
      return
    }

    try {
      const idToken = await user.getIdToken(true);

      const response = await fetch('https://binge-buddies-orbital-26-1.onrender.com/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordSuccess('Password updated successfully! 🎬');
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')

        setTimeout(() => {
          setShowPasswordForm(false);
          setPasswordSuccess('');
        }, 2500);
      } else {
        setPasswordError(data.message || 'Failed to update password.');
      }
    } catch (err) {
      console.error('Password change error:', err);
      setPasswordError('Network error. Please try again later.');
    }
  }

  // Handle preferences save
  const handleSavePreferences = async () => {
    setPrefSuccess('')
    setPrefError('')

    if (selectedCategories.length === 0) {
      setPrefError('Please select at least one category to watch')
      return;
    }

    if (selectedMovieGenres.length === 0 && selectedTvGenres.length === 0) {
      setPrefError('You must select at least one genre for a category');
      return
    }

    if (selectedCategories.includes('Movies') && selectedMovieGenres.length === 0) {
      setPrefError('You have selected Movies as a category. Please select at least one Movie genre')
      return;
    }
    if (selectedCategories.includes('TV Shows') && selectedTvGenres.length === 0) {
      setPrefError('You have selected TV Shows as a category. Please select at least one TV genre')
      return;
    }

    if (selectedLanguages.length === 0) {
      setPrefError('Please select at least one language');
      return;
    }

    const activeUid = sessionStorage.getItem('firebaseUserId') || user?.uid || '';

    if (!activeUid) {
      setPrefError('User ID not found. Please log in again.');
      return;
    }

    try {
      const userRef = doc(db, 'users', activeUid);
      await setDoc(userRef, {
        movieGenres: selectedMovieGenres,
        tvGenres: selectedTvGenres,
        categories: selectedCategories,
        languages: selectedLanguages
      }, { merge: true });

      sessionStorage.setItem('movieGenres', JSON.stringify(selectedMovieGenres));
      sessionStorage.setItem('tvGenres', JSON.stringify(selectedTvGenres));
      sessionStorage.setItem('categories', JSON.stringify(selectedCategories));
      sessionStorage.setItem('languages', JSON.stringify(selectedLanguages));

      setPrefSuccess('Preferences saved successfully!')
      setTimeout(() => setPrefSuccess(''), 3000)
    } catch (err) {
      console.error('Error saving preferences:', err);
      setPrefError('Failed to save preferences. Please try again later.')
    }
  }

  return (
    <div className="profile-page">
      <Sidebar />

      <div className="profile-main">
        <div className="profile-header">
          <div
            className="profile-avatar-wrapper zoomable-avatar"
            title="Click to view image"
            onClick={() => !isLoadingUserData && setIsEnlarged(!isEnlarged)}
          >
            {isLoadingUserData ? (
              <div className="profile-avatar-loading-skeleton" />
            ) : photoURL ? (
              <img src={photoURL} alt={`${username}'s avatar`} className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar-fallback">
                {username.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="profile-avatar-overlay">
              <i className="ti ti-camera icon-theme-style avatar-camera-icon" aria-hidden="true"></i>
            </div>
          </div>
          <input
            type="file"
            id="avatar-file-input"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden-file-input"
          />

          <div>
            <p className="profile-name">{username}</p>
            <p className="profile-email-display">{user?.email}</p>
            {avatarError && <p className="avatar-error-msg">{avatarError}</p>}
          </div>
        </div>

        {/* Sign out — shown on mobile, where the bottom bar routes here */}
        <button className="profile-signout-btn" onClick={handleSignOut}>
          <i className="ti ti-logout" aria-hidden="true"></i>
          Sign Out
        </button>

        {/* Section tabs */}
        <div className="profile-tabs">
          <button
            className={`profile-tab ${activeSection === 'account' ? 'tab-active' : ''}`}
            onClick={() => setActiveSection('account')}
          >
            Account Info
          </button>
          <button
            className={`profile-tab ${activeSection === 'password' ? 'tab-active' : ''}`}
            onClick={() => setActiveSection('password')}
          >
            Change Password
          </button>
          <button
            className={`profile-tab ${activeSection === 'preferences' ? 'tab-active' : ''}`}
            onClick={() => setActiveSection('preferences')}
          >
            My Preferences
          </button>
        </div>

        {/* Account Info Section */}
        {activeSection === 'account' && (
          <div className="profile-section">
            <h2 className="section-title">Account Info</h2>
            <p className="section-subtitle">Your account details from Binge Buddies</p>

            <div className="info-card">
              <div className={`info-row info-row-flex ${isEditingUsername ? 'align-start' : 'align-center'}`}>
                <div className="info-label label-with-gap">
                  <i className="ti ti-user" aria-hidden="true"></i>
                  Username
                </div>

                {isEditingUsername ? (
                  <div className="username-edit-inline username-edit-container">
                    <input
                      type="text"
                      className="username-inline-input username-custom-input"
                      value={tempUsername}
                      onChange={(e) => setTempUsername(e.target.value)}
                    />
                    {usernameError && <p className="error-msg username-error-text">{usernameError}</p>}
                    <div className="button-group-gap">
                      <button className="btn-save btn-small" onClick={handleSaveUsername}>Save</button>
                      <button
                        className="btn-cancel btn-small"
                        onClick={() => {
                          setIsEditingUsername(false)
                          setTempUsername(username)
                          setUsernameError('')
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="info-value-container">
                    <div className="info-value bold-text">{username}</div>
                    <button
                      className="btn-primary-outline btn-small-round"
                      onClick={() => {
                        setTempUsername(username);
                        setIsEditingUsername(true);
                      }}
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>

              <div className="info-divider"></div>

              <div className="info-row info-row-flex align-center">
                <div className="info-label label-with-gap">
                  <i className="ti ti-mail" aria-hidden="true"></i>
                  Email
                </div>
                <div className="info-value bold-text">{user?.email}</div>
              </div>

              <div className="info-divider"></div>
              <div className="info-row info-row-flex align-center">
                <div className="info-label label-with-gap">
                  <i className="ti ti-photo" aria-hidden="true"></i>
                  Profile Picture
                </div>
                <button className="btn-primary-outline btn-small-round" onClick={handlePictureAction}>
                  {photoURL ? 'Remove Picture' : 'Add Picture'}
                </button>
              </div>

              <div className="info-divider"></div>

              <div className={`info-row info-row-flex ${isEditingContact ? 'align-start' : 'align-center'}`}>
                <div className="info-label label-with-gap">
                  <i className="ti ti-users" aria-hidden="true"></i>
                  Binge Buddy Contact
                </div>

                {isEditingContact ? (
                  <div className="username-edit-inline username-edit-container">
                    <select
                      className="username-inline-input username-custom-input"
                      value={tempContactType}
                      onChange={(e) => setTempContactType(e.target.value)}
                    >
                      <option value="instagram">Instagram</option>
                      <option value="telegram">Telegram</option>
                      <option value="discord">Discord</option>
                      <option value="email">Email</option>
                    </select>
                    <input
                      type="text"
                      className="username-inline-input username-custom-input"
                      placeholder={tempContactType === 'email' ? 'you@example.com' : 'your handle / username'}
                      value={tempContactValue}
                      onChange={(e) => setTempContactValue(e.target.value)}
                    />
                    <div className="button-group-gap">
                      <button className="btn-save btn-small" onClick={handleSaveContact}>Save</button>
                      <button
                        className="btn-cancel btn-small"
                        onClick={() => setIsEditingContact(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="info-value-container">
                    <div className="info-value bold-text">
                      {contactValue
                        ? `${contactValue} · ${contactTypeLabels[contactType] || contactType}`
                        : 'Not set'}
                    </div>
                    <button
                      className="btn-primary-outline btn-small-round"
                      onClick={() => {
                        setTempContactType(contactType)
                        setTempContactValue(contactValue)
                        setIsEditingContact(true)
                      }}
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>

              <div className="info-divider"></div>

              <div className="info-row info-row-flex align-center">
                <div className="info-label label-with-gap">
                  <i className="ti ti-user-search" aria-hidden="true"></i>
                  Social Connection Hub
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={bingeBuddyOptIn}
                  aria-label="Opt in to the Social Connection Hub"
                  disabled={optInSaving}
                  className={`optin-toggle ${bingeBuddyOptIn ? 'is-on' : ''}`}
                  onClick={handleToggleOptIn}
                >
                  <span className="optin-toggle-knob"></span>
                </button>
              </div>
            </div>

            <p className={`optin-disclaimer ${bingeBuddyOptIn ? 'is-active' : ''}`}>
              <i className="ti ti-info-circle" aria-hidden="true"></i>
              {bingeBuddyOptIn
                ? "You're opted in. Your username, binge buddy contact, top genre and shared want-to-watch titles are visible to anyone you match with on the social connection hub."
                : 'Opt in to appear on the Social Connection Hub. Heads up: turning this on makes your binge buddy contact visible to everyone you match with.'}
            </p>
            {usernameSuccess && <p className="success-msg">{usernameSuccess}</p>}
            {contactSuccess && <p className="success-msg">{contactSuccess}</p>}
          </div>
        )}

        {/* Change Password Section */}
        {activeSection === 'password' && (
          <div className="profile-section">
            <h2 className="section-title">Change Password</h2>
            <p className="section-subtitle">Keep your account secure with a strong password</p>

            <div className="info-card">
              {!showPasswordForm ? (
                <div className="password-locked">
                  <i className="ti ti-lock locked-icon" aria-hidden="true"></i>
                  <p className="password-locked-text">Your password is protected</p>
                  <button className="btn-primary-outline" onClick={() => setShowPasswordForm(true)}>
                    Change Password
                  </button>
                </div>
              ) : (
                <div className="password-form">
                  <div className="form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  {passwordError && <p className="error-msg">{passwordError}</p>}
                  {passwordSuccess && <p className="success-msg">{passwordSuccess}</p>}

                  <div className="form-actions">
                    <button className="btn-save" onClick={handlePasswordChange}>Update Password</button>
                    <button
                      className="btn-cancel"
                      onClick={() => {
                        setShowPasswordForm(false)
                        setPasswordError('')
                        setCurrentPassword('')
                        setNewPassword('')
                        setConfirmPassword('')
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* My Preferences Section */}
        {activeSection === 'preferences' && (
          <div className="profile-section">
            <h2 className="section-title">My Preferences</h2>
            <p className="section-subtitle">Update your interests to get better recommendations</p>

            {/* Movie Genres */}
            <div className="pref-block">
              <h3 className="pref-title">Favourite Movie Genres 🎬</h3>
              <div className="chip-group">
                {movieGenres.map((genre) => (
                  <button
                    key={`movie-${genre}`}
                    className={`chip ${selectedMovieGenres.includes(genre) ? 'chip-selected' : ''}`}
                    onClick={() => toggle(genre, selectedMovieGenres, setSelectedMovieGenres)}
                  >
                    {genre}
                  </button>
                ))}
                {selectedMovieGenres
                  .filter((g) => !movieGenres.includes(g))
                  .map((g) => (
                    <button
                      key={`custom-movie-${g}`}
                      className="chip chip-selected"
                      onClick={() => toggle(g, selectedMovieGenres, setSelectedMovieGenres)}
                    >
                      {g} ✕
                    </button>
                  ))}
              </div>
            </div>

            {/* TV Genres */}
            <div className="pref-block">
              <h3 className="pref-title">Favourite TV Genres 📺</h3>
              <div className="chip-group">
                {tvGenres.map((genre) => (
                  <button
                    key={`tv-${genre}`}
                    className={`chip ${selectedTvGenres.includes(genre) ? 'chip-selected' : ''}`}
                    onClick={() => toggle(genre, selectedTvGenres, setSelectedTvGenres)}
                  >
                    {genre}
                  </button>
                ))}
                {selectedTvGenres
                  .filter((g) => !tvGenres.includes(g))
                  .map((g) => (
                    <button
                      key={`custom-tv-${g}`}
                      className="chip chip-selected"
                      onClick={() => toggle(g, selectedTvGenres, setSelectedTvGenres)}
                    >
                      {g} ✕
                    </button>
                  ))}
              </div>
            </div>

            {/* Categories */}
            <div className="pref-block">
              <h3 className="pref-title">What I Like to Watch 📺</h3>
              <div className="chip-group">
                {allCategories.map((cat) => (
                  <button
                    key={cat}
                    className={`chip ${selectedCategories.includes(cat) ? 'chip-selected' : ''}`}
                    onClick={() => toggleCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="pref-block">
              <h3 className="pref-title">What Languages I Watch In 🌍</h3>
              <div className="chip-group">
                {allLanguages.map((lang) => (
                  <button
                    key={lang}
                    className={`chip ${selectedLanguages.includes(lang) ? 'chip-selected' : ''}`}
                    onClick={() => toggle(lang, selectedLanguages, setSelectedLanguages)}
                  >
                    {lang}
                  </button>
                ))}
                {/* Custom language chips */}
                {selectedLanguages
                  .filter((l) => !allLanguages.includes(l))
                  .map((l) => (
                    <button
                      key={`custom-lang-${l}`}
                      className="chip chip-selected"
                      onClick={() => toggle(l, selectedLanguages, setSelectedLanguages)}
                    >
                      {l} ✕
                    </button>
                  ))}

                {/* Add language UI */}
                {!showCustomLanguage ? (
                  <button className="chip chip-more" onClick={() => setShowCustomLanguage(true)}>
                    + Add Language
                  </button>
                ) : (
                  <div className="custom-input-wrap">
                    <input
                      type="text"
                      placeholder="Type a language..."
                      value={customLanguage}
                      onChange={(e) => setCustomLanguage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCustomLanguage()}
                    />
                    <button className="btn-add" onClick={handleAddCustomLanguage}>Add</button>
                  </div>
                )}
              </div>
            </div>

            {/* Preference Responses Display */}
            {prefError && <p className="error-msg">{prefError}</p>}
            {prefSuccess && <p className="success-msg">{prefSuccess}</p>}

            <button className="btn-save" onClick={handleSavePreferences}>
              Save Preferences
            </button>
          </div>
        )}
        <div className="mobile-bottom-spacer" />

      </div>

      {/* Enlarged Media Modal View Backdrop Overlay */}
      {isEnlarged && (
        <div className="avatar-lightbox-overlay lightbox-active" onClick={() => setIsEnlarged(false)}>
          <div className="modal-circle-container">
            {photoURL ? (
              <img src={photoURL} alt="Enlarged user avatar" className="enlarged-avatar-img" />
            ) : (
              <div className="fallback-large-text">
                {username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfilePage