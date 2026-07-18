import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import {
  accentRgbToArgb,
  applyMaterialYouTheme,
  clearMaterialYouTheme,
  type AccentRgb,
} from "../utils/materialYou";
import { isTauriRuntime } from "../utils/platform";

export type ThemeMode = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";
export type PaletteSource = "system" | "brand";

interface ThemeContextValue {
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  paletteSource: PaletteSource;
  setPaletteSource: (source: PaletteSource) => void;
  systemAccentActive: boolean;
}

const STORAGE_KEY = "speechforge_theme_mode";
const LEGACY_STORAGE_KEY = "theme";
const PALETTE_STORAGE_KEY = "speechforge_palette_source";
const ACCENT_COLOR_CHANGED_EVENT = "system-accent-color-changed";
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getInitialMode(): ThemeMode {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "system" || stored === "light" || stored === "dark") {
    return stored;
  }

  const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (legacy === "light" || legacy === "dark") return legacy;
  return "system";
}

function getInitialPaletteSource(): PaletteSource {
  return localStorage.getItem(PALETTE_STORAGE_KEY) === "brand"
    ? "brand"
    : "system";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(getInitialMode);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);
  const [paletteSource, setPaletteSourceState] = useState<PaletteSource>(
    getInitialPaletteSource,
  );
  const [systemAccentActive, setSystemAccentActive] = useState(false);
  const resolvedTheme = mode === "system" ? systemTheme : mode;

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setSystemTheme(media.matches ? "dark" : "light");
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
    localStorage.setItem(STORAGE_KEY, mode);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  }, [mode, resolvedTheme]);

  useEffect(() => {
    localStorage.setItem(PALETTE_STORAGE_KEY, paletteSource);
  }, [paletteSource]);

  // Material You dynamic color: derive the whole palette from the desktop
  // accent color when available (Tauri on Linux). Falls back to the static
  // brand palette on web, Android, or when the system color is unreadable.
  useEffect(() => {
    if (paletteSource !== "system" || !isTauriRuntime()) {
      clearMaterialYouTheme();
      setSystemAccentActive(false);
      return;
    }

    let cancelled = false;
    let unlisten: UnlistenFn | undefined;

    const applyAccent = (rgb: AccentRgb) => {
      applyMaterialYouTheme(accentRgbToArgb(rgb));
      setSystemAccentActive(true);
    };

    invoke<AccentRgb>("get_system_accent_color")
      .then((rgb) => {
        if (!cancelled) applyAccent(rgb);
      })
      .catch((err) => {
        console.warn("[ThemeContext] System accent color unavailable:", err);
        if (cancelled) return;
        clearMaterialYouTheme();
        setSystemAccentActive(false);
      });

    listen<AccentRgb>(ACCENT_COLOR_CHANGED_EVENT, (event) => {
      if (!cancelled) applyAccent(event.payload);
    })
      .then((unsubscribe) => {
        if (cancelled) {
          unsubscribe();
        } else {
          unlisten = unsubscribe;
        }
      })
      .catch((err) => {
        console.warn("[ThemeContext] Accent color listener failed:", err);
      });

    return () => {
      cancelled = true;
      unlisten?.();
    };
  }, [paletteSource]);

  const setMode = useCallback((nextMode: ThemeMode) => {
    setModeState(nextMode);
  }, []);

  const toggleTheme = useCallback(() => {
    setModeState(resolvedTheme === "light" ? "dark" : "light");
  }, [resolvedTheme]);

  const setPaletteSource = useCallback((nextSource: PaletteSource) => {
    setPaletteSourceState(nextSource);
  }, []);

  const value = useMemo(
    () => ({
      mode,
      resolvedTheme,
      setMode,
      toggleTheme,
      paletteSource,
      setPaletteSource,
      systemAccentActive,
    }),
    [
      mode,
      resolvedTheme,
      setMode,
      toggleTheme,
      paletteSource,
      setPaletteSource,
      systemAccentActive,
    ],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}
