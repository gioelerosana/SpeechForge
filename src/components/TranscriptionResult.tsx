import React from "react";
import { Check, Copy, Save, Languages, RefreshCw } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

interface TranscriptionResultProps {
  transcription: string;
  onChange: (text: string) => void;
  onCopy: () => void;
  isCopied: boolean;
  onDownload: () => void;
  onReset: () => void;
  onTranslate: () => void;
  deepLKeyConfigured: boolean;
}

export function TranscriptionResult({
  transcription,
  onChange,
  onCopy,
  isCopied,
  onDownload,
  onReset,
  onTranslate,
  deepLKeyConfigured,
}: TranscriptionResultProps) {
  return (
    <div className="bg-surface-container rounded-[30px] shadow-[0_8px_24px_rgba(79,70,229,0.06)] border border-outline/35 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 w-full">
      {/* Header Bar */}
      <div className="bg-surface-container-high px-6 py-4 border-b border-outline/25 flex justify-between items-center">
        <h3 className="font-extrabold text-on-surface tracking-tight">
          Transcription Result
        </h3>
        <div className="flex gap-2">
          <button
            onClick={onCopy}
            className={cn(
              "p-2.5 hover:bg-surface-container-highest rounded-xl transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
              isCopied ? "text-primary" : "text-on-surface-variant",
            )}
            title={isCopied ? "Copied" : "Copy"}
            aria-label={isCopied ? "Copied to clipboard" : "Copy to clipboard"}
          >
            {isCopied ? (
              <Check className="w-5 h-5" />
            ) : (
              <Copy className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={onDownload}
            className="p-2.5 hover:bg-surface-container-highest rounded-xl text-on-surface-variant transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            title="Save as TXT"
            aria-label="Save as TXT file"
          >
            <Save className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="p-6">
        <textarea
          value={transcription}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-96 p-4 rounded-2xl text-on-surface bg-surface leading-relaxed outline-none resize-none border border-outline/35 focus:ring-2 focus:ring-primary/40 transition-all font-sans text-base scrollbar-thin"
          placeholder="Transcription text will appear here..."
        />
      </div>

      {/* Footer Bar */}
      <div className="bg-surface-container-high px-6 py-4 border-t border-outline/25 flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 text-primary hover:text-primary-container text-sm font-bold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <RefreshCw className="w-4 h-4" />
          Transcribe Another File
        </button>
        
        <button
          onClick={onTranslate}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] outline-none focus-visible:ring-2",
            deepLKeyConfigured
              ? "bg-tertiary-container text-on-tertiary-container hover:opacity-95 focus-visible:ring-tertiary/40"
              : "bg-surface-container-highest text-on-surface-variant hover:opacity-80 focus-visible:ring-outline/40",
          )}
          title={
            deepLKeyConfigured
              ? "Translate with DeepL"
              : "Configure DeepL API key in settings to enable translation"
          }
        >
          <Languages className="w-4 h-4" />
          Translate result
        </button>
      </div>
    </div>
  );
}
