import { useState } from 'react'
import api from '../../services/api'
import '../../styles/modal.css'

interface ExpressInterestModalProps {
  projectId: number
  projectTitle: string
  onClose: () => void
  onSuccess: () => void
}

export default function ExpressInterestModal({ projectId, projectTitle, onClose, onSuccess }: ExpressInterestModalProps) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await api.post('/api/interests', {
        project_id: projectId,
        message: message.trim()
      })
      
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to express interest')
      console.error('Error expressing interest:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Express Interest</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="alert alert-error">{error}</div>
          )}

          <p className="modal-intro">
            You're expressing interest in <strong>{projectTitle}</strong>
          </p>

          <div className="form-group">
            <label htmlFor="message">Message (Optional)</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="textarea"
              rows={4}
              placeholder="Introduce yourself and explain why you're interested in this project..."
            />
            <small className="form-help">
              Let the project owner know about your skills and why you'd be a good fit
            </small>
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
              {loading ? 'Submitting...' : 'Express Interest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}