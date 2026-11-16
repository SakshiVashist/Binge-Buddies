import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import '../styles/LoginPage.css'
import { useAuth } from '../context/AuthContext'
import GoogleIcon from '../components/GoogleIcon'

const LoginPage = () => {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [error, setError] = useState<string>('')
  const navigate = useNavigate()
  const location = useLocation()

  const { user, loading, login, loginWithGoogle } = useAuth();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/home';

  useEffect(() => {
    if (!loading && user) {
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, from]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in both fields')
      return
    }

    try {
      // 1. Authenticate user credentials
      await login(email, password);
      
      // 2. Clear new user flags to trigger the "Welcome back" dashboard version
      sessionStorage.removeItem('isNewUser');
      
      // 3. Route user to their intended destination
      navigate(from);
    } catch {
      setError('Something went wrong. Please try again.')
    }
  }

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      sessionStorage.removeItem('isNewUser');
      navigate(from);
    } catch {
      setError('Google sign-in failed')
    }
  }

  return (
    <div className="login-wrapper">

      {/* Floating popcorns */}
      <div className="popcorn-float" aria-hidden="true">
        <span className="pop p1">🍿</span>
        <span className="pop p2">🍿</span>
        <span className="pop p3">🍿</span>
        <span className="pop p4">🍿</span>
        <span className="pop p5">🍿</span>
        <span className="pop p6">🍿</span>
      </div>

      {/* Login card */}
      <div className="login-card">

        
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
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Error message */}
        {error && <p className="error-msg">{error}</p>}

        {/* Login button */}
        <button className="btn btn-primary w-full" onClick={handleLogin}>
          Log In
        </button>

        {/* Google sign-in */}
        <button
          className="btn btn-google w-full"
          onClick={handleGoogle}
          style={{marginTop:8, display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8}}
        >
          <GoogleIcon />
          Continue with Google
        </button>

        {/* Sign up caption */}
        <p className="signup-caption">
          Don't have an account?{' '}
          <a onClick={() => navigate('/signup')}>Sign up</a>
        </p>

      </div>
    </div>
  )
}

export default LoginPage