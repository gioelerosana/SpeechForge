import type { HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "filled" | "outlined" | "elevated";
}

export function Card({ variant = "filled", className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--sf-shape-xl)]",
        variant === "filled" && "bg-surface-container",
        variant === "outlined" && "border border-outline-variant bg-surface",
        variant === "elevated" && "bg-surface-container-low shadow-[var(--sf-elevation-2)]",
        className,
      )}
      {...props}
    />
  );
}
