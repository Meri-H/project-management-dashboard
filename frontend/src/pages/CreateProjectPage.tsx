import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ErrorAlert } from '../components/ErrorAlert'
import * as projectService from '../services/projectService'
import { getErrorMessage } from '../utils/errors'

export function CreateProjectPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')

    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Project name is required.')
      return
    }

    setBusy(true)
    try {
      const project = await projectService.createProject({
        name: trimmedName,
        description: description.trim() || null,
      })
      navigate(`/projects/${project.id}`, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Could not create project'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link to="/" className="text-sm font-medium text-brand-700 hover:underline">
          ← Back to projects
        </Link>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink">
          Create project
        </h2>
        <p className="mt-1 text-sm text-muted">
          You will be the owner of this project.
        </p>
      </div>

      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="space-y-4 rounded-xl border border-line bg-white p-6"
      >
        <label className="block text-sm font-medium text-ink">
          Name
          <input
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="input-field mt-1"
            placeholder="Website redesign"
          />
        </label>

        <label className="block text-sm font-medium text-ink">
          Description
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            className="input-field mt-1"
            placeholder="Optional project summary"
          />
        </label>

        <ErrorAlert message={error} />

        <div className="flex gap-3">
          <button type="submit" disabled={busy} className="btn-primary">
            {busy ? 'Creating…' : 'Create project'}
          </button>
          <Link to="/" className="btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
