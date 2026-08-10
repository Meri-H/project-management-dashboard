export interface ProjectResponse {
  id: number
  name: string
  description: string | null
  owner_id: number
  owner_email: string
  created_at: string
  updated_at: string
}

export interface ProjectCreate {
  name: string
  description?: string | null
}

export interface ProjectUpdate {
  name: string
  description?: string | null
}

export interface ProjectMember {
  id: number
  project_id: number
  user_id: number
  role: string
}

export type ProjectMemberRole = 'owner' | 'participant'

/** Member row returned by GET /projects/{id}/members (includes owner + participants). */
export interface ProjectMemberInfo {
  user_id: number
  email: string
  role: ProjectMemberRole | string
}
