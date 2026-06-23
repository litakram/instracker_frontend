import { useEffect, useState } from 'react'
import api from '../lib/api'
import { extractApiError, formatDateTime } from '../lib/formatters'
import { useAuth } from '../context/AuthContext'

function AdminUsersPage() {
  const { user: activeUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    try {
      setLoading(true)
      setErrorMessage('')
      const response = await api.get('/users')
      setUsers(response.data.users)
    } catch (error) {
      setErrorMessage(extractApiError(error, 'Could not load users.'))
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateUser(event) {
    event.preventDefault()

    try {
      setIsSubmitting(true)
      setErrorMessage('')
      setSuccessMessage('')

      const response = await api.post('/users', {
        username,
        password,
        role: 'student',
      })

      setUsers((current) =>
        [...current, response.data.user].sort((left, right) =>
          left.username.localeCompare(right.username),
        ),
      )
      setUsername('')
      setPassword('')
      setSuccessMessage('Student account created successfully.')
    } catch (error) {
      setErrorMessage(extractApiError(error, 'Could not create the account.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteUser(userId) {
    const confirmed = window.confirm('Delete this account and all its tracking history?')

    if (!confirmed) {
      return
    }

    try {
      setErrorMessage('')
      setSuccessMessage('')
      await api.delete(`/users/${userId}`)
      setUsers((current) => current.filter((user) => user._id !== userId && user.id !== userId))
      setSuccessMessage('Account deleted successfully.')
    } catch (error) {
      setErrorMessage(extractApiError(error, 'Could not delete the account.'))
    }
  }

  return (
    <div className="page-grid">
      <section className="panel-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Account control</p>
            <h3 className="section-heading">Registered users</h3>
            <p className="section-copy">Manage access.</p>
          </div>
          <div className="metric-card min-w-40">
            <p className="metric-label">Live accounts</p>
            <p className="metric-value">{users.length}</p>
          </div>
        </div>

        {errorMessage ? <div className="message-error mt-6">{errorMessage}</div> : null}
        {successMessage ? <div className="message-success mt-6">{successMessage}</div> : null}

        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="surface-subtle">Loading users...</div>
          ) : (
            users.map((user) => {
              const userId = user._id || user.id
              const isCurrentUser = userId === activeUser?.id

              return (
                <article
                  key={userId}
                  className="content-card flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className="text-lg font-semibold text-slate-900">{user.username}</h4>
                      <span
                        className={`status-pill ${
                          user.role === 'admin' ? 'status-applied' : 'status-consulted'
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      Created {formatDateTime(user.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {isCurrentUser ? (
                      <span className="secondary-btn">Current session</span>
                    ) : (
                      <button
                        type="button"
                        className="danger-btn"
                        onClick={() => handleDeleteUser(userId)}
                      >
                        Delete account
                      </button>
                    )}
                  </div>
                </article>
              )
            })
          )}
        </div>
      </section>

      <aside className="panel-card">
        <p className="eyebrow">Provision student</p>
        <h3 className="section-heading">Create a user</h3>
        <p className="section-copy">Add a student account.</p>

        <form className="mt-6 space-y-4" onSubmit={handleCreateUser}>
          <div>
            <label className="field-label" htmlFor="new-user-username">
              Username
            </label>
            <input
              id="new-user-username"
              className="field-input"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="future.scholar"
              required
            />
          </div>

          <div>
            <label className="field-label" htmlFor="new-user-password">
              Password
            </label>
            <input
              id="new-user-password"
              className="field-input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              required
            />
          </div>

          <button type="submit" className="primary-btn w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create student account'}
          </button>
        </form>

        <div className="surface-subtle mt-6">
          <p className="text-sm font-medium text-slate-900">Admin accounts</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">Created separately.</p>
        </div>
      </aside>
    </div>
  )
}

export default AdminUsersPage
