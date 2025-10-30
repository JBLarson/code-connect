// frontend/src/pages/Home.tsx

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import EditProjectModal from '../components/modals/EditProjectModal'
import '../styles/projects.css' // We use projects.css now

import type { Project } from '../types';

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filter, setFilter] = useState({ location: '', skill_level: '' })

  // Fetch projects when component mounts
  useEffect(() => {
    fetchProjects()
  }, [])

  // Re-fetch projects when filters change (Backend Filtering)
  useEffect(() => {
    fetchProjects()
  }, [filter])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      // Pass filters to the API
      const response = await api.get('/api/projects', {
        params: {
          location: filter.location || undefined,
          skill_level: filter.skill_level || undefined,
          status: 'open' // Default to showing 'open' projects
        }
      })
      setProjects(response.data)
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProjectSaved = (savedProject: Project) => {
    // Add new project to the list or update existing
    setProjects(prev => {
      const exists = prev.find(p => p.id === savedProject.id)
      if (exists) {
        return prev.map(p => p.id === savedProject.id ? savedProject : p)
      } else {
        // Add new projects to the top
        return [savedProject, ...prev]
      }
    })
    setShowCreateModal(false)
  }
  
  // Helper function from Projects.tsx
  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'skill-beginner'
      case 'intermediate': return 'skill-intermediate'
      case 'advanced': return 'skill-advanced'
      default: return ''
    }
  }

  return (
    <div className="container">
      {/* Header from Projects.tsx */}
      <header className="projects-header">
        <div>
          <h1>Projects</h1>
          <p className="subtitle">Browse open source projects looking for contributors</p>
        </div>
        {user && (
          <button 
            onClick={() => setShowCreateModal(true)} 
            className="btn btn-primary"
          >
            + Create Project
          </button>
        )}
      </header>

      {/* Filters (unchanged) */}
      <section className="filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Filter by location (e.g., 'Orange, CA' or 'Remote')"
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

      {/* Project Grid from Projects.tsx */}
      {loading ? (
        <div className="loading">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <p>No projects found. {user ? 'Be the first to create one!' : 'Sign in to create projects.'}</p>
          {user && (
            <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
              Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="projects-grid">
          {/* Note: using 'projects' directly, not 'filteredProjects' */}
          {projects.map(project => (
            <article 
              key={project.id} 
              className="project-card"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <div className="project-card-header">
                <h3>{project.title}</h3>
                <span className={`badge ${getSkillLevelColor(project.skill_level)}`}>
                  {project.skill_level}
                </span>
            _</div>

              <p className="project-description">{project.description}</p>

              <div className="tech-stack">
                {project.tech_stack.slice(0, 5).map((tech, idx) => (
                  <span key={idx} className="tech-tag">{tech}</span>
                ))}
                {project.tech_stack.length > 5 && (
                  <span className="tech-tag">+{project.tech_stack.length - 5}</span>
               )}
              </div>

              <div className="project-meta">
                <div className="meta-row">
                  <span>📍 {project.location || 'Remote'}</span>
                  <span>⏱️ {project.time_commitment}</span>
                </div>
                {project.creator && (
                  <div className="creator-info">
                    <span className="creator-label">Posted by</span>
                    <span className="creator-name">{project.creator.name || 'Anonymous'}</span>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal from Projects.tsx */}
      {showCreateModal && (
        <EditProjectModal
          project={null}
          onClose={() => setShowCreateModal(false)}
          onSave={handleProjectSaved}
        />
      )}
    </div>
  )
}