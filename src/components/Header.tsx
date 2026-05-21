import React, { useState } from "react";
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

  const logoContent = (
    <div className="relative">
      <button
        onClick={() => setShowLogoMenu(!showLogoMenu)}
        className="flex items-center gap-3 min-w-0 hover:opacity-85 transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-xl px-2 py-1"
        aria-label="Toggle Menu"
        aria-expanded={showLogoMenu}
      >
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-on-primary bg-primary shadow-[0_8px_18px_rgba(79,70,229,0.35)] dark:shadow-none transition-transform hover:scale-105">
          <AudioLines className="w-5 h-5 animate-pulse" />
        </div>
        <div className="flex items-center gap-1">
          <h1 className="text-xl font-extrabold tracking-tight text-on-surface truncate">
            SpeechForge - Transcription/Translation
          </h1>
          <ChevronDown className={cn(
            "w-4 h-4 text-on-surface-variant opacity-50 transition-all",
            showLogoMenu && "rotate-180 opacity-100"
          )} />
        </div>
      </button>

      {/* Click-away overlay */}
      {showLogoMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowLogoMenu(false)}
        />
      )}

      {/* Dropdown Menu */}
      <div className={cn(
        "absolute top-full left-0 mt-2 w-48 rounded-2xl border border-outline/20 bg-surface-container-high shadow-xl transition-all duration-200 z-50 overflow-hidden",
        showLogoMenu 
          ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" 
          : "opacity-0 translate-y-2 scale-95 pointer-events-none"
      )}>
        <button
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
            "w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors hover:bg-surface-container-highest",
            activeTab === "transcribe"
              ? "text-primary bg-primary-container/10"
              : "text-on-surface",
          )}
        >
          <AudioLines className="w-4 h-4 text-primary" />
          Transcription
        </button>
        <button
          onClick={() => {
            setActiveTab("translate");
            setShowLogoMenu(false);
          }}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors hover:bg-surface-container-highest",
            activeTab === "translate"
              ? "text-tertiary bg-tertiary-container/10"
              : "text-on-surface",
          )}
        >
          <Languages className="w-4 h-4 text-tertiary" />
          Translation
        </button>
      </div>
    </div>
  );

  const actionsContent = (
    <div className="flex items-center justify-end gap-2 shrink-0">
      <button
        onClick={toggleTheme}
        className="p-2.5 rounded-2xl bg-surface-container-high hover:bg-surface-container-highest transition-colors text-on-surface-variant focus-visible:ring-2 focus-visible:ring-primary/40 outline-none"
        aria-label="Toggle theme"
      >
        {theme === "light" ? (
          <Moon className="w-5 h-5" />
        ) : (
          <Sun className="w-5 h-5" />
        )}
      </button>
      <button
        onClick={() => setShowSettings(!showSettings)}
        className={cn(
          "p-2.5 rounded-2xl bg-primary-container text-on-primary-container hover:opacity-90 transition-colors focus-visible:ring-2 focus-visible:ring-primary/40 outline-none",
          showSettings && "ring-2 ring-primary/30",
        )}
        aria-label="Settings"
      >
        <Settings
          className={cn(
            "w-5 h-5 transition-transform duration-300",
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-2">
        <div className="flex rounded-[28px] border border-outline/25 bg-surface-container/95 backdrop-blur-md px-5 py-3 items-center justify-between shadow-[0_4px_16px_rgba(22,27,45,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.15)]">
          {logoContent}
          {actionsContent}
        </div>
      </div>
    </header>
  );
}
