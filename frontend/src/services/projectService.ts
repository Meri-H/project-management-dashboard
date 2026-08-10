import { apiJson, getCurrentUserId } from './api'
import type {
  ProjectCreate,
  ProjectMember,
  ProjectMemberInfo,
  ProjectResponse,
  ProjectUpdate,
} from '../types/project'

export async function getProjects(): Promise<ProjectResponse[]> {
  return apiJson<ProjectResponse[]>('/projects/', {
    query: { user_id: getCurrentUserId() },
  })
}

export async function createProject(
  payload: ProjectCreate,
): Promise<ProjectResponse> {
  return apiJson<ProjectResponse>('/projects/', {
    method: 'POST',
    query: { owner_id: getCurrentUserId() },
    body: payload,
  })
}

export async function getProject(projectId: number): Promise<ProjectResponse> {
  return apiJson<ProjectResponse>(`/projects/${projectId}/info`, {
    query: { user_id: getCurrentUserId() },
  })
}

export async function updateProject(
  projectId: number,
  payload: ProjectUpdate,
): Promise<ProjectResponse> {
  return apiJson<ProjectResponse>(`/projects/${projectId}/info`, {
    method: 'PUT',
    query: { user_id: getCurrentUserId() },
    body: payload,
  })
}

export async function deleteProject(projectId: number): Promise<void> {
  return apiJson<void>(`/projects/${projectId}`, {
    method: 'DELETE',
    query: { user_id: getCurrentUserId() },
  })
}

export async function inviteUser(
  projectId: number,
  userLogin: string,
): Promise<ProjectMember> {
  return apiJson<ProjectMember>(`/projects/${projectId}/invite`, {
    method: 'POST',
    query: {
      owner_id: getCurrentUserId(),
      user: userLogin,
    },
  })
}

export async function getProjectMembers(
  projectId: number,
): Promise<ProjectMemberInfo[]> {
  return apiJson<ProjectMemberInfo[]>(`/projects/${projectId}/members`, {
    query: { user_id: getCurrentUserId() },
  })
}

export async function removeProjectMember(
  projectId: number,
  memberUserId: number,
): Promise<void> {
  return apiJson<void>(`/projects/${projectId}/members/${memberUserId}`, {
    method: 'DELETE',
    query: { owner_id: getCurrentUserId() },
  })
}
