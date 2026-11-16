import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import '../styles/SignupPage.css'
import { useAuth } from '../context/AuthContext'
import GoogleIcon from '../components/GoogleIcon'
import { FirebaseError } from 'firebase/app'

const SignupPage = () => {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [error, setError] = useState<string>('')
  const navigate = useNavigate()
  const location = useLocation()

  const { user, loading, signup, loginWithGoogle } = useAuth();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/home';

  useEffect(() => {
    if (!loading && user) {
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, from]);

  const handleSignup = async () => {
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    if (password.length < 12) {
      setError('Password must be at least 12 characters')
      return
    }

    const hasLetter = /[a-zA-Z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumberOrSymbol = /[0-9!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\/;']/.test(password);

    if (!hasLetter || !hasUppercase || !hasNumberOrSymbol) {
      setError('Password must include letters, at least one uppercase letter, and a number or symbol')
      return
    }

    try {
      // 1. Fire off the authentication signup request
      await signup(email, password);

      // 2. Explicitly flag this session as a new user to show the welcoming dashboard state
      sessionStorage.setItem('isNewUser', 'true');

      // 3. Navigate straight to the home dashboard 
      navigate(from);
    } catch (err) {
      if (err instanceof FirebaseError) {
        if (err.code === 'auth/email-already-in-use') {
          setError('Email already in use. Please log in instead.')
        } else if (err.code === 'auth/password-does-not-meet-requirements') {
          setError('Password does not meet requirements. Please try again.');
        } else {
          setError('Something went wrong. Please try again.');
        }
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  }

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      // Google registration counts as a new registration view as well
      sessionStorage.setItem('isNewUser', 'true');
      navigate(from);
    } catch (err) {
      if (err instanceof FirebaseError) {
        if (err.code === 'auth/popup-closed-by-user') {
          setError('Google sign-in was cancelled. Please try again.')
        } else if (err.code === 'auth/account-exists-with different-credential') {
          setError('An account already exists with this email using a different sign-in method.');
        } else {
          setError('Google sign-in failed')
        }
      } else {
        setError('Google sign-in failed')
      }
    }
  }

  return (
    <div className="signup-wrapper">

      {/* Floating popcorns */}
      <div className="popcorn-float" aria-hidden="true">
        <span className="pop p1">🍿</span>
        <span className="pop p2">🍿</span>
        <span className="pop p3">🍿</span>
        <span className="pop p4">🍿</span>
        <span className="pop p5">🍿</span>
        <span className="pop p6">🍿</span>
      </div>

      {/* Signup card */}
      <div className="signup-card">

        {/* Logo */}
        <div className="logo-wrap">
          <img src="/Big Pop.png" alt="Binge Buddies mascot" className="mascot" />
          <h1 className="logo-text">Binge Buddies</h1>
        </div>

        {/* Username field */}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password field */}
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="password-hint">
            Must be 12+ characters with at least one uppercase letter and one number or symbol.
          </p>
        </div>

        {/* Error message */}
        {error && <p className="error-msg">{error}</p>}

        {/* Signup button */}
        <button className="btn btn-primary w-full" onClick={handleSignup}>
          Sign Up
        </button>

        {/* Google sign-in */}
        <button
          className="btn btn-google w-full"
          onClick={handleGoogle}
          style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          <GoogleIcon />
          Continue with Google
        </button>

        {/* Login caption */}
        <p className="login-caption">
          Already have an account?{' '}
          <a onClick={() => {
            sessionStorage.removeItem('isNewUser');
            navigate('/login');
          }}>Log in</a>
        </p>

      </div>
    </div>
  )
}

export default SignupPage