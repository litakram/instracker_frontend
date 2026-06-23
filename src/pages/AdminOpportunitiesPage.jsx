import { useEffect, useState } from 'react'
import api from '../lib/api'
import {
  extractApiError,
  formatDate,
  toDateInputValue,
  toDeadlineIso,
} from '../lib/formatters'

function AdminOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [title, setTitle] = useState('')
  const [externalUrl, setExternalUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [deadline, setDeadline] = useState('')
  const [description, setDescription] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    loadOpportunities()
  }, [])

  async function loadOpportunities() {
    try {
      setLoading(true)
      setErrorMessage('')
      const response = await api.get('/admin/opportunities')
      setOpportunities(response.data.opportunities)
    } catch (error) {
      setErrorMessage(extractApiError(error, 'Could not load opportunities.'))
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setEditingId(null)
    setTitle('')
    setExternalUrl('')
    setImageUrl('')
    setDeadline('')
    setDescription('')
  }

  function loadOpportunityIntoForm(opportunity) {
    setEditingId(opportunity._id)
    setTitle(opportunity.title)
    setExternalUrl(opportunity.externalUrl)
    setImageUrl(opportunity.imageUrl)
    setDeadline(toDateInputValue(opportunity.deadline))
    setDescription(opportunity.description)
    setSuccessMessage('')
    setErrorMessage('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    try {
      setIsSubmitting(true)
      setErrorMessage('')
      setSuccessMessage('')

      const payload = {
        title,
        externalUrl,
        imageUrl,
        deadline: toDeadlineIso(deadline),
        description,
      }

      if (editingId) {
        await api.put(`/admin/opportunities/${editingId}`, payload)
        setSuccessMessage('Opportunity updated successfully.')
      } else {
        await api.post('/admin/opportunities', payload)
        setSuccessMessage('Opportunity created successfully.')
      }

      resetForm()
      await loadOpportunities()
    } catch (error) {
      setErrorMessage(extractApiError(error, 'Could not save the opportunity.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(opportunityId) {
    const confirmed = window.confirm('Delete this opportunity and its tracking history?')

    if (!confirmed) {
      return
    }

    try {
      setErrorMessage('')
      setSuccessMessage('')
      await api.delete(`/admin/opportunities/${opportunityId}`)
      setOpportunities((current) =>
        current.filter((opportunity) => opportunity._id !== opportunityId),
      )
      if (editingId === opportunityId) {
        resetForm()
      }
      setSuccessMessage('Opportunity deleted successfully.')
    } catch (error) {
      setErrorMessage(extractApiError(error, 'Could not delete the opportunity.'))
    }
  }

  return (
    <div className="page-grid">
      <section className="panel-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Opportunity ledger</p>
            <h3 className="section-heading">Published opportunities</h3>
            <p className="section-copy">Edit live listings.</p>
          </div>
          <div className="metric-card min-w-40">
            <p className="metric-label">Total entries</p>
            <p className="metric-value">{opportunities.length}</p>
          </div>
        </div>

        {errorMessage ? <div className="message-error mt-6">{errorMessage}</div> : null}
        {successMessage ? <div className="message-success mt-6">{successMessage}</div> : null}

        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="surface-subtle">Loading opportunities...</div>
          ) : opportunities.length === 0 ? (
            <div className="surface-subtle">
              No opportunities yet. Use the editor to create the first live scholarship listing.
            </div>
          ) : (
            opportunities.map((opportunity) => (
              <article
                key={opportunity._id}
                className="content-card"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-3xl">
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className="text-xl font-semibold text-slate-900">{opportunity.title}</h4>
                      <span className="status-pill status-consulted">
                        Due {formatDate(opportunity.deadline)}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{opportunity.description}</p>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                      <a
                        className="accent-link"
                        href={opportunity.externalUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Official listing
                      </a>
                      <span>Added by {opportunity.createdBy?.username || 'system'}</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-3">
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => loadOpportunityIntoForm(opportunity)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="danger-btn"
                      onClick={() => handleDelete(opportunity._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <aside className="panel-card">
        <p className="eyebrow">{editingId ? 'Update opportunity' : 'New opportunity'}</p>
        <h3 className="section-heading">
          {editingId ? 'Edit listing' : 'Create listing'}
        </h3>
        <p className="section-copy">Add or update a listing.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="field-label" htmlFor="opportunity-title">
              Title
            </label>
            <input
              id="opportunity-title"
              className="field-input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Mastercard Foundation Scholars Program"
              required
            />
          </div>

          <div>
            <label className="field-label" htmlFor="opportunity-url">
              Official URL
            </label>
            <input
              id="opportunity-url"
              className="field-input"
              type="url"
              value={externalUrl}
              onChange={(event) => setExternalUrl(event.target.value)}
              placeholder="https://example.org/opportunity"
              required
            />
          </div>

          <div>
            <label className="field-label" htmlFor="opportunity-image">
              Image URL
            </label>
            <input
              id="opportunity-image"
              className="field-input"
              type="url"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              placeholder="https://example.org/banner.jpg"
              required
            />
          </div>

          <div>
            <label className="field-label" htmlFor="opportunity-deadline">
              Deadline
            </label>
            <input
              id="opportunity-deadline"
              className="field-input"
              type="date"
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
              required
            />
          </div>

          <div>
            <label className="field-label" htmlFor="opportunity-description">
              Description
            </label>
            <textarea
              id="opportunity-description"
              className="field-input min-h-36 resize-y"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Summarize eligibility, timeline, and why this listing matters."
              required
            />
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button type="submit" className="primary-btn flex-1" disabled={isSubmitting}>
              {isSubmitting
                ? 'Saving...'
                : editingId
                  ? 'Update opportunity'
                  : 'Publish opportunity'}
            </button>
            <button type="button" className="secondary-btn" onClick={resetForm}>
              Clear
            </button>
          </div>
        </form>
      </aside>
    </div>
  )
}

export default AdminOpportunitiesPage
