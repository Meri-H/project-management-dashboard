import { useState, type FormEvent } from 'react'
import * as projectService from '../services/projectService'
import { ErrorAlert } from './ErrorAlert'
import { SuccessAlert } from './SuccessAlert'
import { getErrorMessage } from '../utils/errors'

type InviteFormProps = {
  projectId: number
  onInvited?: () => void
}

export function InviteForm({ projectId, onInvited }: InviteFormProps) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    const trimmed = email.trim()
    if (!trimmed) {
      setError('Enter an email / login to invite.')
      return
    }

    setBusy(true)
    try {
      await projectService.inviteUser(projectId, trimmed)
      setSuccess(`Invited “${trimmed}” as a participant.`)
      setEmail('')
      onInvited?.()
    } catch (err) {
      setError(getErrorMessage(err, 'Invite failed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="rounded-xl border border-line bg-white p-5">
      <h2 className="text-lg font-semibold text-ink">Invite participant</h2>
      <p className="mt-1 text-sm text-muted">
        Only the project owner can invite users by email/login.
      </p>

      <form onSubmit={(event) => void handleSubmit(event)} className="mt-4 space-y-4">
        <label className="block text-sm font-medium text-ink">
          Email / login
          <input
            type="text"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="off"
            className="input-field mt-1"
            placeholder="colleague@example.com"
          />
        </label>

        <ErrorAlert message={error} />
        <SuccessAlert message={success} />

        <button type="submit" disabled={busy} className="btn-primary">
          {busy ? 'Inviting…' : 'Send invite'}
        </button>
      </form>
    </section>
  )
}
