import { useCallback, useEffect, useMemo, useState } from 'react'
import * as projectService from '../services/projectService'
import type { ProjectMemberInfo } from '../types/project'
import { ConfirmModal } from './ConfirmModal'
import { EmptyState } from './EmptyState'
import { ErrorAlert } from './ErrorAlert'
import { LoadingSpinner } from './LoadingSpinner'
import { SuccessAlert } from './SuccessAlert'
import { getErrorMessage } from '../utils/errors'

type ProjectMembersSectionProps = {
  projectId: number
  isOwner: boolean
  refreshKey?: number
}

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
      />
    </svg>
  )
}

function sortMembers(members: ProjectMemberInfo[]): ProjectMemberInfo[] {
  return [...members].sort((a, b) => {
    const aOwner = a.role === 'owner' ? 0 : 1
    const bOwner = b.role === 'owner' ? 0 : 1
    if (aOwner !== bOwner) {
      return aOwner - bOwner
    }
    return a.email.localeCompare(b.email)
  })
}

export function ProjectMembersSection({
  projectId,
  isOwner,
  refreshKey = 0,
}: ProjectMembersSectionProps) {
  const [members, setMembers] = useState<ProjectMemberInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<ProjectMemberInfo | null>(null)

  const loadMembers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await projectService.getProjectMembers(projectId)
      setMembers(sortMembers(data))
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load project members'))
      setMembers([])
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    void loadMembers()
  }, [loadMembers, refreshKey])

  const sortedMembers = useMemo(() => sortMembers(members), [members])

  const handleRemove = async () => {
    if (!removeTarget || removeTarget.role !== 'participant') {
      setRemoveTarget(null)
      return
    }

    setBusy(true)
    setError('')
    setSuccess('')
    try {
      await projectService.removeProjectMember(projectId, removeTarget.user_id)
      setMembers((current) =>
        sortMembers(
          current.filter((member) => member.user_id !== removeTarget.user_id),
        ),
      )
      setSuccess(`Removed “${removeTarget.email}” from this project.`)
      setRemoveTarget(null)
    } catch (err) {
      setError(getErrorMessage(err, 'Could not remove participant'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-ink">Project Members</h2>
        <p className="mt-1 text-sm text-muted">
          Owner and participants with access to this project.
        </p>
      </div>

      <ErrorAlert message={error} />
      <SuccessAlert message={success} />

      {loading ? <LoadingSpinner label="Loading members…" /> : null}

      {!loading && sortedMembers.length === 0 ? (
        <EmptyState
          title="No members yet"
          description="Member information is unavailable for this project."
        />
      ) : null}

      {!loading && sortedMembers.length > 0 ? (
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
          {sortedMembers.map((member) => {
            const isMemberOwner = member.role === 'owner'
            const canRemove = isOwner && member.role === 'participant'

            return (
              <li
                key={`${member.role}-${member.user_id}`}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      isMemberOwner
                        ? 'bg-brand-50 text-brand-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <UserIcon />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">
                      {member.email}
                    </p>
                    <span
                      className={`mt-1 inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${
                        isMemberOwner
                          ? 'bg-brand-50 text-brand-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isMemberOwner ? 'Owner' : 'Participant'}
                    </span>
                  </div>
                </div>

                {canRemove ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setRemoveTarget(member)}
                    className="btn-danger-outline"
                  >
                    Remove
                  </button>
                ) : null}
              </li>
            )
          })}
        </ul>
      ) : null}

      <ConfirmModal
        open={removeTarget !== null}
        title="Remove participant?"
        message={
          removeTarget
            ? `Remove ${removeTarget.email} from this project?`
            : ''
        }
        confirmLabel="Remove"
        busy={busy}
        onCancel={() => setRemoveTarget(null)}
        onConfirm={() => void handleRemove()}
      />
    </section>
  )
}
