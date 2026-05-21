import React, { useMemo } from "react";
import { Mic, StopCircle } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

interface AudioRecorderProps {
  isRecording: boolean;
  recordingDuration: number;
  onStart: () => Promise<void>;
  onStop: () => Promise<void>;
}

export function AudioRecorder({
  isRecording,
  recordingDuration,
  onStart,
  onStop,
}: AudioRecorderProps) {
  const visualizerBars = useMemo(
    () => Array.from({ length: 12 }, (_, index) => index),
    [],
  );

  // Format seconds to mm:ss
  const formattedTime = useMemo(() => {
    const minutes = Math.floor(recordingDuration / 60);
    const seconds = recordingDuration % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }, [recordingDuration]);

  if (!isRecording) {
    return (
      <button
        onClick={onStart}
        className="group bg-surface-container p-8 rounded-[28px] shadow-[0_4px_18px_rgba(239,68,68,0.06)] border border-outline/35 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(239,68,68,0.18)] transition-all cursor-pointer flex flex-col items-center justify-center h-64 outline-none focus-visible:ring-2 focus-visible:ring-error/40 text-center"
      >
        <div className="w-16 h-16 bg-rose-200/80 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md shadow-rose-200/10">
          <Mic className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-extrabold text-on-surface">
          Record Voice
        </h3>
        <p className="text-on-surface-variant mt-2 text-sm">
          Tap to start recording
        </p>
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 bg-surface-container rounded-[32px] border border-rose-400/20 shadow-[0_12px_36px_rgba(239,68,68,0.12)] animate-in fade-in zoom-in-95 duration-300 w-full">
      <div className="relative mb-6">
        <div className="w-20 h-20 bg-rose-600 rounded-[24px] flex items-center justify-center shadow-lg shadow-rose-600/30 animate-pulse">
          <Mic className="w-9 h-9 text-white" />
        </div>
        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
        </span>
      </div>

      <h2 className="text-2xl font-black text-on-surface tracking-tight mb-1">
        Recording...
      </h2>
      
      {/* Digital clock timer */}
      <div className="text-4xl font-mono font-black text-rose-600 dark:text-rose-400 tracking-wider mb-6">
        {formattedTime}
      </div>

      <p className="text-on-surface-variant text-sm text-center mb-8 max-w-xs leading-relaxed">
        Speak clearly into your microphone.
      </p>

      {/* Visualizer bars */}
      <div className="flex items-end gap-1.5 h-12 mb-10" aria-hidden="true">
        {visualizerBars.map((bar) => (
          <span
            key={bar}
            className="w-1 bg-rose-600 dark:bg-rose-500 rounded-full transition-all duration-150"
            style={{
              height: `${4 + Math.sin(bar * 0.5) * 8}px`,
              animation: `audio-pulse 1.2s ease-in-out infinite alternate`,
              animationDelay: `${bar * 0.08}s`,
            }}
          />
        ))}
      </div>

      <button
        onClick={onStop}
        className="bg-rose-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-rose-700 active:scale-[0.98] flex items-center gap-2.5 shadow-md shadow-rose-600/20 transition-all hover:scale-[1.03] outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40"
      >
        <StopCircle className="w-5 h-5" /> Stop Recording
      </button>
    </div>
  );
}
