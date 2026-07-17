import { useCallback, useEffect, useState } from "react";
import { Copy, Minus, Square, X } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useLocale } from "../context/LocaleContext";
import { isTauriRuntime } from "../utils/platform";

export function TitleBar() {
  const { copy } = useLocale();
  const [isMaximized, setIsMaximized] = useState(false);
  const isTauri = isTauriRuntime();

  const refreshMaximized = useCallback(async () => {
    try {
      setIsMaximized(await getCurrentWindow().isMaximized());
    } catch (err: unknown) {
      console.error("[TitleBar] Error reading maximized state:", err);
    }
  }, []);

  useEffect(() => {
    if (!isTauri) return;
    void refreshMaximized();
    const unlistenPromise = getCurrentWindow().onResized(() => {
      void refreshMaximized();
    });
    return () => {
      void unlistenPromise.then((unlisten) => unlisten());
    };
  }, [isTauri, refreshMaximized]);

  if (!isTauri) return null;

  const handleMinimize = async () => {
    try {
      await getCurrentWindow().minimize();
    } catch (err: unknown) {
      console.error("[TitleBar] Error minimizing window:", err);
    }
  };

  const handleMaximize = async () => {
    try {
      await getCurrentWindow().toggleMaximize();
      await refreshMaximized();
    } catch (err: unknown) {
      console.error("[TitleBar] Error toggling maximized state:", err);
    }
  };

  const handleClose = async () => {
    try {
      await getCurrentWindow().close();
    } catch (err: unknown) {
      console.error("[TitleBar] Error closing window:", err);
    }
  };

  const startDrag = async () => {
    try {
      await getCurrentWindow().startDragging();
    } catch (err: unknown) {
      console.error("[TitleBar] Error starting window drag:", err);
    }
  };

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex h-8 select-none items-center border-b border-outline-variant bg-surface-container-low text-on-surface-variant">
      <div
        data-tauri-drag-region
        className="flex h-full flex-1 items-center px-4"
        onMouseDown={(event) => {
          if (event.button === 0) void startDrag();
        }}
        onDoubleClick={() => void handleMaximize()}
      >
        <span className="pointer-events-none text-xs font-bold tracking-wide">SpeechForge</span>
      </div>
      <div className="flex h-full" onMouseDown={(event) => event.stopPropagation()}>
        <button
          type="button"
          aria-label={copy.window.minimize}
          onClick={() => void handleMinimize()}
          className="flex h-full w-11 items-center justify-center transition-colors hover:bg-surface-container-highest focus-visible:z-10"
        >
          <Minus className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={isMaximized ? copy.window.restore : copy.window.maximize}
          onClick={() => void handleMaximize()}
          className="flex h-full w-11 items-center justify-center transition-colors hover:bg-surface-container-highest focus-visible:z-10"
        >
          {isMaximized ? (
            <Copy className="size-3.5 rotate-180" aria-hidden="true" />
          ) : (
            <Square className="size-3.5" aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          aria-label={copy.window.close}
          onClick={() => void handleClose()}
          className="flex h-full w-11 items-center justify-center transition-colors hover:bg-error hover:text-on-error focus-visible:z-10"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
