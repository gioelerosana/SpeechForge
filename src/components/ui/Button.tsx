import { Loader2, type LucideIcon } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "filled" | "tonal" | "outlined" | "text" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  leadingIcon?: LucideIcon;
  fullWidth?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "filled",
  size = "md",
  loading = false,
  leadingIcon: LeadingIcon,
  fullWidth = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const Icon = loading ? Loader2 : LeadingIcon;

  return (
    <button
      type="button"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--sf-shape-full)] font-bold transition-[background,color,box-shadow,transform] duration-[var(--sf-duration-short)] ease-[var(--sf-easing-standard)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-[var(--sf-state-disabled)]",
        variant === "filled" &&
          "bg-primary text-on-primary shadow-[var(--sf-elevation-1)] hover:shadow-[var(--sf-elevation-2)]",
        variant === "tonal" &&
          "bg-secondary-container text-on-secondary-container hover:bg-[color-mix(in_srgb,var(--md-sys-color-secondary-container)_88%,var(--md-sys-color-on-secondary-container))]",
        variant === "outlined" &&
          "border border-outline bg-transparent text-primary hover:bg-primary/8",
        variant === "text" && "bg-transparent text-primary hover:bg-primary/8",
        variant === "danger" && "bg-error text-on-error shadow-[var(--sf-elevation-1)]",
        size === "sm" && "px-4 py-2 text-sm",
        size === "md" && "px-6 py-2.5 text-sm",
        size === "lg" && "px-8 py-3 text-base",
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {Icon && <Icon className={cn("size-5", loading && "animate-spin")} aria-hidden="true" />}
      <span>{children}</span>
    </button>
  );
}
