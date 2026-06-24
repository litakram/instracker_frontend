import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { extractApiError, formatDate } from '../lib/formatters'

function StudentDashboardPage() {
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [consultingId, setConsultingId] = useState(null)

  useEffect(() => {
    loadOpportunities()
  }, [])

  const metrics = {
    total: opportunities.length,
    consulted: opportunities.filter(
      (opportunity) => opportunity.tracking?.status === 'consulted',
    ).length,
    applied: opportunities.filter((opportunity) => opportunity.tracking?.status === 'applied')
      .length,
  }

  async function loadOpportunities() {
    try {
      setLoading(true)
      setErrorMessage('')
      const response = await api.get('/opportunities')
      setOpportunities(response.data.opportunities)
    } catch (error) {
      setErrorMessage(extractApiError(error, 'Could not load the opportunity feed.'))
    } finally {
      setLoading(false)
    }
  }

  function syncTracking(opportunityId, tracking) {
    setOpportunities((current) =>
      current.map((opportunity) =>
        opportunity.id === opportunityId
          ? {
              ...opportunity,
              tracking: {
                status: tracking.status,
                notes: tracking.notes,
                consultedAt: tracking.consultedAt,
                appliedAt: tracking.appliedAt,
              },
            }
          : opportunity,
      ),
    )
  }

  async function handleOfficialLink(opportunity) {
    try {
      setConsultingId(opportunity.id)
      const response = await api.post(`/tracking/${opportunity.id}/consult`)
      syncTracking(opportunity.id, response.data.tracking)
      window.open(opportunity.externalUrl, '_blank', 'noopener,noreferrer')
    } catch (error) {
      setErrorMessage(extractApiError(error, 'Could not mark the opportunity as consulted.'))
    } finally {
      setConsultingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <section className="stack-grid">
        <div className="panel-card">
          <p className="metric-label">Active feed</p>
          <p className="metric-value">{metrics.total}</p>
          <p className="metric-note">Active opportunities.</p>
        </div>
        <div className="panel-card">
          <p className="metric-label">Consulted</p>
          <p className="mt-3 text-3xl font-semibold text-blue-700">{metrics.consulted}</p>
          <p className="metric-note">Opened items.</p>
        </div>
        <div className="panel-card">
          <p className="metric-label">Applied</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-700">{metrics.applied}</p>
          <p className="metric-note">Applied items.</p>
        </div>
      </section>

      <section className="panel-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Nearest deadlines first</p>
            <h3 className="section-heading">Opportunity feed</h3>
            <p className="section-copy">Consult is saved before the link opens.</p>
          </div>
          <Link className="secondary-btn" to="/student/tracking">
            Open my tracking board
          </Link>
        </div>

        {errorMessage ? <div className="message-error mt-6">{errorMessage}</div> : null}

        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="surface-subtle">Loading opportunities...</div>
          ) : opportunities.length === 0 ? (
            <div className="surface-subtle">No active opportunities are published yet.</div>
          ) : (
            opportunities.map((opportunity) => (
              <article
                key={opportunity.id}
                className="content-card overflow-hidden p-0"
              >
                <div className="grid gap-0 xl:grid-cols-[280px_minmax(0,1fr)]">
                  <div className="flex h-72 items-center justify-center bg-slate-100 p-4 xl:h-full">
                    <img
                      src={opportunity.imageUrl}
                      alt={opportunity.title}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  <div className="p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="max-w-3xl">
                        <div className="flex flex-wrap items-center gap-3">
                          <h4 className="text-2xl font-semibold text-slate-900">{opportunity.title}</h4>
                          <span className="status-pill status-consulted">
                            Deadline {formatDate(opportunity.deadline)}
                          </span>
                          {opportunity.tracking ? (
                            <span
                              className={`status-pill ${
                                opportunity.tracking.status === 'applied'
                                  ? 'status-applied'
                                  : 'status-consulted'
                              }`}
                            >
                              {opportunity.tracking.status}
                            </span>
                          ) : null}
                        </div>

                        <p className="mt-4 text-sm leading-7 text-slate-600">
                          {opportunity.description}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-col gap-3 sm:flex-row xl:flex-col">
                        <button
                          type="button"
                          className="primary-btn"
                          disabled={consultingId === opportunity.id}
                          onClick={() => handleOfficialLink(opportunity)}
                        >
                          {consultingId === opportunity.id ? 'Recording consult...' : 'Official link'}
                        </button>
                        <Link className="secondary-btn" to="/student/tracking">
                          Update tracking
                        </Link>
                      </div>
                    </div>

                    {opportunity.tracking?.notes ? (
                      <div className="surface-subtle mt-5">
                        <p className="metric-label">Your notes</p>
                        <p className="mt-2 text-sm leading-6 text-slate-700">{opportunity.tracking.notes}</p>
                      </div>
                    ) : null}
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

export default StudentDashboardPage
