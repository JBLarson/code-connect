import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import EditProjectModal from '../components/modals/EditProjectModal'
import ExpressInterestModal from '../components/modals/ExpressInterestModal'
import '../styles/project-detail.css'

interface Project {
  id: number
  title: string
  description: string
  tech_stack: string[]
  location: string
  skill_level: string
  time_commitment: string
  status: string
  repo_url?: string
  created_at: string
  interest_count?: number
  creator?: {
    id: string
    name: string
    location: string
  }
}

interface Interest {
  id: number
  developer_id: string
  message: string
  status: string
  created_at: string
  developer?: {
    id: string
    name: string
    location: string
    skills: string[]
  }
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showInterestModal, setShowInterestModal] = useState(false)
  const [hasInterest, setHasInterest] = useState(false)
  const [userInterest, setUserInterest] = useState<Interest | null>(null)
  const [interests, setInterests] = useState<Interest[]>([])
  const [showInterests, setShowInterests] = useState(false)

  useEffect(() => {
    fetchProject()
    if (user) {
      checkUserInterest()
    }
  }, [id, user])

  const fetchProject = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/projects/${id}`)
      setProject(response.data)
      
      // If user is owner, fetch interests
      if (user && response.data.creator && user.id === response.data.creator.id) {
        fetchProjectInterests()
      }
    } catch (err: any) {
      setError(err.response?.status === 404 ? 'Project not found' : 'Failed to load project')
      console.error('Error fetching project:', err)
    } finally {
      setLoading(false)
    }
  }

  const checkUserInterest = async () => {
    try {
      const response = await api.get(`/api/interests/check/${id}`)
      setHasInterest(response.data.has_interest)
      if (response.data.has_interest) {
        setUserInterest(response.data.interest)
      }
    } catch (err) {
      console.error('Error checking interest:', err)
    }
  }

  const fetchProjectInterests = async () => {
    try {
      const response = await api.get(`/api/interests/project/${id}`)
      setInterests(response.data)
    } catch (err) {
      console.error('Error fetching interests:', err)
    }
  }

  const handleProjectUpdate = (updatedProject: Project) => {
    setProject(updatedProject)
    setShowEditModal(false)
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return
    }

    try {
      await api.delete(`/api/projects/${id}`)
      navigate('/projects')
    } catch (err) {
      alert('Failed to delete project')
      console.error('Error deleting project:', err)
    }
  }

  const handleExpressInterest = () => {
    if (!user) {
      navigate('/auth')
      return
    }
    setShowInterestModal(true)
  }

  const handleInterestSuccess = () => {
    setHasInterest(true)
    fetchProject() // Refresh to update interest count
    checkUserInterest()
  }

  const handleWithdrawInterest = async () => {
    if (!userInterest || !window.confirm('Are you sure you want to withdraw your interest?')) {
      return
    }

    try {
      await api.delete(`/api/interests/${userInterest.id}`)
      setHasInterest(false)
      setUserInterest(null)
      fetchProject() // Refresh to update interest count
    } catch (err) {
      alert('Failed to withdraw interest')
      console.error('Error withdrawing interest:', err)
    }
  }

  const handleUpdateInterestStatus = async (interestId: number, status: string) => {
    try {
      await api.put(`/api/interests/${interestId}`, { status })
      fetchProjectInterests() // Refresh interests list
    } catch (err) {
      alert('Failed to update interest status')
      console.error('Error updating interest:', err)
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading project...</div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="container">
        <div className="error-state">
          {error || 'Project not found'}
          <button onClick={() => navigate('/projects')} className="btn btn-secondary">
            Back to Projects
          </button>
        </div>
      </div>
    )
  }

  const isOwner = user && project.creator && user.id === project.creator.id
  const isOpen = project.status === 'open'

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'skill-beginner'
      case 'intermediate': return 'skill-intermediate'
      case 'advanced': return 'skill-advanced'
      default: return ''
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'status-open'
      case 'in_progress': return 'status-progress'
      case 'completed': return 'status-completed'
      case 'cancelled': return 'status-cancelled'
      default: return ''
    }
  }

  const getInterestStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'interest-pending'
      case 'accepted': return 'interest-accepted'
      case 'declined': return 'interest-declined'
      default: return ''
    }
  }

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  return (
    <div className="container">
      <div className="project-detail">
        <div className="project-detail-header">
          <button onClick={() => navigate('/projects')} className="back-button">
            ← Back to Projects
          </button>
        </div>

        <div className="project-detail-content">
          <div className="project-main">
            <div className="project-title-section">
              <div>
                <h1>{project.title}</h1>
                <div className="project-badges">
                  <span className={`badge ${getSkillLevelColor(project.skill_level)}`}>
                    {project.skill_level}
                  </span>
                  <span className={`badge ${getStatusColor(project.status)}`}>
                    {formatStatus(project.status)}
                  </span>
                </div>
              </div>
              {isOwner && (
                <div className="owner-actions">
                  <button onClick={() => setShowEditModal(true)} className="btn btn-secondary">
                    Edit Project
                  </button>
                  <button onClick={handleDelete} className="btn btn-danger">
                    Delete
                  </button>
                </div>
              )}
            </div>

            <div className="project-description-section">
              <h2>About This Project</h2>
              <p className="project-description">{project.description}</p>
            </div>

            <div className="project-tech-section">
              <h2>Tech Stack</h2>
              <div className="tech-stack-large">
                {project.tech_stack.map((tech, idx) => (
                  <span key={idx} className="tech-tag-large">{tech}</span>
                ))}
              </div>
            </div>

            {project.repo_url && (
              <div className="project-repo-section">
                <h2>Repository</h2>
                <a 
                  href={project.repo_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="repo-link"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  View on GitHub
                </a>
              </div>
            )}

            {!isOwner && isOpen && (
              <div className="interest-section">
                {hasInterest ? (
                  <div className="interest-status">
                    <div className="interest-status-info">
                      <span className={`badge ${getInterestStatusColor(userInterest?.status || 'pending')}`}>
                        Your Interest: {userInterest?.status || 'pending'}
                      </span>
                      {userInterest?.status === 'pending' && (
                        <p className="text-muted">The project owner will review your interest soon.</p>
                      )}
                      {userInterest?.status === 'accepted' && (
                        <p className="text-success">Congratulations! Your interest was accepted. The project owner should reach out to you soon.</p>
                      )}
                      {userInterest?.status === 'declined' && (
                        <p className="text-muted">Your interest was declined. Feel free to browse other projects!</p>
                      )}
                    </div>
                    {userInterest?.status === 'pending' && (
                      <button onClick={handleWithdrawInterest} className="btn btn-secondary">
                        Withdraw Interest
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <button onClick={handleExpressInterest} className="btn btn-primary btn-large">
                      Express Interest
                    </button>
                    {project.interest_count !== undefined && project.interest_count > 0 && (
                      <p className="interest-count">
                        {project.interest_count} {project.interest_count === 1 ? 'person has' : 'people have'} expressed interest
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            {isOwner && interests.length > 0 && (
              <div className="interests-list-section">
                <div className="interests-header">
                  <h2>Interested Developers ({interests.length})</h2>
                  <button 
                    onClick={() => setShowInterests(!showInterests)}
                    className="btn btn-secondary btn-small"
                  >
                    {showInterests ? 'Hide' : 'Show'}
                  </button>
                </div>

                {showInterests && (
                  <div className="interests-list">
                    {interests.map(interest => (
                      <div key={interest.id} className="interest-card">
                        <div className="interest-card-header">
                          <div className="interest-developer">
                            <div className="developer-avatar-small">
                              {interest.developer?.name?.charAt(0).toUpperCase() || 'A'}
                            </div>
                            <div>
                              <h4 
                                onClick={() => navigate(`/profile/${interest.developer_id}`)}
                                className="developer-name-link"
                              >
                                {interest.developer?.name || 'Anonymous'}
                              </h4>
                              {interest.developer?.location && (
                                <p className="text-muted small">📍 {interest.developer.location}</p>
                              )}
                            </div>
                          </div>
                          <span className={`badge ${getInterestStatusColor(interest.status)}`}>
                            {interest.status}
                          </span>
                        </div>

                        {interest.message && (
                          <p className="interest-message">{interest.message}</p>
                        )}

                        {interest.developer?.skills && interest.developer.skills.length > 0 && (
                          <div className="interest-skills">
                            {interest.developer.skills.slice(0, 5).map((skill, idx) => (
                              <span key={idx} className="tech-tag-small">{skill}</span>
                            ))}
                          </div>
                        )}

                        {interest.status === 'pending' && (
                          <div className="interest-actions">
                            <button 
                              onClick={() => handleUpdateInterestStatus(interest.id, 'accepted')}
                              className="btn btn-primary btn-small"
                            >
                              Accept
                            </button>
                            <button 
                              onClick={() => handleUpdateInterestStatus(interest.id, 'declined')}
                              className="btn btn-secondary btn-small"
                            >
                              Decline
                            </button>
                          </div>
                        )}

                        <p className="interest-date">
                          Expressed interest {new Date(interest.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <aside className="project-sidebar">
            <div className="sidebar-section">
              <h3>Details</h3>
              <dl className="project-details">
                <dt>Location</dt>
                <dd>📍 {project.location || 'Remote'}</dd>

                <dt>Time Commitment</dt>
                <dd>⏱️ {project.time_commitment}</dd>

                <dt>Skill Level</dt>
                <dd>📊 {project.skill_level}</dd>

                <dt>Posted</dt>
                <dd>📅 {new Date(project.created_at).toLocaleDateString()}</dd>
              </dl>
            </div>

            {project.creator && (
              <div className="sidebar-section">
                <h3>Posted By</h3>
                <div className="creator-card">
                  <div className="creator-avatar">
                    {project.creator.name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div className="creator-info">
                    <p className="creator-name">{project.creator.name || 'Anonymous'}</p>
                    {project.creator.location && (
                      <p className="creator-location">📍 {project.creator.location}</p>
                    )}
                  </div>
                  <button 
                    onClick={() => navigate(`/profile/${project.creator?.id}`)}
                    className="btn btn-secondary btn-small"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {showEditModal && (
        <EditProjectModal
          project={project}
          onClose={() => setShowEditModal(false)}
          onSave={handleProjectUpdate}
        />
      )}

      {showInterestModal && (
        <ExpressInterestModal
          projectId={project.id}
          projectTitle={project.title}
          onClose={() => setShowInterestModal(false)}
          onSuccess={handleInterestSuccess}
        />
      )}
    </div>
  )
}