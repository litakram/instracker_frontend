import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { extractApiError } from '../lib/formatters'

function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage('')
      const user = await register({ username, password })
      navigate(user.role === 'admin' ? '/admin/opportunities' : '/student', { replace: true })
    } catch (error) {
      setErrorMessage(extractApiError(error, 'Could not create your account.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-grid">
        <section className="surface-card hero-panel flex flex-col justify-between">
          <div>
            <div className="brand-lockup">
              <img className="brand-logo brand-logo-lg" src="/instrackerlogo.svg" alt="instracker logo" />
              <div>
                <p className="brand-name">instracker</p>
              </div>
            </div>
            <h1 className="section-title mt-6 max-w-xl">
              Create your student account.
            </h1>
            <p className="muted-copy mt-6 max-w-2xl">Student signup only.</p>
          </div>

          <div className="stack-grid mt-10">
            <div className="metric-card">
              <p className="metric-label">Signup</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">Student role only</p>
            </div>
            <div className="metric-card">
              <p className="metric-label">Notes</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">Plain text and portable</p>
            </div>
            <div className="metric-card">
              <p className="metric-label">Focus</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">Deadline-first feed</p>
            </div>
          </div>
        </section>

        <section className="surface-card auth-form">
          <div>
            <p className="eyebrow">Register</p>
            <h2 className="mt-4 text-3xl font-semibold text-slate-900">Open your student workspace</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">Choose a username and password.</p>
          </div>

          {errorMessage ? <div className="message-error">{errorMessage}</div> : null}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="field-label" htmlFor="register-username">
                Username
              </label>
              <input
                id="register-username"
                className="field-input"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="future.scholar"
                required
              />
            </div>

            <div>
              <label className="field-label" htmlFor="register-password">
                Password
              </label>
              <input
                id="register-password"
                className="field-input"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 6 characters"
                required
              />
            </div>

            <div>
              <label className="field-label" htmlFor="register-confirm-password">
                Confirm password
              </label>
              <input
                id="register-confirm-password"
                className="field-input"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Re-enter your password"
                required
              />
            </div>

            <button type="submit" className="primary-btn w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create student account'}
            </button>
          </form>

          <p className="text-sm text-slate-600">
            Already registered?{' '}
            <Link className="accent-link" to="/login">
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </div>
  )
}

export default RegisterPage
