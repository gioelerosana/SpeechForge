import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { AlertTriangle, FileText, Loader2, MessageSquare, Send, Trash2 } from "lucide-react";
import { useLocale } from "../context/LocaleContext";
import { MistralClient, type ChatMessage, type ChatOptions } from "../services/mistral/MistralClient";
import { cn } from "../utils/cn";
import { Button, Card, IconButton } from "./ui";

interface ChatSectionProps {
  apiKey: string;
  initialContext?: string;
  onDirtyChange?: (dirty: boolean) => void;
}

export function ChatSection({ apiKey, initialContext = "", onDirtyChange }: ChatSectionProps) {
  const { copy } = useLocale();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [status, setStatus] = useState<"idle" | "thinking" | "error">("idle");
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatRunRef = useRef(0);

  const contextMessage = useCallback(
    (): ChatMessage => ({ role: "system", content: copy.chat.systemContext(initialContext) }),
    [copy.chat, initialContext],
  );

  useEffect(() => {
    if (!initialContext) return;
    setMessages((current) =>
      current.some((message) => message.role !== "system") ? current : [contextMessage()],
    );
  }, [contextMessage, initialContext]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    onDirtyChange?.(messages.some((message) => message.role !== "system"));
  }, [messages, onDirtyChange]);

  useEffect(() => {
    inputRef.current?.focus();
    return () => {
      chatRunRef.current += 1;
    };
  }, []);

  const handleSend = async () => {
    const content = inputValue.trim();
    if (!content || !apiKey || status === "thinking") return;

    const runId = ++chatRunRef.current;
    const userMessage: ChatMessage = { role: "user", content };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInputValue("");
    setError("");
    setStatus("thinking");

    try {
      const options: ChatOptions = {
        model: "mistral-small-latest",
        temperature: 0.7,
        maxTokens: 1024,
      };
      const response = await new MistralClient(apiKey).chat(nextMessages, options);
      if (chatRunRef.current !== runId) return;
      setMessages([...nextMessages, { role: "assistant", content: response }]);
      setStatus("idle");
    } catch (err: unknown) {
      if (chatRunRef.current !== runId) return;
      console.error("[ChatSection] Error sending message:", err);
      setError(err instanceof Error && err.message ? err.message : copy.chat.unknownError);
      setStatus("error");
    }
  };

  const handleClear = () => {
    chatRunRef.current += 1;
    setMessages(initialContext ? [contextMessage()] : []);
    setInputValue("");
    setError("");
    setStatus("idle");
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  const visibleMessages = messages.filter((message) => message.role !== "system");
  const hasContext = messages.some((message) => message.role === "system");

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-primary">Mistral AI</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
          {copy.chat.title}
        </h1>
        <p className="mt-3 text-base leading-7 text-on-surface-variant">{copy.chat.subtitle}</p>
      </header>

      {hasContext && (
        <div className="flex items-start gap-3 rounded-[var(--sf-shape-lg)] bg-tertiary-container px-5 py-4 text-on-tertiary-container">
          <FileText className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-extrabold">{copy.chat.contextAttached}</p>
            <p className="mt-1 text-sm opacity-80">{copy.chat.contextHint}</p>
          </div>
        </div>
      )}

      <Card variant="elevated" className="overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-outline-variant bg-surface-container-high px-5 py-4 sm:px-7">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-[var(--sf-shape-md)] bg-secondary-container text-on-secondary-container">
              <MessageSquare className="size-5" aria-hidden="true" />
            </span>
            <h2 className="font-extrabold text-on-surface">{copy.chat.title}</h2>
          </div>
          <Button
            size="sm"
            variant="text"
            leadingIcon={Trash2}
            onClick={handleClear}
            disabled={!visibleMessages.length && !inputValue}
          >
            {copy.chat.clear}
          </Button>
        </div>

        <div className="min-h-80 max-h-[55vh] overflow-y-auto p-5 sm:p-7" aria-live="polite">
          {visibleMessages.length === 0 && status !== "thinking" ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center text-on-surface-variant">
              <MessageSquare className="size-10 opacity-50" aria-hidden="true" />
              <p className="mt-4 max-w-md text-sm">
                {hasContext ? copy.chat.contextHint : copy.chat.empty}
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {visibleMessages.map((message, index) => {
                const isUser = message.role === "user";
                return (
                  <div
                    key={`${message.role}-${index}`}
                    className={cn("flex gap-3", isUser && "flex-row-reverse")}
                  >
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-[var(--sf-shape-full)] text-xs font-extrabold",
                        isUser
                          ? "bg-primary text-on-primary"
                          : "bg-secondary-container text-on-secondary-container",
                      )}
                      aria-hidden="true"
                    >
                      {isUser ? copy.chat.userLabel.slice(0, 1) : "M"}
                    </span>
                    <div className={cn("max-w-[82%]", isUser && "text-right")}>
                      <p className="mb-1 text-xs font-bold text-on-surface-variant">
                        {isUser ? copy.chat.userLabel : copy.chat.assistantLabel}
                      </p>
                      <p
                        className={cn(
                          "whitespace-pre-wrap break-words rounded-[var(--sf-shape-lg)] px-4 py-3 text-left text-sm leading-6",
                          isUser
                            ? "rounded-tr-[var(--sf-shape-xs)] bg-primary-container text-on-primary-container"
                            : "rounded-tl-[var(--sf-shape-xs)] bg-surface-container-high text-on-surface",
                        )}
                      >
                        {message.content}
                      </p>
                    </div>
                  </div>
                );
              })}

              {status === "thinking" && (
                <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                  <span className="flex size-9 items-center justify-center rounded-[var(--sf-shape-full)] bg-secondary-container text-on-secondary-container">
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  </span>
                  {copy.chat.thinking}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {error && (
          <div className="px-5 pb-4 sm:px-7">
            <div role="alert" className="flex items-start gap-2 rounded-[var(--sf-shape-md)] bg-error-container px-4 py-3 text-sm text-on-error-container">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="border-t border-outline-variant bg-surface-container-high p-4 sm:px-7 sm:py-5">
          <div className="flex items-end gap-2 rounded-[var(--sf-shape-lg)] border border-outline-variant bg-surface p-2 focus-within:border-primary">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={hasContext ? copy.chat.placeholderWithContext : copy.chat.placeholder}
              disabled={status === "thinking" || !apiKey}
              rows={1}
              className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-on-surface outline-none placeholder:text-on-surface-variant/70 disabled:opacity-50"
            />
            <IconButton
              variant="filled"
              aria-label={copy.chat.send}
              onClick={() => void handleSend()}
              disabled={!inputValue.trim() || status === "thinking" || !apiKey}
            >
              {status === "thinking" ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Send className="size-5" />
              )}
            </IconButton>
          </div>
        </div>
      </Card>
    </div>
  );
}
