export type Status =
  | "idle"
  | "recording"
  | "processing"
  | "transcribing"
  | "done"
  | "error";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export type ChatStatus = "idle" | "thinking" | "error";

export type ActiveTab = "transcribe" | "translate" | "chat";
