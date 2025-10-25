import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import '../../styles/navbar.css'

export default function Navbar() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={() => navigate('/')}>
          <span className="brand-logo">⚡</span>
          <span className="brand-name">Code Connect</span>
        </div>

        <div className="navbar-links">
          <button onClick={() => navigate('/projects')} className="nav-link">
            Projects
          </button>

          {user ? (
            <>
              <button onClick={() => navigate('/profile')} className="nav-link">
                Profile
              </button>
              <button onClick={handleSignOut} className="nav-link">
                Sign Out
              </button>
            </>
          ) : (
            <button onClick={() => navigate('/auth')} className="nav-link nav-link-primary">
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}