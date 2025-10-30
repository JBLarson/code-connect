import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import EditProfileModal from '../components/modals/EditProfileModal'
import '../styles/profile.css'
import type { Project, UserProfile } from '../types';

// NEW: Interface for MyInterests
interface MyInterest {
  id: number
  status: 'pending' | 'accepted' | 'declined'
  created_at: string
  project: Project // This will include the project and its creator
}

export default function Profile() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [myInterests, setMyInterests] = useState<MyInterest[]>([]) // <-- NEW STATE
  const [loading, setLoading] = useState(true)
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [interestsLoading, setInterestsLoading] = useState(true) // <-- NEW STATE
  const [error, setError] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  const isOwnProfile = !id || (user && id === user.id)

  useEffect(() => {
    fetchProfile()
    fetchUserProjects()
    
    // If it's our profile, fetch our interests
    if (isOwnProfile) {
      fetchMyInterests()
    }
  }, [id, user, isOwnProfile]) // Added isOwnProfile dependency

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const endpoint = isOwnProfile ? '/api/profile' : `/api/profile/${id}`
      const response = await api.get(endpoint)
      setProfile(response.data)
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('profile_not_found')
      } else {
        setError('Failed to load profile')
      }
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserProjects = async () => {
    try {
      setProjectsLoading(true)
      let endpoint
      
      if (isOwnProfile) {
        endpoint = '/api/projects/my-projects'
      } else {
        endpoint = `/api/projects/user/${id}`
      }
      
      const response = await api.get(endpoint)
      setProjects(response.data)
    } catch (err) {
      console.error('Error fetching user projects:', err)
    } finally {
      setProjectsLoading(false)
    }
  }

  // NEW: Function to fetch user's own interests
  const fetchMyInterests = async () => {
    try {
      setInterestsLoading(true)
      const response = await api.get('/api/interests/my-interests')
      setMyInterests(response.data)
    } catch (err) {
      console.error('Error fetching my interests:', err)
    } finally {
      setInterestsLoading(false)
    }
  }

  const handleProfileUpdate = async (updatedProfile: UserProfile) => {
    setProfile(updatedProfile)
    setShowEditModal(false)
    setError(null)
    
    await fetchProfile()
  }

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'developer':
        return 'badge-developer'
      case 'idea_generator':
        return 'badge-idea'
      case 'both':
        return 'badge-both'
      default:
        return ''
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'developer':
        return 'Developer'
      case 'idea_generator':
        return 'Idea Generator'
      case 'both':
        return 'Developer & Idea Generator'
      default:
        return role
    }
  }

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

  // NEW: Helper for interest status
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

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading profile...</div>
      </div>
    )
  }

  if (error === 'profile_not_found' && isOwnProfile) {
    return (
      <div className="container">
        <div className="profile-setup">
          <h2>Welcome! Let's set up your profile</h2>
          <p>You need to create a profile to start using Code Connect.</p>
          <button 
            onClick={() => setShowEditModal(true)} 
            className="btn btn-primary"
          >
            Create Profile
          </button>
        </div>
        {showEditModal && (
          <EditProfileModal
            profile={null}
            onClose={() => setShowEditModal(false)}
            onSave={handleProfileUpdate}
          />
        )}
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-state">
          {error === 'profile_not_found' ? 'Profile not found' : error}
        </div>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <div className="container">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-header-content">
            <div className="profile-avatar">
              {profile.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="profile-header-info">
              <h1>{profile.name || 'Anonymous User'}</h1>
              <span className={`badge ${getRoleBadgeClass(profile.role)}`}>
                {getRoleLabel(profile.role)}
              </span>
              {profile.location && (
                <p className="location">📍 {profile.location}</p>
              )}
              <p className="text-muted">Member since: {new Date(profile.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          {isOwnProfile && (
            <button 
              onClick={() => setShowEditModal(true)} 
              className="btn btn-secondary"
            >
              Edit Profile
            </button>
          )}
        </div>

        <div className="profile-sections">
          {profile.bio && (
            <section className="profile-section">
              <h3>About</h3>
              <p className="bio">{profile.bio}</p>
            </section>
          )}

          {profile.skills && profile.skills.length > 0 && (
            <section className="profile-section">
              <h3>Skills</h3>
              <div className="skills-list">
                {profile.skills.map((skill, idx) => (
                  <span key={idx} className="skill-tag">{skill}</span>
                ))}
              </div>
            </section>
          )}

          {/* NEW "MY INTERESTS" SECTION */}
          {isOwnProfile && (profile.role === 'developer' || profile.role === 'both') && (
            <section className="profile-section">
              <h3>My Interests</h3>
              {interestsLoading ? (
                <p className="text-muted">Loading interests...</p>
              ) : myInterests.length === 0 ? (
                <p className="text-muted">
                  You haven't expressed interest in any projects yet. 
                  <Link to="/"> Browse projects</Link> to get started.
                </p>
              ) : (
                <div className="interests-grid">
                  {myInterests.map(interest => (
                    <article key={interest.id} className="interest-card-profile">
                      <div className="interest-card-profile-header">
                        <Link to={`/projects/${interest.project.id}`} className="interest-project-title">
                          {interest.project.title}
                        </Link>
                        <span className={`badge-small ${getInterestStatusColor(interest.status)}`}>
                          {formatStatus(interest.status)}
                        </span>
                      </div>
                      
                      {/* THE CORE LOOP: REVEAL CONTACT INFO ON ACCEPT */}
                      {interest.status === 'accepted' && (
                        <div className="contact-reveal-box">
                          <strong>Connection made!</strong>
                          <p>Contact the project owner to get started:</p>
                          <div className="contact-links">
                            {interest.project.creator?.contact_email && (
                              <a href={`mailto:${interest.project.creator.contact_email}`}>
                                📧 {interest.project.creator.contact_email}
                              </a>
                            )}
                            {interest.project.creator?.linkedin_url && (
                              <a href={interest.project.creator.linkedin_url} target="_blank" rel="noopener noreferrer">
                                🔗 LinkedIn
                              </a>
                            )}
                            {interest.project.creator?.github_url && (
                              <a href={interest.project.creator.github_url} target="_blank" rel="noopener noreferrer">
                                🔗 GitHub
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                      {interest.status === 'pending' && (
                        <p className="text-muted small">Your interest is pending review by the project owner.</p>
                      )}

                      {interest.status === 'declined' && (
                        <p className="text-muted small">Your interest was declined for this project.</p>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          <section className="profile-section">
            <h3>Projects</h3>
            {projectsLoading ? (
              <p className="text-muted">Loading projects...</p>
            ) : projects.length === 0 ? (
              <p className="text-muted">
                {isOwnProfile ? "You haven't created any projects yet." : "No projects yet."}
              </p>
            ) : (
              <div className="profile-projects-grid">
                {projects.map(project => (
                  <article 
                    key={project.id} 
                    className="profile-project-card"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <div className="profile-project-header">
                      <h4>{project.title}</h4>
                      <div className="profile-project-badges">
                        <span className={`badge-small ${getSkillLevelColor(project.skill_level)}`}>
                          {project.skill_level}
                        </span>
                        <span className={`badge-small ${getStatusColor(project.status)}`}>
                          {formatStatus(project.status)}
                        </span>
                      </div>
                    </div>
                    <p className="profile-project-description">
                      {project.description.slice(0, 100)}...
                    </p>
                    <div className="profile-project-tech">
                      {project.tech_stack.slice(0, 3).map((tech, idx) => (
                        <span key={idx} className="tech-tag-small">{tech}</span>
                      ))}
                      {project.tech_stack.length > 3 && (
                        <span className="tech-tag-small">+{project.tech_stack.length - 3}</span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {(profile.github_url || profile.linkedin_url) && (
            <section className="profile-section">
              <h3>Links</h3>
              <div className="profile-links">
                {profile.github_url && (
                  <a 
                    href={profile.github_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="profile-link"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                    GitHub
                  </a>
                )}
                {profile.linkedin_url && (
                  <a 
                    href={profile.linkedin_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="profile-link"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    LinkedIn
                  </a>
                )}
              </div>
            </section>
          )}
        </div>
      </div>

      {showEditModal && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onSave={handleProfileUpdate}
        />
      )}
    </div>
  )
}
