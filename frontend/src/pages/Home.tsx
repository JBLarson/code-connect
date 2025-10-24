import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

interface Project {
  id: number
  title: string
  description: string
  tech_stack: string[]
  location: string
  skill_level: string
  time_commitment: string
  created_at: string
}

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ location: '', skill_level: '' })

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects')
      setProjects(response.data)
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProjects = projects.filter(project => {
    if (filter.location && !project.location.toLowerCase().includes(filter.location.toLowerCase())) {
      return false
    }
    if (filter.skill_level && project.skill_level !== filter.skill_level) {
      return false
    }
    return true
  })

  return (
    <div className="container">
      <header className="hero">
        <h1>Code Connect</h1>
        <p className="tagline">
          Where ideas meet talent. Connect with developers, build meaningful projects.
        </p>
        {!user && (
          <div className="cta-buttons">
            <button onClick={() => navigate('/auth')} className="btn btn-primary">
              Get Started
            </button>
          </div>
        )}
      </header>

      <section className="filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Filter by location..."
            value={filter.location}
            onChange={(e) => setFilter({ ...filter, location: e.target.value })}
            className="input"
          />
          <select
            value={filter.skill_level}
            onChange={(e) => setFilter({ ...filter, skill_level: e.target.value })}
            className="select"
          >
            <option value="">All skill levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </section>

      <section className="projects">
        {loading ? (
          <div className="loading">Loading projects...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="empty-state">
            <p>No projects found. Be the first to post one!</p>
            {user && (
              <button onClick={() => navigate('/create')} className="btn btn-secondary">
                Create Project
              </button>
            )}
          </div>
        ) : (
          <div className="project-grid">
            {filteredProjects.map(project => (
              <article key={project.id} className="card project-card" onClick={() => navigate(`/projects/${project.id}`)}>
                <div className="card-header">
                  <h3>{project.title}</h3>
                  <span className="badge">{project.skill_level}</span>
                </div>
                <p className="description">{project.description.slice(0, 150)}...</p>
                <div className="card-meta">
                  <div className="tech-stack">
                    {project.tech_stack.slice(0, 3).map((tech, idx) => (
                      <span key={idx} className="tech-tag">{tech}</span>
                    ))}
                  </div>
                  <div className="meta-info">
                    <span className="location">📍 {project.location}</span>
                    <span className="commitment">⏱️ {project.time_commitment}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}