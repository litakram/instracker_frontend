import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { extractApiError } from '../lib/formatters'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    try {
      setIsSubmitting(true)
      setErrorMessage('')
      const user = await login({ username, password })
      const redirectTarget =
        location.state?.from || (user.role === 'admin' ? '/admin/opportunities' : '/student')
      navigate(redirectTarget, { replace: true })
    } catch (error) {
      setErrorMessage(extractApiError(error, 'Could not sign you in.'))
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
              Track scholarships in one place.
            </h1>
            <p className="muted-copy mt-6 max-w-2xl">Simple access for students and admins.</p>
          </div>

          <div className="stack-grid mt-10">
            <div className="metric-card">
              <p className="metric-label">Workflow</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">Consult before redirect</p>
            </div>
            <div className="metric-card">
              <p className="metric-label">Tracking</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">Notes stay attached</p>
            </div>
            <div className="metric-card">
              <p className="metric-label">Access</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">Role-based routes</p>
            </div>
          </div>
        </section>

        <section className="surface-card auth-form">
          <div>
            <p className="eyebrow">Sign in</p>
            <h2 className="mt-4 text-3xl font-semibold text-slate-900">Return to your workspace</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">Enter your credentials.</p>
          </div>

          {errorMessage ? <div className="message-error">{errorMessage}</div> : null}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="field-label" htmlFor="login-username">
                Username
              </label>
              <input
                id="login-username"
                className="field-input"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="future.scholar"
                required
              />
            </div>

            <div>
              <label className="field-label" htmlFor="login-password">
                Password
              </label>
              <input
                id="login-password"
                className="field-input"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Your secure password"
                required
              />
            </div>

            <button type="submit" className="primary-btn w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-sm text-slate-600">
            Need a student account?{' '}
            <Link className="accent-link" to="/register">
              Register here
            </Link>
          </p>
        </section>
      </div>
    </div>
  )
}

export default LoginPage
