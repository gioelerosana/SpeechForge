interface ErrorBannerProps {
  message: string;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  if (!message) return null;

  return (
    <div className="bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] p-4 rounded-2xl border border-red-300/40 flex items-center gap-2 shadow-sm">
      <span className="font-bold">Error:</span> {message}
    </div>
  );
}
