import { apiJson } from './api'
import type {
  ProjectCreate,
  ProjectMember,
  ProjectMemberInfo,
  ProjectResponse,
  ProjectUpdate,
} from '../types/project'

export async function getProjects(): Promise<ProjectResponse[]> {
  return apiJson<ProjectResponse[]>('/projects/')
}

export async function createProject(
  payload: ProjectCreate,
): Promise<ProjectResponse> {
  return apiJson<ProjectResponse>('/projects/', {
    method: 'POST',
    body: payload,
  })
}

export async function getProject(
  projectId: number,
): Promise<ProjectResponse> {
  return apiJson<ProjectResponse>(
    `/projects/${projectId}/info`,
  )
}

export async function updateProject(
  projectId: number,
  payload: ProjectUpdate,
): Promise<ProjectResponse> {
  return apiJson<ProjectResponse>(
    `/projects/${projectId}/info`,
    {
      method: 'PUT',
      body: payload,
    },
  )
}

export async function deleteProject(
  projectId: number,
): Promise<void> {
  return apiJson<void>(
    `/projects/${projectId}`,
    {
      method: 'DELETE',
    },
  )
}

export async function inviteUser(
  projectId: number,
  userLogin: string,
): Promise<ProjectMember> {
  return apiJson<ProjectMember>(
    `/projects/${projectId}/invite`,
    {
      method: 'POST',

      // This is NOT authentication data.
      // It identifies which user should be invited.
      query: {
        user: userLogin,
      },
    },
  )
}

export async function getProjectMembers(
  projectId: number,
): Promise<ProjectMemberInfo[]> {
  return apiJson<ProjectMemberInfo[]>(
    `/projects/${projectId}/members`,
  )
}

export async function removeProjectMember(
  projectId: number,
  memberUserId: number,
): Promise<void> {
  return apiJson<void>(
    `/projects/${projectId}/members/${memberUserId}`,
    {
      method: 'DELETE',
    },
  )
}