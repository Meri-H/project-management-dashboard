import { Link, Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-surface">
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          backgroundImage:
            'radial-gradient(circle at 12% 18%, rgba(29,111,216,0.14), transparent 42%), radial-gradient(circle at 88% 10%, rgba(21,32,51,0.08), transparent 36%), linear-gradient(180deg, #f7f9fc 0%, #eef2f7 100%)',
        }}
      />
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
        <div className="mb-8 text-center">
          <Link to="/login" className="inline-block">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
              Project Hub
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
              Project Management
            </h1>
          </Link>
          <p className="mt-2 text-sm text-muted">
            Sign in to manage projects, invites, and documents.
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
