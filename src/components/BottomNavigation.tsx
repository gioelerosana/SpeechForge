import { AudioLines, Languages, MessageSquare } from "lucide-react";
import { useLocale } from "../context/LocaleContext";
import type { ActiveTab } from "../types";
import { cn } from "../utils/cn";

interface BottomNavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const { copy } = useLocale();
  const items = [
    { value: "transcribe" as const, label: copy.nav.transcribe, icon: AudioLines },
    { value: "translate" as const, label: copy.nav.translate, icon: Languages },
    { value: "chat" as const, label: copy.nav.chat, icon: MessageSquare },
  ];

  return (
    <nav
      aria-label="Primary navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-outline-variant bg-surface-container/95 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-6px_22px_rgba(0,79,79,0.12)] backdrop-blur-xl md:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-3 gap-1">
        {items.map(({ value, label, icon: Icon }) => {
          const selected = activeTab === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onTabChange(value)}
              aria-current={selected ? "page" : undefined}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-[var(--sf-shape-lg)] px-2 text-xs font-bold transition-colors",
                selected
                  ? "bg-secondary-container text-on-secondary-container"
                  : "text-on-surface-variant hover:bg-on-surface/8",
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
