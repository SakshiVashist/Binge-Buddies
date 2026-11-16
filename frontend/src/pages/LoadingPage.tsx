import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/LoadingPage.css'

const LoadingPage = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      
      const redirectTo = sessionStorage.getItem('redirect')

      if (redirectTo) {
        sessionStorage.removeItem('redirect')
        
        navigate(redirectTo)
      } else {
        navigate('/login')
      }

    }, 2000) 

    
    return () => clearTimeout(timer)
  }, [navigate])
  return (
    <div className="loading-wrapper">

      {/* Floating popcorns */}
      <div className="popcorn-float" aria-hidden="true">
        <span className="pop p1">🍿</span>
        <span className="pop p2">🍿</span>
        <span className="pop p3">🍿</span>
        <span className="pop p4">🍿</span>
        <span className="pop p5">🍿</span>
        <span className="pop p6">🍿</span>
      </div>

      {/* Loading card */}
      <div className="loading-card">

      {/* Logo */}
      <div className="logo-wrap">
        <img src="/Big Pop.png" alt="Binge Buddies mascot" className="mascot" />
        <h1 className="logo-text">Binge Buddies</h1>
      </div>

        {/* Catchphrase */}
        <p className="catchphrase">Grab your popcorn, we're loading...</p>

        {/* Progress bar */}
        <div className="progress-track" role="progressbar" aria-label="Loading">
          <div className="progress-fill"></div>
        </div>

      </div>
    </div>
  )
}

export default LoadingPage