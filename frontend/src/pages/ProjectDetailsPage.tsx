import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ConfirmModal } from '../components/ConfirmModal'
import { DocumentSection } from '../components/DocumentSection'
import { ErrorAlert } from '../components/ErrorAlert'
import { InviteForm } from '../components/InviteForm'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ProjectMembersSection } from '../components/ProjectMembersSection'
import { SuccessAlert } from '../components/SuccessAlert'
import { useAuth } from '../context/AuthContext'
import * as documentService from '../services/documentService'
import * as projectService from '../services/projectService'
import type { DocumentResponse } from '../types/document'
import type { ProjectResponse } from '../types/project'
import { formatDateTime } from '../utils/format'
import { getErrorMessage } from '../utils/errors'

export function ProjectDetailsPage() {
  const { projectId: projectIdParam } = useParams()
  const projectId = Number(projectIdParam)
  const navigate = useNavigate()
  const { user } = useAuth()

  const [project, setProject] = useState<ProjectResponse | null>(null)
  const [documents, setDocuments] = useState<DocumentResponse[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [membersRefreshKey, setMembersRefreshKey] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = useCallback(async () => {
    if (!Number.isFinite(projectId)) {
      setError('Invalid project id')
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    try {
      const [projectData, documentData] = await Promise.all([
        projectService.getProject(projectId),
        documentService.getProjectDocuments(projectId),
      ])
      setProject(projectData)
      setName(projectData.name)
      setDescription(projectData.description ?? '')
      setDocuments(documentData)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load project'))
      setProject(null)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    void load()
  }, [load])

  const handleSave = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Project name is required.')
      return
    }

    setSaving(true)
    try {
      const updated = await projectService.updateProject(projectId, {
        name: trimmedName,
        description: description.trim() || null,
      })
      setProject(updated)
      setSuccess('Project details saved.')
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update project'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setError('')
    setSuccess('')
    setDeleting(true)
    try {
      await projectService.deleteProject(projectId)
      navigate('/', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Could not delete project'))
      setConfirmDelete(false)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return <LoadingSpinner label="Loading project…" />
  }

  if (!project) {
    return (
      <div className="space-y-4">
        <ErrorAlert message={error || 'Project not found'} />
        <Link to="/" className="text-sm font-medium text-brand-700 hover:underline">
          ← Back to projects
        </Link>
      </div>
    )
  }

  const isOwner = user?.id === project.owner_id

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link to="/" className="text-sm font-medium text-brand-700 hover:underline">
            ← Back to projects
          </Link>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink">
            {project.name}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            {project.description?.trim() || 'No description provided.'}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                isOwner
                  ? 'bg-brand-50 text-brand-700'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {isOwner ? 'You are the owner' : 'You are a participant'}
            </span>
            <span className="truncate">
              Owner: <span className="font-medium text-ink/80">{project.owner_email}</span>
            </span>
            <span>Created {formatDateTime(project.created_at)}</span>
            <span>Updated {formatDateTime(project.updated_at)}</span>
          </div>
        </div>

        {isOwner ? (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="btn-danger-outline px-4 py-2 text-sm"
          >
            Delete project
          </button>
        ) : null}
      </div>

      <ErrorAlert message={error} />
      <SuccessAlert message={success} />

      <form
        onSubmit={(event) => void handleSave(event)}
        className="space-y-4 rounded-xl border border-line bg-white p-5"
      >
        <h3 className="text-lg font-semibold text-ink">Project details</h3>

        <label className="block text-sm font-medium text-ink">
          Name
          <input
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="input-field mt-1"
          />
        </label>

        <label className="block text-sm font-medium text-ink">
          Description
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            className="input-field mt-1"
          />
        </label>

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>

      {isOwner ? (
        <InviteForm
          projectId={project.id}
          onInvited={() => setMembersRefreshKey((key) => key + 1)}
        />
      ) : null}

      <ProjectMembersSection
        projectId={project.id}
        isOwner={isOwner}
        refreshKey={membersRefreshKey}
      />

      <DocumentSection
        projectId={project.id}
        documents={documents}
        onChanged={async () => {
          const docs = await documentService.getProjectDocuments(project.id)
          setDocuments(docs)
        }}
      />

      <ConfirmModal
        open={confirmDelete}
        title="Delete project?"
        message={`Delete “${project.name}” and all of its documents? This cannot be undone.`}
        confirmLabel="Delete project"
        busy={deleting}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  )
}
