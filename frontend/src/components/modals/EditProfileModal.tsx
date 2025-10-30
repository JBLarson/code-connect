import { useState, useEffect } from 'react'
import api from '../../services/api'
import '../../styles/modal.css'
import type { UserProfile } from '../../types';

interface EditProfileModalProps {
  profile: UserProfile | null
  onClose: () => void
  onSave: (profile: UserProfile) => void
}

export default function EditProfileModal({ profile, onClose, onSave }: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    role: profile?.role || 'developer',
    name: profile?.name || '',
    location: profile?.location || '',
    bio: profile?.bio || '',
    skills: profile?.skills || [],
    github_url: profile?.github_url || '',
    linkedin_url: profile?.linkedin_url || '',
    contact_email: profile?.contact_email || '' // <-- NEW
  })
  const [skillInput, setSkillInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault()
      if (!formData.skills.includes(skillInput.trim())) {
        setFormData({
          ...formData,
          skills: [...formData.skills, skillInput.trim()]
        })
      }
      setSkillInput('')
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let response
      if (profile) {
        // Update existing profile
        response = await api.put('/api/profile', formData)
      } else {
        // Create new profile
        response = await api.post('/api/profile', formData)
      }
      
      onSave(response.data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save profile')
      console.error('Error saving profile:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{profile ? 'Edit Profile' : 'Create Profile'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="alert alert-error">{error}</div>
          )}

          <div className="form-group">
            <label htmlFor="role">Role *</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="select"
              required
            >
              <option value="developer">Developer</option>
              <option value="idea_generator">Idea Generator</option>
              <option value="both">Both</option>
            </select>
            <small className="form-help">How do you want to participate?</small>
          </div>

          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input"
              placeholder="Your name"
            />
          </div>

          {/* NEW Contact Email Field */}
          <div className="form-group">
            <label htmlFor="contact_email">Contact Email</label>
            <input
              type="email"
              id="contact_email"
              name="contact_email"
              value={formData.contact_email}
              onChange={handleChange}
              className="input"
              placeholder="your@email.com"
            />
            <small className="form-help">
              This will be shared with project owners after they accept your interest.
            </small>
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
              placeholder="e.g., Long Beach, CA"
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="textarea"
              rows={4}
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="skills">Skills</label>
            <input
              type="text"
              id="skills"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleAddSkill}
              className="input"
              placeholder="Type a skill and press Enter"
            />
            <small className="form-help">Press Enter to add each skill</small>
            {formData.skills.length > 0 && (
              <div className="skills-list">
                {formData.skills.map((skill, idx) => (
                  <span key={idx} className="skill-tag skill-tag-removable">
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="skill-remove"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="github_url">GitHub URL</label>
            <input
              type="url"
              id="github_url"
              name="github_url"
              value={formData.github_url}
              onChange={handleChange}
              className="input"
              placeholder="https://github.com/username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="linkedin_url">LinkedIn URL</label>
            <input
              type="url"
              id="linkedin_url"
              name="linkedin_url"
              value={formData.linkedin_url}
              onChange={handleChange}
              className="input"
              placeholder="https://linkedin.com/in/username"
            />
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
              {loading ? 'Saving...' : profile ? 'Save Changes' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
