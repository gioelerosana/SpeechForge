import type { LucideIcon } from "lucide-react";
import { cn } from "../../utils/cn";

export interface SegmentedItem<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

interface SegmentedControlProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  items: ReadonlyArray<SegmentedItem<T>>;
  ariaLabel: string;
  className?: string;
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  items,
  ariaLabel,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn("inline-flex rounded-[var(--sf-shape-full)] bg-surface-container-high p-1", className)}
    >
      {items.map((item) => {
        const selected = item.value === value;
        const Icon = item.icon;
        return (
          <button
            key={item.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(item.value)}
            className={cn(
              "flex min-h-10 items-center justify-center gap-2 rounded-[var(--sf-shape-full)] px-4 text-sm font-bold transition-all duration-[var(--sf-duration-medium)]",
              selected
                ? "bg-secondary-container text-on-secondary-container shadow-[var(--sf-elevation-1)]"
                : "text-on-surface-variant hover:bg-on-surface/8",
            )}
          >
            {Icon && <Icon className="size-4" aria-hidden="true" />}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
