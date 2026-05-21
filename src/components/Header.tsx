import React, { useState, useRef, useEffect } from "react";
import { AudioLines, ChevronDown, Moon, Sun, Settings, Languages } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useTheme } from "../context/ThemeContext";
import { type Status } from "../types";

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

interface HeaderProps {
  activeTab: "transcribe" | "translate";
  setActiveTab: (tab: "transcribe" | "translate") => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  tauriEnv: boolean;
  status: Status;
  setStatus: (status: Status) => void;
  setTranscription: (text: string) => void;
  setError: (text: string) => void;
  setTranslationInitialText: (text: string) => void;
}

export function Header({
  activeTab,
  setActiveTab,
  showSettings,
  setShowSettings,
  tauriEnv,
  status,
  setStatus,
  setTranscription,
  setError,
  setTranslationInitialText,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [showLogoMenu, setShowLogoMenu] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!showLogoMenu) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowLogoMenu(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showLogoMenu]);

  const isTranscribe = activeTab === "transcribe";

  const logoContent = (
    <div className="relative min-w-0 flex-1">
      <button
        ref={triggerRef}
        onClick={() => setShowLogoMenu((v) => !v)}
        className="flex items-center gap-2 min-w-0 w-full hover:opacity-85 transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-xl px-2 py-1"
        aria-label="Cambia modalità"
        aria-expanded={showLogoMenu}
        aria-haspopup="menu"
      >
        {/* Icon pill — visually "seeds" the expanding panel */}
        <div className={cn(
          "w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex-shrink-0 flex items-center justify-center text-on-primary transition-all duration-300",
          isTranscribe
            ? "bg-primary shadow-[0_8px_18px_rgba(79,70,229,0.35)]"
            : "bg-tertiary shadow-[0_8px_18px_rgba(124,58,237,0.35)]",
          showLogoMenu && "scale-95 shadow-none",
        )}>
          {isTranscribe
            ? <AudioLines className="w-4 h-4 sm:w-5 sm:h-5" />
            : <Languages className="w-4 h-4 sm:w-5 sm:h-5" />
          }
        </div>

        <div className="flex items-center gap-1 min-w-0 overflow-hidden">
          <h1 className="text-base sm:text-xl font-extrabold tracking-tight text-on-surface flex items-center gap-1 sm:gap-1.5 min-w-0">
            <span className="shrink-0">SpeechForge</span>
            <span className="text-on-surface-variant/40 font-normal shrink-0">·</span>
            <span className={cn(
              "font-medium text-sm sm:text-base truncate transition-colors duration-300",
              isTranscribe ? "text-primary" : "text-tertiary",
            )}>
              {isTranscribe ? "Transcribe" : "Translate"}
            </span>
          </h1>
          <ChevronDown className={cn(
            "w-3.5 h-3.5 sm:w-4 sm:h-4 text-on-surface-variant opacity-50 transition-transform duration-300 flex-shrink-0",
            showLogoMenu && "rotate-180 opacity-100",
          )} />
        </div>
      </button>

      {/* Click-away backdrop */}
      {showLogoMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowLogoMenu(false)}
        />
      )}

      {/*
        Dropdown panel — styled to look like a downward extension of the header pill.
        Uses transform-origin: top left so it unfolds from the trigger point.
        The caret triangle visually connects it to the header bar above.
      */}
      <div
        role="menu"
        aria-label="Seleziona modalità"
        className={cn(
          "absolute left-0 z-50 w-56 transition-all duration-250 ease-out",
          // Offset: sit right below the header pill with a tiny gap
          "top-[calc(100%+6px)]",
          showLogoMenu
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 -translate-y-2 scale-95 pointer-events-none",
        )}
        style={{ transformOrigin: "top left" }}
      >
        {/* Caret / connector pointing up to the header bar */}
        <div className="relative ml-5 mb-[-1px] w-fit">
          {/* Outer caret (border color) */}
          <div
            className="w-0 h-0"
            style={{
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderBottom: "8px solid var(--md-sys-color-outline)",
              opacity: 0.2,
            }}
          />
          {/* Inner caret (background color) */}
          <div
            className="absolute top-[1px] left-0"
            style={{
              width: 0,
              height: 0,
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderBottom: "8px solid var(--md-sys-color-surface-container-high)",
            }}
          />
        </div>

        {/* Panel body */}
        <div className="rounded-2xl border border-outline/20 bg-surface-container-high/95 backdrop-blur-xl shadow-[0_16px_48px_rgba(22,27,45,0.18)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.45)] overflow-hidden">

          {/* Header inside the panel */}
          <div className="px-4 pt-3 pb-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant/50 select-none">
              Modalità
            </p>
          </div>

          {/* Transcribe option */}
          <button
            role="menuitem"
            onClick={() => {
              setActiveTab("transcribe");
              setShowLogoMenu(false);
              if (status !== "done") {
                setStatus("idle");
                setTranscription("");
                setError("");
                setTranslationInitialText("");
              }
            }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all duration-150 group",
              activeTab === "transcribe"
                ? "text-primary"
                : "text-on-surface hover:text-primary",
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200",
              activeTab === "transcribe"
                ? "bg-primary text-on-primary shadow-[0_4px_12px_rgba(79,70,229,0.4)]"
                : "bg-surface-container-highest text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary",
            )}>
              <AudioLines className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="font-bold leading-tight">Transcribe</div>
              <div className="text-[11px] text-on-surface-variant/60 font-normal">
                Audio → testo
              </div>
            </div>
            {activeTab === "transcribe" && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
            )}
          </button>

          <div className="mx-4 h-px bg-outline/10" />

          {/* Translate option */}
          <button
            role="menuitem"
            onClick={() => {
              setActiveTab("translate");
              setShowLogoMenu(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all duration-150 group",
              activeTab === "translate"
                ? "text-tertiary"
                : "text-on-surface hover:text-tertiary",
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200",
              activeTab === "translate"
                ? "bg-tertiary text-on-tertiary shadow-[0_4px_12px_rgba(124,58,237,0.4)]"
                : "bg-surface-container-highest text-on-surface-variant group-hover:bg-tertiary/10 group-hover:text-tertiary",
            )}>
              <Languages className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="font-bold leading-tight">Translate</div>
              <div className="text-[11px] text-on-surface-variant/60 font-normal">
                Testo → lingua
              </div>
            </div>
            {activeTab === "translate" && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-tertiary flex-shrink-0" />
            )}
          </button>

          <div className="h-2" />
        </div>
      </div>
    </div>
  );

  const actionsContent = (
    <div className="flex items-center justify-end gap-1.5 sm:gap-2 flex-shrink-0 ml-2">
      <button
        onClick={toggleTheme}
        className="p-2 sm:p-2.5 rounded-2xl bg-surface-container-high hover:bg-surface-container-highest transition-colors text-on-surface-variant focus-visible:ring-2 focus-visible:ring-primary/40 outline-none"
        aria-label="Toggle theme"
      >
        {theme === "light" ? (
          <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
        ) : (
          <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
        )}
      </button>
      <button
        onClick={() => setShowSettings(!showSettings)}
        className={cn(
          "p-2 sm:p-2.5 rounded-2xl bg-primary-container text-on-primary-container hover:opacity-90 transition-colors focus-visible:ring-2 focus-visible:ring-primary/40 outline-none",
          showSettings && "ring-2 ring-primary/30",
        )}
        aria-label="Settings"
      >
        <Settings
          className={cn(
            "w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300",
            showSettings && "rotate-90",
          )}
        />
      </button>
    </div>
  );

  return (
    <header
      className={cn(
        "sticky z-10 transition-colors duration-200 mb-10 w-full",
        tauriEnv ? "top-8 pt-2" : "top-0 pt-[env(safe-area-inset-top)]",
      )}
    >
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-2">
        <div className="flex rounded-[28px] border border-outline/25 bg-surface-container/95 backdrop-blur-md px-3 sm:px-5 py-2.5 sm:py-3 items-center gap-2 shadow-[0_4px_16px_rgba(22,27,45,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.15)]">
          {logoContent}
          {actionsContent}
        </div>
      </div>
    </header>
  );
}
