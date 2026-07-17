import { AlertCircle } from "lucide-react";
import { useLocale } from "../context/LocaleContext";

interface ErrorBannerProps {
  message: string;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  const { copy } = useLocale();
  if (!message) return null;

  return (
    <div
      role="alert"
      className="mb-6 flex items-start gap-3 rounded-[var(--sf-shape-lg)] bg-error-container p-4 text-on-error-container shadow-[var(--sf-elevation-1)]"
    >
      <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div>
        <p className="font-extrabold">{copy.errors.label}</p>
        <p className="mt-0.5 text-sm">{message}</p>
      </div>
    </div>
  );
}
