import { AudioLines, Languages, MessageSquare, Moon, Settings, Sun } from "lucide-react";
import { useLocale } from "../context/LocaleContext";
import type { ResolvedTheme } from "../context/ThemeContext";
import type { ActiveTab } from "../types";
import { cn } from "../utils/cn";
import { IconButton, SegmentedControl } from "./ui";

interface AppHeaderProps {
  theme: ResolvedTheme;
  toggleTheme: () => void;
  tauriEnv: boolean;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onHome: () => void;
  onOpenSettings: () => void;
}

export function AppHeader({
  theme,
  toggleTheme,
  tauriEnv,
  activeTab,
  onTabChange,
  onHome,
  onOpenSettings,
}: AppHeaderProps) {
  const { copy } = useLocale();
  const items = [
    { value: "transcribe" as const, label: copy.nav.transcribe, icon: AudioLines },
    { value: "translate" as const, label: copy.nav.translate, icon: Languages },
    { value: "chat" as const, label: copy.nav.chat, icon: MessageSquare },
  ];

  return (
    <header
      className={cn(
        "sticky z-40 mb-14 transition-colors duration-[var(--sf-duration-medium)]",
        tauriEnv ? "top-8" : "top-0 pt-[env(safe-area-inset-top)]",
      )}
    >
      <div className={cn("mx-auto max-w-5xl px-4 sm:px-6 lg:px-8", tauriEnv ? "py-2" : "py-4")}>
        <div className="flex min-h-16 items-center justify-between gap-4 rounded-[var(--sf-shape-xl)] border border-outline-variant bg-surface-container/95 px-4 shadow-[var(--sf-elevation-1)] backdrop-blur-xl sm:px-5">
          <button
            type="button"
            onClick={onHome}
            className="flex min-h-11 items-center gap-3 rounded-[var(--sf-shape-md)] text-left"
            aria-label={copy.nav.home}
          >
            <span className="flex size-10 items-center justify-center rounded-[var(--sf-shape-md)] bg-primary text-on-primary shadow-[var(--sf-elevation-1)]">
              <AudioLines className="size-5" aria-hidden="true" />
            </span>
            <span className="hidden text-lg font-extrabold tracking-tight text-on-surface sm:block">
              SpeechForge
            </span>
          </button>

          <SegmentedControl<ActiveTab>
            value={activeTab}
            onChange={onTabChange}
            items={items}
            ariaLabel="Application section"
            className="hidden md:inline-flex"
          />

          <div className="flex items-center gap-1">
            <IconButton aria-label="Toggle theme" onClick={toggleTheme} size="sm">
              {theme === "light" ? <Moon className="size-5" /> : <Sun className="size-5" />}
            </IconButton>
            <IconButton aria-label={copy.common.settings} onClick={onOpenSettings} variant="tonal" size="sm">
              <Settings className="size-5" />
            </IconButton>
          </div>
        </div>
      </div>
    </header>
  );
}
