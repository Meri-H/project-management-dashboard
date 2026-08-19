import { apiJson, apiRequest } from './api'
import type { DocumentResponse } from '../types/document'

export async function getProjectDocuments(
  projectId: number,
): Promise<DocumentResponse[]> {
  return apiJson<DocumentResponse[]>(
    `/projects/${projectId}/documents`,
  )
}

export async function uploadDocument(
  projectId: number,
  file: File,
): Promise<DocumentResponse> {
  const formData = new FormData()
  formData.append('file', file)

  return apiRequest<DocumentResponse>(
    `/projects/${projectId}/documents`,
    {
      method: 'POST',
      body: formData,
    },
  )
}

export async function updateDocument(
  documentId: number,
  file: File,
): Promise<DocumentResponse> {
  const formData = new FormData()
  formData.append('file', file)

  return apiRequest<DocumentResponse>(
    `/documents/${documentId}`,
    {
      method: 'PUT',
      body: formData,
    },
  )
}

export async function deleteDocument(
  documentId: number,
): Promise<void> {
  return apiJson<void>(
    `/documents/${documentId}`,
    {
      method: 'DELETE',
    },
  )
}

export async function downloadDocument(
  documentId: number,
  filename: string,
): Promise<void> {
  const blob = await apiRequest<Blob>(
    `/documents/${documentId}`,
    {
      asBlob: true,
    },
  )

  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = filename

  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()

  URL.revokeObjectURL(url)
}