import React from "react";
import { Loader2, AudioLines } from "lucide-react";

interface ProcessingPanelProps {
  progress: string;
}

export function ProcessingPanel({ progress }: ProcessingPanelProps) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 bg-surface-container rounded-[32px] border border-outline/35 shadow-[0_12px_36px_rgba(79,70,229,0.1)] animate-in fade-in zoom-in-95 duration-300 w-full text-center">
      <div className="relative mb-6 flex items-center justify-center">
        {/* Outer glowing ring */}
        <div className="absolute inset-0 rounded-full bg-primary/10 blur-md animate-pulse" />
        
        {/* Loader spinner */}
        <Loader2 className="w-16 h-16 text-primary animate-spin" />
        
        {/* Centered small icon */}
        <AudioLines className="absolute w-6 h-6 text-primary" />
      </div>

      <h2 className="text-2xl font-black text-on-surface tracking-tight mb-2">
        Processing Audio
      </h2>
      
      <div className="h-6 flex items-center justify-center">
        <p className="text-on-surface-variant font-medium animate-pulse text-base">
          {progress || "Initializing..."}
        </p>
      </div>
    </div>
  );
}
