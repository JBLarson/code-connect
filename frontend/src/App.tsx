import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Auth from './pages/Auth'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          <Route path="/" element={<Home />} />
          
          <Route path="/auth" element={<Auth />} />

          <Route path="/profile" element={<Profile />} />
        
        
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App