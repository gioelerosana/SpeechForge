import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
  error?: string;
  trailing?: ReactNode;
}

export function TextField({
  label,
  helperText,
  error,
  trailing,
  id,
  className,
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const supportingId = `${inputId}-supporting`;

  return (
    <label htmlFor={inputId} className="block space-y-2">
      <span className="block text-sm font-bold text-on-surface">{label}</span>
      <span className="relative block">
        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={helperText || error ? supportingId : undefined}
          className={cn(
            "min-h-12 w-full rounded-[var(--sf-shape-md)] border bg-surface px-4 py-3 text-on-surface placeholder:text-on-surface-variant/65 transition-colors",
            trailing && "pr-14",
            error ? "border-error" : "border-outline-variant focus:border-primary",
            className,
          )}
          {...props}
        />
        {trailing && <span className="absolute inset-y-0 right-1 flex items-center">{trailing}</span>}
      </span>
      {(error || helperText) && (
        <span
          id={supportingId}
          className={cn("block text-xs", error ? "text-error" : "text-on-surface-variant")}
        >
          {error ?? helperText}
        </span>
      )}
    </label>
  );
}
