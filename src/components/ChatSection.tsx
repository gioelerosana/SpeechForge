import React, { useState, useRef, useEffect, useCallback } from "react";
import { MessageSquare, Send, Loader2, Trash2, ChevronDown, AlertTriangle } from "lucide-react";
import { cn } from "../utils/cn";
import { MistralClient, type ChatMessage, type ChatOptions } from "../services/mistral/MistralClient";

interface ChatSectionProps {
  apiKey: string;
  initialContext?: string;
  onDirtyChange?: (dirty: boolean) => void;
}

export function ChatSection({ apiKey, initialContext, onDirtyChange }: ChatSectionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [status, setStatus] = useState<"idle" | "thinking" | "error">("idle");
  const [error, setError] = useState<string>("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Inizializza con contesto se fornito
  useEffect(() => {
    if (initialContext && messages.length === 0) {
      setMessages([{
        role: "system",
        content: `Contesto: il seguente è un transcript audio. Rispondi alle domande dell'utente basandoti su questo:\n\n${initialContext}`
      }]);
    }
  }, [initialContext, messages.length]);

  // Scroll a fine messaggi
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    onDirtyChange?.(messages.some((message) => message.role !== "system"));
  }, [messages, onDirtyChange]);

  // Focus input all'apertura
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim() || !apiKey) return;

    setError("");
    setStatus("thinking");

    const userMessage: ChatMessage = { role: "user", content: inputValue.trim() };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInputValue("");

    try {
      const client = new MistralClient(apiKey);
      const options: ChatOptions = {
        model: "mistral-small-latest",
        temperature: 0.7,
        maxTokens: 1024,
      };

      const response = await client.chat(newMessages, options);
      const assistantMessage: ChatMessage = { role: "assistant", content: response };
      setMessages([...newMessages, assistantMessage]);
      setStatus("idle");
    } catch (err: unknown) {
      console.error("[ChatSection] Error sending message:", err);
      setStatus("error");
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
    }
  };

  const handleClear = useCallback(() => {
    setMessages([]);
    setInputValue("");
    setError("");
    setStatus("idle");
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const hasContext = messages.some((m) => m.role === "system");

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-[var(--md-sys-color-surface-container)] rounded-[30px] shadow-[0_8px_24px_rgba(27,34,57,0.10)] border border-[color:var(--md-sys-color-outline)]/30 overflow-hidden">
        {/* Header */}
        <div className="bg-[var(--md-sys-color-surface-container-high)] px-6 py-4 border-b border-[color:var(--md-sys-color-outline)]/30 flex justify-between items-center">
          <h3 className="font-bold text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Chat with Mistral
          </h3>
        </div>

        {/* Messages Area */}
        <div className="p-6 max-h-[60vh] md:max-h-[70vh] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="w-12 h-12 text-[var(--md-sys-color-on-surface-variant)] opacity-50 mb-4" />
              <p className="text-[var(--md-sys-color-on-surface-variant)] text-sm">
                {hasContext 
                  ? "Il transcript è stato caricato come contesto. Scrivi una domanda per iniziare."
                  : "Inizia una conversazione con Mistral AI."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex gap-3 p-4 rounded-2xl",
                    msg.role === "system"
                      ? "bg-[var(--md-sys-color-surface-container-highest)] border border-[color:var(--md-sys-color-outline)]/20"
                      : msg.role === "user"
                        ? "bg-[var(--md-sys-color-primary-container)]/20"
                        : "bg-[var(--md-sys-color-surface-container-high)]"
                  )}
                >
                  <div className="flex-shrink-0">
                    {msg.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary)] flex items-center justify-center">
                        <span className="text-[var(--md-sys-color-on-primary)] text-xs font-bold">U</span>
                      </div>
                    )}
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-secondary-container)] flex items-center justify-center">
                        <span className="text-[var(--md-sys-color-on-secondary-container)] text-xs font-bold">M</span>
                      </div>
                    )}
                    {msg.role === "system" && (
                      <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-tertiary-container)] flex items-center justify-center">
                        <span className="text-[var(--md-sys-color-on-tertiary-container)] text-xs font-bold">C</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 whitespace-pre-wrap break-words">
                    <p className={cn(
                      "text-sm",
                      msg.role === "system" && "text-[var(--md-sys-color-on-surface-variant)] italic"
                    )}>
                      {msg.content}
                    </p>
                  </div>
                </div>
              ))}
              {status === "thinking" && (
                <div className="flex gap-3 p-4 rounded-2xl bg-[var(--md-sys-color-surface-container-high)]">
                  <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-secondary-container)] flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-[var(--md-sys-color-on-secondary-container)]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
                      Thinking...
                    </p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="px-6 pb-4">
            <div className="bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] p-3 rounded-xl border border-red-300/40 flex items-center gap-2 text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="bg-[var(--md-sys-color-surface-container-high)] px-6 py-4 border-t border-[color:var(--md-sys-color-outline)]/30">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={hasContext ? "Chiedi qualcosa sul transcript..." : "Scrivi un messaggio..."}
              disabled={status === "thinking" || !apiKey}
              className="flex-1 p-3 rounded-2xl border border-[color:var(--md-sys-color-outline)]/40 bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] placeholder:text-[var(--md-sys-color-on-surface-variant)] resize-none max-h-[120px] min-h-[44px] focus:ring-2 focus:ring-[var(--md-sys-color-primary)]/50 outline-none disabled:opacity-50"
              rows={1}
            />
            <button
              onClick={() => void handleSend()}
              disabled={!inputValue.trim() || status === "thinking" || !apiKey}
              className="shrink-0 w-12 h-12 rounded-2xl bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] flex items-center justify-center hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {status === "thinking" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <div className="flex justify-between items-center mt-2">
            <button
              onClick={handleClear}
              disabled={messages.length === 0}
              className="flex items-center gap-1.5 text-sm text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
