import { Link } from 'react-router-dom'
import type { ProjectResponse } from '../types/project'
import { formatDateTime } from '../utils/format'

type ProjectCardProps = {
  project: ProjectResponse
  isOwner: boolean
}

export function ProjectCard({ project, isOwner }: ProjectCardProps) {
  return (
    <Link
      to={`/projects/${project.id}`}
      className="group block rounded-xl border border-line bg-white p-5 transition duration-150 hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold leading-snug text-ink transition-colors group-hover:text-brand-700">
          {project.name}
        </h3>
        {isOwner ? (
          <span className="shrink-0 rounded-md bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
            Owner
          </span>
        ) : null}
      </div>
      <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-muted">
        {project.description?.trim() || 'No description provided.'}
      </p>
      <div className="mt-4 space-y-1 border-t border-line pt-3 text-xs text-muted">
        <p className="truncate">
          <span className="font-medium text-ink/70">Owner:</span>{' '}
          {project.owner_email}
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span>Created {formatDateTime(project.created_at)}</span>
          <span>Updated {formatDateTime(project.updated_at)}</span>
        </div>
      </div>
    </Link>
  )
}
