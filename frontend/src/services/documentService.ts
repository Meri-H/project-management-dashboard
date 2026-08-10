import { apiJson, apiRequest, getCurrentUserId } from './api'
import type { DocumentResponse } from '../types/document'

export async function getProjectDocuments(
  projectId: number,
): Promise<DocumentResponse[]> {
  return apiJson<DocumentResponse[]>(`/projects/${projectId}/documents`, {
    query: { user_id: getCurrentUserId() },
  })
}

export async function uploadDocument(
  projectId: number,
  file: File,
): Promise<DocumentResponse> {
  const formData = new FormData()
  formData.append('file', file)

  return apiRequest<DocumentResponse>(`/projects/${projectId}/documents`, {
    method: 'POST',
    query: { user_id: getCurrentUserId() },
    body: formData,
  })
}

export async function updateDocument(
  documentId: number,
  file: File,
): Promise<DocumentResponse> {
  const formData = new FormData()
  formData.append('file', file)

  return apiRequest<DocumentResponse>(`/documents/${documentId}`, {
    method: 'PUT',
    query: { user_id: getCurrentUserId() },
    body: formData,
  })
}

export async function deleteDocument(documentId: number): Promise<void> {
  return apiJson<void>(`/documents/${documentId}`, {
    method: 'DELETE',
    query: { user_id: getCurrentUserId() },
  })
}

export async function downloadDocument(
  documentId: number,
  filename: string,
): Promise<void> {
  const blob = await apiRequest<Blob>(`/documents/${documentId}`, {
    query: { user_id: getCurrentUserId() },
    asBlob: true,
  })

  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
