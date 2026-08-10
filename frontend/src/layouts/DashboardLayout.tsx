import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
    isActive
      ? 'bg-brand-600 text-white shadow-sm'
      : 'text-slate-300 hover:bg-white/8 hover:text-white'
  }`

export function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="bg-sidebar text-white">
        <div className="flex h-full flex-col px-4 py-5">
          <Link to="/" className="px-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Project Hub
            </p>
            <h1 className="mt-1 text-lg font-semibold">Dashboard</h1>
          </Link>

          <nav className="mt-8 flex flex-col gap-1.5">
            <NavLink to="/" end className={navLinkClass}>
              Projects
            </NavLink>
            <NavLink to="/projects/new" className={navLinkClass}>
              New project
            </NavLink>
          </nav>

          <div className="mt-auto border-t border-white/10 pt-4">
            <p className="truncate px-2 text-sm font-medium">{user?.full_name}</p>
            <p className="truncate px-2 text-xs text-slate-400">{user?.email}</p>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 w-full rounded-lg border border-white/15 px-3 py-2.5 text-left text-sm text-slate-200 transition hover:bg-white/8"
            >
              Log out
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="border-b border-line bg-white px-4 py-4 sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted">Welcome back</p>
              <p className="font-semibold text-ink">{user?.full_name}</p>
            </div>
            <Link to="/projects/new" className="btn-primary">
              Create project
            </Link>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
