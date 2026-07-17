import { KeyRound } from "lucide-react";
import { Button, Card } from "./ui";
import { useLocale } from "../context/LocaleContext";

interface ProviderGateProps {
  title: string;
  description: string;
  onOpenSettings: () => void;
}

export function ProviderGate({ title, description, onOpenSettings }: ProviderGateProps) {
  const { copy } = useLocale();
  return (
    <Card variant="elevated" className="flex flex-col items-start gap-5 p-7 sm:flex-row sm:items-center">
      <span className="flex size-14 shrink-0 items-center justify-center rounded-[var(--sf-shape-lg)] bg-primary-container text-on-primary-container">
        <KeyRound className="size-7" />
      </span>
      <div className="flex-1">
        <h2 className="text-xl font-extrabold text-on-surface">{title}</h2>
        <p className="mt-1 text-sm text-on-surface-variant">{description}</p>
      </div>
      <Button variant="tonal" onClick={onOpenSettings}>{copy.common.settings}</Button>
    </Card>
  );
}
