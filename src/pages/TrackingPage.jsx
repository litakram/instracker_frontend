import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { extractApiError, formatDate, formatDateTime } from '../lib/formatters'

function TrackingPage() {
  const [trackingItems, setTrackingItems] = useState([])
  const [draftNotes, setDraftNotes] = useState({})
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [busyKey, setBusyKey] = useState('')

  useEffect(() => {
    loadTracking()
  }, [])

  const metrics = {
    total: trackingItems.length,
    consulted: trackingItems.filter((item) => item.status === 'consulted').length,
    applied: trackingItems.filter((item) => item.status === 'applied').length,
  }

  async function loadTracking() {
    try {
      setLoading(true)
      setErrorMessage('')
      const response = await api.get('/tracking/me')
      const records = response.data.tracking
      setTrackingItems(records)
      setDraftNotes(
        records.reduce((accumulator, record) => {
          accumulator[record.opportunity.id] = record.notes || ''
          return accumulator
        }, {}),
      )
    } catch (error) {
      setErrorMessage(extractApiError(error, 'Could not load your tracking board.'))
    } finally {
      setLoading(false)
    }
  }

  function upsertTrackingRecord(nextRecord) {
    setTrackingItems((current) => {
      const withoutCurrent = current.filter(
        (record) => record.opportunity.id !== nextRecord.opportunity.id,
      )
      return [nextRecord, ...withoutCurrent]
    })
    setDraftNotes((current) => ({
      ...current,
      [nextRecord.opportunity.id]: nextRecord.notes || '',
    }))
  }

  async function handleSaveNotes(opportunityId) {
    try {
      setBusyKey(`notes:${opportunityId}`)
      setErrorMessage('')
      setSuccessMessage('')
      const response = await api.put(`/tracking/${opportunityId}/notes`, {
        notes: draftNotes[opportunityId] || '',
      })
      upsertTrackingRecord(response.data.tracking)
      setSuccessMessage('Notes saved successfully.')
    } catch (error) {
      setErrorMessage(extractApiError(error, 'Could not save your notes.'))
    } finally {
      setBusyKey('')
    }
  }

  async function handleMarkApplied(opportunityId) {
    try {
      setBusyKey(`apply:${opportunityId}`)
      setErrorMessage('')
      setSuccessMessage('')
      const response = await api.post(`/tracking/${opportunityId}/apply`)
      upsertTrackingRecord(response.data.tracking)
      setSuccessMessage('Opportunity marked as applied.')
    } catch (error) {
      setErrorMessage(extractApiError(error, 'Could not mark the opportunity as applied.'))
    } finally {
      setBusyKey('')
    }
  }

  return (
    <div className="space-y-4">
      <section className="stack-grid">
        <div className="panel-card">
          <p className="metric-label">Tracked items</p>
          <p className="metric-value">{metrics.total}</p>
          <p className="metric-note">All tracked items.</p>
        </div>
        <div className="panel-card">
          <p className="metric-label">Consulted</p>
          <p className="mt-3 text-3xl font-semibold text-blue-700">{metrics.consulted}</p>
          <p className="metric-note">Opened items.</p>
        </div>
        <div className="panel-card">
          <p className="metric-label">Applied</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-700">{metrics.applied}</p>
          <p className="metric-note">Completed applications.</p>
        </div>
      </section>

      <section className="panel-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Your notes board</p>
            <h3 className="section-heading">Tracking history</h3>
            <p className="section-copy">Save notes and update status.</p>
          </div>
          <Link className="secondary-btn" to="/student">
            Back to opportunity feed
          </Link>
        </div>

        {errorMessage ? <div className="message-error mt-6">{errorMessage}</div> : null}
        {successMessage ? <div className="message-success mt-6">{successMessage}</div> : null}

        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="surface-subtle">Loading tracking...</div>
          ) : trackingItems.length === 0 ? (
            <div className="surface-subtle">
              You have not consulted anything yet. Open an opportunity from the feed to start tracking it.
            </div>
          ) : (
            trackingItems.map((record) => (
              <article
                key={record.id}
                className="content-card"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-3xl">
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className="text-2xl font-semibold text-slate-900">
                        {record.opportunity.title}
                      </h4>
                      <span
                        className={`status-pill ${
                          record.status === 'applied' ? 'status-applied' : 'status-consulted'
                        }`}
                      >
                        {record.status}
                      </span>
                      <span className="status-pill status-consulted">
                        Deadline {formatDate(record.opportunity.deadline)}
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {record.opportunity.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                      <span>Consulted {formatDateTime(record.consultedAt)}</span>
                      {record.appliedAt ? <span>Applied {formatDateTime(record.appliedAt)}</span> : null}
                      <a
                        className="accent-link"
                        href={record.opportunity.externalUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Official listing
                      </a>
                    </div>
                  </div>

                  <div className="w-full max-w-xl">
                    <label className="field-label" htmlFor={`notes-${record.opportunity.id}`}>
                      Notes
                    </label>
                    <textarea
                      id={`notes-${record.opportunity.id}`}
                      className="field-input min-h-36 resize-y"
                      value={draftNotes[record.opportunity.id] || ''}
                      onChange={(event) =>
                        setDraftNotes((current) => ({
                          ...current,
                          [record.opportunity.id]: event.target.value,
                        }))
                      }
                      placeholder="Capture deadlines, essay ideas, contact details, or missing requirements."
                    />

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        className="primary-btn"
                        disabled={busyKey === `notes:${record.opportunity.id}`}
                        onClick={() => handleSaveNotes(record.opportunity.id)}
                      >
                        {busyKey === `notes:${record.opportunity.id}` ? 'Saving notes...' : 'Save notes'}
                      </button>

                      {record.status !== 'applied' ? (
                        <button
                          type="button"
                          className="secondary-btn"
                          disabled={busyKey === `apply:${record.opportunity.id}`}
                          onClick={() => handleMarkApplied(record.opportunity.id)}
                        >
                          {busyKey === `apply:${record.opportunity.id}`
                            ? 'Marking applied...'
                            : 'Mark as applied'}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

export default TrackingPage
