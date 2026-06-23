import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navigationByRole = {
  student: [
    { to: '/student', label: 'Opportunity Feed', hint: 'Deadlines' },
    { to: '/student/tracking', label: 'My Tracking', hint: 'Status' },
  ],
  admin: [
    { to: '/admin/opportunities', label: 'Opportunities', hint: 'Listings' },
    { to: '/admin/users', label: 'Users', hint: 'Accounts' },
  ],
}

function AppLayout({ role }) {
  const { logout, user } = useAuth()
  const navItems = navigationByRole[role]

  return (
    <div className="dashboard-shell">
      <div className="dashboard-grid">
        <aside className="side-panel">
          <div className="sidebar-scroll">
            <div className="sidebar-stack">
              <div className="sidebar-header">
                <div className="min-w-0">
                  <div className="brand-lockup">
                    <img className="brand-logo" src="/instrackerlogo.svg" alt="instracker logo" />
                    <div>
                      <p className="brand-name">instracker</p>
                    </div>
                  </div>
                  <h1 className="layout-heading">
                    {role === 'admin' ? 'Admin command' : 'Student workspace'}
                  </h1>
                </div>
                <span className="status-pill status-consulted">{user?.role}</span>
              </div>

              <div className="panel-card w-full">
                <p className="text-sm text-slate-500">Signed in as</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{user?.username}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {role === 'admin' ? 'Manage the platform.' : 'Track your applications.'}
                </p>
              </div>

              <nav className="sidebar-nav">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `nav-link ${isActive ? 'nav-link-active' : ''}`
                    }
                  >
                    <span className="nav-link-title">{item.label}</span>
                    <span className="nav-link-hint">{item.hint}</span>
                  </NavLink>
                ))}
              </nav>

              <div className="surface-subtle sidebar-footer">
                <p className="text-sm font-medium text-slate-900">Local session</p>
                <button type="button" className="secondary-btn mt-4 w-full" onClick={logout}>
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </aside>

        <main className="main-panel">
          <header className="panel-card">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="eyebrow">Dashboard</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
                  {role === 'admin'
                    ? 'Manage listings and users.'
                    : 'Track your next application.'}
                </h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[320px]">
                <div className="metric-card">
                  <p className="metric-label">Mode</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {role === 'admin' ? 'Platform Control' : 'Application Tracking'}
                  </p>
                </div>
                <div className="metric-card">
                  <p className="metric-label">Session</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">Live and protected</p>
                </div>
              </div>
            </div>
          </header>

          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
