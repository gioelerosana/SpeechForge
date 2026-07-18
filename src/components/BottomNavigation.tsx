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
      aria-label={copy.nav.primary}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-outline-variant bg-surface-container/95 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-6px_22px_rgba(0,79,79,0.12)] backdrop-blur-xl md:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-3">
        {items.map(({ value, label, icon: Icon }) => {
          const selected = activeTab === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onTabChange(value)}
              aria-current={selected ? "page" : undefined}
              className="group flex flex-col items-center gap-1 pt-3"
            >
              <span
                className={cn(
                  "flex h-8 w-16 items-center justify-center rounded-full transition-colors",
                  selected
                    ? "bg-secondary-container text-on-secondary-container"
                    : "text-on-surface-variant group-hover:bg-on-surface/8 group-active:bg-on-surface/12",
                )}
              >
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <span
                className={cn(
                  "text-xs font-medium transition-colors",
                  selected ? "text-on-surface" : "text-on-surface-variant",
                )}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
