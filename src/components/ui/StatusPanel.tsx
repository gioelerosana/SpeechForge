import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "./Card";

interface StatusPanelProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  children?: ReactNode;
  live?: "polite" | "assertive";
}

export function StatusPanel({
  icon: Icon,
  title,
  description,
  children,
  live,
}: StatusPanelProps) {
  return (
    <Card variant="elevated" className="flex flex-col items-center px-6 py-12 text-center" aria-live={live}>
      <div className="mb-5 flex size-16 items-center justify-center rounded-[var(--sf-shape-lg)] bg-primary-container text-on-primary-container">
        <Icon className="size-8" aria-hidden="true" />
      </div>
      <h2 className="text-2xl font-extrabold text-on-surface">{title}</h2>
      {description && <p className="mt-2 max-w-xl text-on-surface-variant">{description}</p>}
      {children && <div className="mt-6">{children}</div>}
    </Card>
  );
}
