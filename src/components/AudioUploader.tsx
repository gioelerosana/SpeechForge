import React, { useRef, useState } from "react";
import { FileAudio } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  AUDIO_FILE_INPUT_ACCEPT,
  isSupportedAudioFile,
  SUPPORTED_AUDIO_FORMATS_LABEL,
} from "../utils/audioFormats";
import { ERROR_MESSAGES } from "../constants/messages";

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

interface AudioUploaderProps {
  onFileSelected: (file: File) => Promise<void>;
  onError: (error: string) => void;
}

export function AudioUploader({ onFileSelected, onError }: AudioUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (!isSupportedAudioFile(file)) {
      onError(ERROR_MESSAGES.invalidAudioFile);
      return;
    }

    await onFileSelected(file);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!isSupportedAudioFile(file)) {
      onError(ERROR_MESSAGES.invalidAudioFile);
      return;
    }

    await onFileSelected(file);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => fileInputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          fileInputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className={cn(
        "group relative bg-surface-container p-8 rounded-[28px] shadow-[0_4px_18px_rgba(79,70,229,0.06)] border border-outline/35 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(79,70,229,0.18)] transition-all cursor-pointer flex flex-col items-center justify-center h-64 outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        isDragOver &&
          "ring-4 ring-primary/30 border-primary bg-primary-container/15",
      )}
      aria-label="Upload audio file"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={AUDIO_FILE_INPUT_ACCEPT}
        onChange={handleFileUpload}
        className="hidden"
      />
      <div className="w-16 h-16 bg-primary-container text-on-primary-container rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md shadow-primary-container/10">
        <FileAudio className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-extrabold text-on-surface">
        Upload Audio
      </h3>
      <p className="text-on-surface-variant text-center mt-2 text-sm leading-relaxed px-4">
        <span className="hidden md:inline">Click or drag and drop to select an audio file</span>
        <span className="md:hidden">Tap to choose an audio file</span>
        <br />
        <span className="text-xs opacity-75 font-medium">({SUPPORTED_AUDIO_FORMATS_LABEL})</span>
      </p>
    </div>
  );
}
