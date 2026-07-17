import type { Dispatch, ReactNode, SetStateAction } from "react";
import {
  AudioLines,
  ChevronDown,
  Languages,
  MessageSquare,
  Moon,
  Settings,
  Sun,
} from "lucide-react";
import type { ActiveTab } from "../types";
import { cn } from "../utils/cn";

interface AppHeaderProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
  tauriEnv: boolean;
  activeTab: ActiveTab;
  setActiveTab: Dispatch<SetStateAction<ActiveTab>>;
  showLogoMenu: boolean;
  setShowLogoMenu: Dispatch<SetStateAction<boolean>>;
  showSettings: boolean;
  setShowSettings: Dispatch<SetStateAction<boolean>>;
  handleGoHome: () => void;
  settingsPanel: ReactNode;
}

export function AppHeader({
  theme,
  toggleTheme,
  tauriEnv,
  activeTab,
  setActiveTab,
  showLogoMenu,
  setShowLogoMenu,
  showSettings,
  setShowSettings,
  handleGoHome,
  settingsPanel,
}: AppHeaderProps) {
  return (
      <header
        className={cn(
          "sticky z-10 transition-colors duration-200 mb-14",
          tauriEnv ? "top-8" : "top-0 pt-[env(safe-area-inset-top)]",
        )}
      >
        <div
          className={cn("max-w-4xl mx-auto px-4 sm:px-6", tauriEnv ? "py-2" : "py-4")}
        >
          {(() => {
            const logoContent = (
              <div className="relative">
                <div className="flex items-center gap-3">
                  {/* Home Button (Logo Icon) */}
                  <button
                    onClick={handleGoHome}
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-[var(--md-sys-color-on-primary)] bg-[var(--md-sys-color-primary)] shadow-[0_8px_18px_rgba(39,80,196,0.30)] hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer border-none outline-none select-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]/50 focus-visible:ring-offset-2"
                    aria-label="SpeechForge Home"
                  >
                    <AudioLines className="w-5 h-5" />
                  </button>

                  {/* Brand & Mode Stack */}
                  <div className="flex flex-col items-start sm:flex-row sm:items-center gap-0.5 sm:gap-2.5 leading-none">
                    {/* Brand Name Button */}
                    <button
                      onClick={handleGoHome}
                      className="text-lg font-extrabold tracking-tight text-[var(--md-sys-color-on-surface)] hover:text-[var(--md-sys-color-primary)] transition-colors duration-200 cursor-pointer border-none bg-transparent p-0 outline-none select-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]/50 rounded-lg"
                    >
                      SpeechForge
                    </button>

                    {/* Dot Separator (desktop only) */}
                    <span className="hidden sm:inline text-[var(--md-sys-color-on-surface-variant)]/40 font-normal select-none" aria-hidden="true">
                      ·
                    </span>

                    {/* Mode Dropdown Trigger Button */}
                    <button
                      onClick={() => setShowLogoMenu(!showLogoMenu)}
                      className="flex items-center gap-1 sm:gap-1.5 text-sm sm:text-lg font-bold sm:font-extrabold tracking-tight cursor-pointer border-none bg-transparent p-0 outline-none select-none group/toggle focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]/50 rounded-xl py-0.5 sm:py-1 px-1 -mx-1"
                      aria-label="Toggle Mode Menu"
                      aria-expanded={showLogoMenu}
                    >
                      <span className={cn(
                        "transition-colors duration-200",
                        activeTab === "transcribe"
                          ? "text-[var(--md-sys-color-primary)] group-hover/toggle:opacity-80"
                          : activeTab === "chat"
                            ? "text-[var(--md-sys-color-secondary)] group-hover/toggle:opacity-80"
                            : "text-[var(--md-sys-color-tertiary)] group-hover/toggle:opacity-80"
                      )}>
                        {activeTab === "transcribe" ? "Transcribe" : activeTab === "chat" ? "Chat" : "Translate"}
                      </span>
                      <ChevronDown className={cn(
                        "w-3.5 h-3.5 sm:w-4 h-4 text-[var(--md-sys-color-on-surface-variant)] opacity-50 transition-all duration-200 group-hover/toggle:opacity-80",
                        showLogoMenu && "rotate-180 opacity-100"
                      )} />
                    </button>
                  </div>
                </div>
              </div>
            );

            const actionsContent = (
              <div className="flex items-center justify-end gap-2 shrink-0">
                <button
                  onClick={toggleTheme}
                  className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container-high)] hover:bg-[var(--md-sys-color-surface-container-highest)] transition-colors text-[var(--md-sys-color-on-surface-variant)]"
                  aria-label="Toggle theme"
                >
                  {theme === "light" ? (
                    <Moon className="w-6 h-6" />
                  ) : (
                    <Sun className="w-6 h-6" />
                  )}
                </button>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={cn(
                    "p-2.5 rounded-2xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] hover:opacity-90 transition-colors",
                    showSettings &&
                      "shadow-[0_0_0_2px_color-mix(in_oklab,var(--md-sys-color-primary)_35%,transparent)]",
                  )}
                  aria-label="Settings"
                >
                  <Settings
                    className={cn(
                      "w-6 h-6 transition-transform duration-200",
                      showSettings && "rotate-90",
                    )}
                  />
                </button>
              </div>
            );

            const pillClass =
              "rounded-[28px] border border-[color:var(--md-sys-color-outline)]/20 bg-[var(--md-sys-color-surface-container)]/90 backdrop-blur-sm px-5 shadow-[0_4px_16px_rgba(22,27,45,0.08)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.20)]";
            const paddingClass = tauriEnv ? "py-2" : "py-4";

            return (
              <div
                className={cn(
                  "flex flex-col gap-4 relative",
                  pillClass,
                  paddingClass,
                  "transition-all duration-300",
                )}
              >
                {/* Header Row */}
                <div className="flex items-center justify-between w-full gap-3 relative z-40">
                  {logoContent}
                  {actionsContent}
                </div>

                {/* Dropdown Options (renders inline, expanding the card) */}
                {showLogoMenu && (
                  <div className="w-full pt-1 relative z-40 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-1 pb-1.5 text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] opacity-50 uppercase tracking-wider">
                      Modalità
                    </div>
                    <div className="flex flex-col gap-1">
                      {/* Transcribe Button */}
                      <button
                        onClick={handleGoHome}
                        className={cn(
                          "w-full flex items-center justify-between p-2.5 rounded-2xl transition-all duration-150 hover:bg-[var(--md-sys-color-surface-container-highest)] cursor-pointer text-left",
                          activeTab === "transcribe"
                            ? "bg-[var(--md-sys-color-primary-container)]/10"
                            : "",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-9 h-9 rounded-full flex items-center justify-center transition-colors",
                            activeTab === "transcribe"
                              ? "bg-[var(--md-sys-color-primary)]/10 text-[var(--md-sys-color-primary)]"
                              : "bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)]"
                          )}>
                            <AudioLines className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className={cn(
                              "text-sm font-bold",
                              activeTab === "transcribe" ? "text-[var(--md-sys-color-primary)]" : "text-[var(--md-sys-color-on-surface)]"
                            )}>
                              Transcribe
                            </span>
                            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] opacity-60 leading-none mt-0.5">
                              Audio &rarr; testo
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {activeTab === "transcribe" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--md-sys-color-primary)] mr-1" />
                          )}
                        </div>
                      </button>

                      {/* Translate Button */}
                      <button
                        onClick={() => {
                          setActiveTab("translate");
                          setShowLogoMenu(false);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between p-2.5 mt-1 rounded-2xl transition-all duration-150 hover:bg-[var(--md-sys-color-surface-container-highest)] cursor-pointer text-left",
                          activeTab === "translate"
                            ? "bg-[var(--md-sys-color-tertiary-container)]/10"
                            : "",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-9 h-9 rounded-full flex items-center justify-center transition-colors",
                            activeTab === "translate"
                              ? "bg-[var(--md-sys-color-tertiary)]/10 text-[var(--md-sys-color-tertiary)]"
                              : "bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)]"
                          )}>
                            <Languages className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className={cn(
                              "text-sm font-bold",
                              activeTab === "translate" ? "text-[var(--md-sys-color-tertiary)]" : "text-[var(--md-sys-color-on-surface)]"
                            )}>
                              Translate
                            </span>
                            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] opacity-60 leading-none mt-0.5">
                              Testo &rarr; lingua
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {activeTab === "translate" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--md-sys-color-tertiary)] mr-1" />
                          )}
                        </div>
                      </button>

                      {/* Chat Button */}
                      <button
                        onClick={() => {
                          setActiveTab("chat");
                          setShowLogoMenu(false);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between p-2.5 mt-1 rounded-2xl transition-all duration-150 hover:bg-[var(--md-sys-color-surface-container-highest)] cursor-pointer text-left",
                          activeTab === "chat"
                            ? "bg-[var(--md-sys-color-secondary-container)]/10"
                            : "",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-9 h-9 rounded-full flex items-center justify-center transition-colors",
                            activeTab === "chat"
                              ? "bg-[var(--md-sys-color-secondary)]/10 text-[var(--md-sys-color-secondary)]"
                              : "bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)]"
                          )}>
                            <MessageSquare className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className={cn(
                              "text-sm font-bold",
                              activeTab === "chat" ? "text-[var(--md-sys-color-secondary)]" : "text-[var(--md-sys-color-on-surface)]"
                            )}>
                              Chat
                            </span>
                            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] opacity-60 leading-none mt-0.5">
                              Chiedi a Mistral
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {activeTab === "chat" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--md-sys-color-secondary)] mr-1" />
                          )}
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Click-away Overlay */}
                {showLogoMenu && (
                  <div 
                    className="fixed inset-0 z-30 cursor-default" 
                    onClick={() => setShowLogoMenu(false)}
                  />
                )}
              </div>
            );
          })()}
          {settingsPanel}
        </div>
      </header>
  );
}

