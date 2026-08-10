export function formatDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return iso
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  const units = ['KB', 'MB', 'GB', 'TB']
  let size = bytes / 1024
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex += 1
  }

  const precision = size >= 10 || unitIndex === 0 ? 0 : 1
  return `${size.toFixed(precision)} ${units[unitIndex]}`
}

export function fileTypeLabel(contentType: string, filename: string): string {
  const lowerName = filename.toLowerCase()
  if (lowerName.endsWith('.pdf') || contentType === 'application/pdf') {
    return 'PDF'
  }
  if (
    lowerName.endsWith('.docx') ||
    contentType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return 'DOCX'
  }
  if (lowerName.endsWith('.doc') || contentType === 'application/msword') {
    return 'DOC'
  }
  if (contentType) {
    return contentType.split('/').pop()?.toUpperCase() ?? contentType
  }
  return 'File'
}
