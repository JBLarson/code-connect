import { useState } from 'react'
import api from '../../services/api'
import '../../styles/modal.css'

import type { Project } from '../../types';

interface EditProjectModalProps {
  project: Project | null
  onClose: () => void
  onSave: (project: Project) => void
}

export default function EditProjectModal({ project, onClose, onSave }: EditProjectModalProps) {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    tech_stack: project?.tech_stack || [],
    location: project?.location || '',
    skill_level: project?.skill_level || 'intermediate',
    time_commitment: project?.time_commitment || 'flexible',
    status: project?.status || 'open',
    repo_url: project?.repo_url || ''
  })
  const [techInput, setTechInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleAddTech = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && techInput.trim()) {
      e.preventDefault()
      if (!formData.tech_stack.includes(techInput.trim())) {
        setFormData({
          ...formData,
          tech_stack: [...formData.tech_stack, techInput.trim()]
        })
      }
      setTechInput('')
    }
  }

  const handleRemoveTech = (techToRemove: string) => {
    setFormData({
      ...formData,
      tech_stack: formData.tech_stack.filter(tech => tech !== techToRemove)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }
    if (!formData.description.trim()) {
      setError('Description is required')
      return
    }
    if (formData.tech_stack.length === 0) {
      setError('Add at least one technology')
      return
    }

    setLoading(true)
    setError(null)

    try {
      let response
      if (project) {
        // Update existing project
        response = await api.put(`/api/projects/${project.id}`, formData)
      } else {
        // Create new project
        response = await api.post('/api/projects', formData)
      }
      
      onSave(response.data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save project')
      console.error('Error saving project:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{project ? 'Edit Project' : 'Create Project'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="alert alert-error">{error}</div>
          )}

          <div className="form-group">
            <label htmlFor="title">Project Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input"
              placeholder="e.g., Open Source Task Manager"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="textarea"
              rows={5}
              placeholder="Describe the project, what you're building, and what kind of help you need..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="tech_stack">Tech Stack *</label>
            <input
              type="text"
              id="tech_stack"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={handleAddTech}
              className="input"
              placeholder="Type a technology and press Enter (e.g., Python, React, PostgreSQL)"
            />
            <small className="form-help">Press Enter to add each technology</small>
            {formData.tech_stack.length > 0 && (
              <div className="tech-list">
                {formData.tech_stack.map((tech, idx) => (
                  <span key={idx} className="tech-tag tech-tag-removable">
                    {tech}
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(tech)}
                      className="tech-remove"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="skill_level">Skill Level</label>
              <select
                id="skill_level"
                name="skill_level"
                value={formData.skill_level}
                onChange={handleChange}
                className="select"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="time_commitment">Time Commitment</label>
              <select
                id="time_commitment"
                name="time_commitment"
                value={formData.time_commitment}
                onChange={handleChange}
                className="select"
              >
                <option value="flexible">Flexible</option>
                <option value="part-time">Part-time</option>
                <option value="full-time">Full-time</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="input"
              placeholder="e.g., Long Beach, CA or Remote"
            />
          </div>

          {project && (
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="select"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="repo_url">Repository URL</label>
            <input
              type="url"
              id="repo_url"
              name="repo_url"
              value={formData.repo_url}
              onChange={handleChange}
              className="input"
              placeholder="https://github.com/username/repo"
            />
            <small className="form-help">Optional - add this once you've created the repo</small>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : project ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}