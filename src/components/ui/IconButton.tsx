import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/cn";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "standard" | "tonal" | "filled";
  size?: "sm" | "md";
  children: ReactNode;
  "aria-label": string;
}

export function IconButton({
  variant = "standard",
  size = "md",
  className,
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-[var(--sf-shape-full)] transition-colors duration-[var(--sf-duration-short)] disabled:pointer-events-none disabled:opacity-[var(--sf-state-disabled)]",
        size === "sm" ? "size-10" : "size-12",
        variant === "standard" && "text-on-surface-variant hover:bg-on-surface/8",
        variant === "tonal" && "bg-secondary-container text-on-secondary-container hover:opacity-90",
        variant === "filled" && "bg-primary text-on-primary hover:opacity-90",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
