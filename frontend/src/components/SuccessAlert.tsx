export function SuccessAlert({ message }: { message: string }) {
  if (!message) {
    return null
  }

  return (
    <div
      role="status"
      className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
    >
      {message}
    </div>
  )
}
