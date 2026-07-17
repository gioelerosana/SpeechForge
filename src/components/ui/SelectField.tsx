import { ChevronDown } from "lucide-react";
import { useId, type SelectHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  helperText?: string;
}

export function SelectField({
  label,
  helperText,
  id,
  className,
  children,
  ...props
}: SelectFieldProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <label htmlFor={selectId} className="block space-y-2">
      <span className="block text-sm font-bold text-on-surface">{label}</span>
      <span className="relative block">
        <select
          id={selectId}
          className={cn(
            "min-h-12 w-full appearance-none rounded-[var(--sf-shape-md)] border border-outline-variant bg-surface px-4 py-3 pr-11 text-on-surface focus:border-primary",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
      </span>
      {helperText && <span className="block text-xs text-on-surface-variant">{helperText}</span>}
    </label>
  );
}
