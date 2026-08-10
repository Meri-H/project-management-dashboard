import { useRef, useState } from 'react'
import type { DocumentResponse } from '../types/document'
import * as documentService from '../services/documentService'
import { ConfirmModal } from './ConfirmModal'
import { EmptyState } from './EmptyState'
import { ErrorAlert } from './ErrorAlert'
import { SuccessAlert } from './SuccessAlert'
import { fileTypeLabel, formatDateTime, formatFileSize } from '../utils/format'
import { getErrorMessage } from '../utils/errors'

type DocumentSectionProps = {
  projectId: number
  documents: DocumentResponse[]
  onChanged: () => Promise<void> | void
}

const ACCEPTED = '.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document'

export function DocumentSection({
  projectId,
  documents,
  onChanged,
}: DocumentSectionProps) {
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const replaceInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<DocumentResponse | null>(null)
  const [replaceTarget, setReplaceTarget] = useState<DocumentResponse | null>(null)

  const clearFeedback = () => {
    setError('')
    setSuccess('')
  }

  const handleUpload = async (file: File | undefined) => {
    if (!file) {
      return
    }

    clearFeedback()
    setBusy(true)
    try {
      await documentService.uploadDocument(projectId, file)
      setSuccess(`Uploaded “${file.name}”.`)
      await onChanged()
    } catch (err) {
      setError(getErrorMessage(err, 'Upload failed'))
    } finally {
      setBusy(false)
      if (uploadInputRef.current) {
        uploadInputRef.current.value = ''
      }
    }
  }

  const handleReplace = async (file: File | undefined) => {
    if (!file || !replaceTarget) {
      return
    }

    clearFeedback()
    setBusy(true)
    try {
      await documentService.updateDocument(replaceTarget.id, file)
      setSuccess(`Replaced “${replaceTarget.filename}” with “${file.name}”.`)
      setReplaceTarget(null)
      await onChanged()
    } catch (err) {
      setError(getErrorMessage(err, 'Replace failed'))
    } finally {
      setBusy(false)
      if (replaceInputRef.current) {
        replaceInputRef.current.value = ''
      }
    }
  }

  const handleDownload = async (doc: DocumentResponse) => {
    clearFeedback()
    setBusy(true)
    try {
      await documentService.downloadDocument(doc.id, doc.filename)
    } catch (err) {
      setError(getErrorMessage(err, 'Download failed'))
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) {
      return
    }

    clearFeedback()
    setBusy(true)
    try {
      await documentService.deleteDocument(deleteTarget.id)
      setSuccess(`Deleted “${deleteTarget.filename}”.`)
      setDeleteTarget(null)
      await onChanged()
    } catch (err) {
      setError(getErrorMessage(err, 'Delete failed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">Documents</h2>
          <p className="text-sm text-muted">Upload PDF or DOCX files for this project.</p>
        </div>
        <div>
          <input
            ref={uploadInputRef}
            type="file"
            accept={ACCEPTED}
            className="hidden"
            onChange={(event) => void handleUpload(event.target.files?.[0])}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => uploadInputRef.current?.click()}
            className="btn-primary"
          >
            Upload document
          </button>
        </div>
      </div>

      <ErrorAlert message={error} />
      <SuccessAlert message={success} />

      <input
        ref={replaceInputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={(event) => void handleReplace(event.target.files?.[0])}
      />

      {documents.length === 0 ? (
        <EmptyState
          title="No documents yet"
          description="Upload a PDF or DOCX file to get started."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-line bg-surface text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Filename</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Size</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                  <th className="px-4 py-3 font-semibold">Updated</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 font-medium text-ink">{doc.filename}</td>
                    <td className="px-4 py-3 text-muted">
                      {fileTypeLabel(doc.content_type, doc.filename)}
                    </td>
                    <td className="px-4 py-3 text-muted">{formatFileSize(doc.size)}</td>
                    <td className="px-4 py-3 text-muted">
                      {formatDateTime(doc.created_at)}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {formatDateTime(doc.updated_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void handleDownload(doc)}
                          className="btn-secondary px-2.5 py-1 text-xs"
                        >
                          Download
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => {
                            setReplaceTarget(doc)
                            replaceInputRef.current?.click()
                          }}
                          className="btn-secondary px-2.5 py-1 text-xs"
                        >
                          Replace
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setDeleteTarget(doc)}
                          className="btn-danger-outline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete document?"
        message={
          deleteTarget
            ? `Delete “${deleteTarget.filename}”? This cannot be undone.`
            : ''
        }
        busy={busy}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
      />
    </section>
  )
}
