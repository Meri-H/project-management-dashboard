import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { ErrorAlert } from '../components/ErrorAlert'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ProjectCard } from '../components/ProjectCard'
import { useAuth } from '../context/AuthContext'
import * as projectService from '../services/projectService'
import type { ProjectResponse } from '../types/project'
import { getErrorMessage } from '../utils/errors'

export function DashboardPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<ProjectResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadProjects = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await projectService.getProjects()
      setProjects(data)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load projects'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadProjects()
  }, [loadProjects])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Projects</h2>
        <p className="mt-1 text-sm text-muted">
          Projects you own or participate in.
        </p>
      </div>

      <ErrorAlert message={error} />

      {loading ? <LoadingSpinner label="Loading projects…" /> : null}

      {!loading && !error && projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project to start inviting teammates and uploading documents."
          action={
            <Link
              to="/projects/new"
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Create project
            </Link>
          }
        />
      ) : null}

      {!loading && projects.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isOwner={user?.id === project.owner_id}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
