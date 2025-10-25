import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/layout/Navbar'
import Home from './pages/Home'
import Auth from './pages/Auth'
import Profile from './pages/Profile'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        <Routes>

          <Route path="/" element={<Home />} />
          
          <Route path="/auth" element={<Auth />} />

          <Route path="/profile" element={<Profile />} />
          
          <Route path="/profile/:id" element={<Profile />} />

          <Route path="/projects" element={<Projects />} />

          <Route path="/projects/:id" element={<ProjectDetail />} />

        
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App