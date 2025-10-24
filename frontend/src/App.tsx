import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Home from './pages/Home'
import Auth from './pages/Auth'
import Profile from './pages/Profile'
import Projects from './pages/Projects'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          <Route path="/" element={<Home />} />
          
          <Route path="/auth" element={<Auth />} />

          <Route path="/profile" element={<Profile />} />

          <Route path="/projects" element={<Projects />} />

        
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App