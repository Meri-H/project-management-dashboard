export function LoadingSpinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted">
      <div
        className="h-9 w-9 animate-spin rounded-full border-[3px] border-brand-100 border-t-brand-600"
        aria-hidden
      />
      <p className="text-sm">{label}</p>
    </div>
  )
}
